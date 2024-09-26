import json
from typing import Any, Dict, cast
from urllib.parse import urljoin

import msal
import requests
from azure.identity import get_bearer_token_provider
from requests import HTTPError

from api.common.config import logger
from api.common.types import ConfigSingletonClass, config

API_VERSION = "2023-11-01-preview"
BUFFER = 0.0001


class AdmaClient:
    DEFAULT_TIMEOUT = 120
    """Default timeout for requests."""

    NEXT_PAGES_LIMIT = 100000
    """Maximum number of pages to retrieve in a single request."""

    CONTENT_TAG = "value"
    """Tag for the content of the response."""

    LINK_TAG = "nextLink"
    """Tag for the next link of the response."""

    def __init__(
        self,
        base_url: str,
        client_id: str,
        client_secret: str,
        authority: str,
        default_scope: str,
        api_version: str = API_VERSION,
    ):
        self.base_url = base_url
        self.client_id = client_id
        self.client_secret = client_secret
        self.authority = authority
        self.default_scope = default_scope
        self.token = self.get_token()

        self.api_version = api_version
        self.session = requests.Session()
        self.session.headers.update(self.get_header())

    def get_token(self):
        if self.client_secret:
            return self.get_adma_aad_token()
        else:
            token_provider = get_bearer_token_provider(
                config.acquire_credential(), config.adma_scope
            )
            return token_provider()

    def get_adma_aad_token(self):
        app = msal.ConfidentialClientApplication(
            client_id=self.client_id,
            client_credential=self.client_secret,
            authority=self.authority,
        )

        app.acquire_token_silent(scopes=[self.default_scope], account=None)

        token_result = cast(
            Dict[str, Any], app.acquire_token_for_client(scopes=self.default_scope)
        )
        if "access_token" in token_result:
            return token_result["access_token"]
        else:
            message = {
                "error": token_result.get("error"),
                "description": token_result.get("error_description"),
                "correlationId": token_result.get("correlation_id"),
            }

            raise Exception(message)

    def get_header(self) -> Dict[str, str]:
        header: Dict[str, str] = {
            "Authorization": "Bearer " + self.token,
            "Content-Type": "application/merge-patch+json",
        }

        return header

    def _try_request(
        self,
        method: str,
        endpoint: str,
        data: Dict[str, Any] = {},
        *args: Any,
        **kwargs: Any,
    ) -> Any:
        resp = self.session.request(
            method, urljoin(self.base_url, endpoint), *args, **kwargs, json=data
        )
        try:
            r = json.loads(resp.text)
        except json.JSONDecodeError:
            r = resp.text
        try:
            resp.raise_for_status()
        except HTTPError as e:
            error_message = r.get("message", "") if isinstance(r, dict) else r
            msg = f"{e}. {error_message}"
            raise HTTPError(msg, response=e.response)
        return cast(Any, r)

    def _request(
        self,
        method: str,
        endpoint: str,
        data: Dict[str, Any] = {},
        *args: Any,
        **kwargs: Any,
    ):
        try:
            return self._try_request(method, endpoint, data, *args, **kwargs)
        except HTTPError as e:
            if e.response.status_code == 401:
                self.token = self.get_token()
                self.session.headers.update(self.get_header())
                return self._try_request(method, endpoint, data, *args, **kwargs)
            raise e

    def _iterate(self, response: Dict[str, Any]):
        visited_next_links = set()

        composed_response = {self.CONTENT_TAG: response[self.CONTENT_TAG]}
        next_link = "" if self.LINK_TAG not in response else response[self.LINK_TAG]
        next_link_index = 0
        while next_link:
            if next_link in visited_next_links:
                raise RuntimeError(
                    f"Repeated nextLink {next_link} in ADMAg get request"
                )

            if next_link_index >= self.NEXT_PAGES_LIMIT:
                raise RuntimeError(f"Next pages limit {self.NEXT_PAGES_LIMIT} exceded")
            tmp_response = self._request(
                "GET",
                next_link,
                timeout=self.DEFAULT_TIMEOUT,
            )
            if self.CONTENT_TAG in tmp_response:
                composed_response[self.CONTENT_TAG].extend(
                    tmp_response[self.CONTENT_TAG]
                )
            visited_next_links.add(next_link)
            next_link_index = next_link_index + 1
            next_link = (
                "" if self.LINK_TAG not in tmp_response else tmp_response[self.LINK_TAG]
            )
        response = composed_response
        return response

    def _get(self, endpoint: str, params: Dict[str, Any] = {}):
        request_params = {"api-version": self.api_version}
        request_params.update(params)
        response = self._request(
            "GET",
            endpoint,
            params=request_params,
            timeout=self.DEFAULT_TIMEOUT,
        )

        if self.CONTENT_TAG in response:
            self._iterate(response)

        return response

    def _post(
        self, endpoint: str, params: Dict[str, Any] = {}, data: Dict[str, Any] = {}
    ) -> Dict[str, Any]:
        request_params = {"api-version": self.api_version, "maxPageSize": 1000}
        request_params.update(params)
        response = self._request(
            "POST",
            endpoint,
            params=request_params,
            timeout=self.DEFAULT_TIMEOUT,
            data=data,
        )

        if self.CONTENT_TAG in response:
            response = self._iterate(response)
        return response

    def _patch(
        self, endpoint: str, params: Dict[str, Any] = {}, data: Dict[str, Any] = {}
    ) -> Dict[str, Any]:
        request_params = {"api-version": self.api_version}
        request_params.update(params)
        response = self._request(
            "PATCH",
            endpoint,
            params=request_params,
            timeout=self.DEFAULT_TIMEOUT,
            data=data,
        )
        return response

    def list_parties(self) -> Dict[str, Any]:
        endpoint = "/parties"
        return self._get(
            endpoint,
            params={},
        )

    def create_party(
        self,
        party_id: str,
        party_name: str,
        party_description: str = "",
        properties: dict = {},
        source: str = "",
        status: str = "",
    ) -> Dict[str, Any]:
        endpoint = f"/parties/{party_id}"
        data = {
            "name": party_name,
            "description": party_description,
            "properties": properties,
        }

        if source:
            data["source"] = source
        if status:
            data["status"] = status

        return self._patch(endpoint=endpoint, data=data)

    def get_party(self, party_id: str) -> Dict[str, Any]:
        # Write the code for get_party
        endpoint = f"/parties/{party_id}"
        return self._get(
            endpoint,
            params={},
        )

    def create_farm(
        self,
        party_id: str,
        farm_id: str,
        farm_name: str,
        farm_description: str,
        properties: dict = {},
        source: str = "",
        status: str = "",
    ) -> Dict[str, Any]:
        endpoint = f"/parties/{party_id}/farms/{farm_id}"
        data = {
            "name": farm_name,
            "description": farm_description,
            "properties": properties,
        }
        if source:
            data["source"] = source
        if status:
            data["status"] = status

        return self._patch(endpoint=endpoint, data=data)

    def get_farm(self, party_id: str, farm_id: str) -> Dict[str, Any]:
        endpoint = f"/parties/{party_id}/farms/{farm_id}"
        return self._get(endpoint, params={})

    def create_field(
        self,
        party_id: str,
        farm_id: str,
        field_id: str,
        field_name: str,
        field_description: str,
        geometry: Dict[str, Any],
        properties: dict = {},
        source: str = "",
        status: str = "",
    ) -> Dict[str, Any]:
        endpoint = f"/parties/{party_id}/fields/{field_id}"
        data = {
            "description": field_description,
            "farmId": farm_id,
            "geometry": geometry,
            "name": field_name,
            "properties": properties,
        }
        if source:
            data["source"] = source
        if status:
            data["status"] = status

        return self._patch(endpoint=endpoint, data=data)

    def get_field(self, party_id: str, field_id: str) -> Dict[str, Any]:
        endpoint = f"/parties/{party_id}/fields/{field_id}"
        return self._get(endpoint, params={})

    def search_field(
        self, party_id: str, geometry: Dict[str, Any], farm_id: str = ""
    ) -> Dict[str, Any]:
        endpoint = "/fields:search"

        data = {"partyId": party_id, "intersectsWithGeometry": geometry}
        if farm_id:
            data["farmIds"] = [farm_id]
        return self._post(endpoint, data=data)


def create_adma_client(config: ConfigSingletonClass):
    try:
        return (
            AdmaClient(
                base_url=config.adma_base_url,
                client_id=config.adma_client_id,
                client_secret=config.adma_client_secret,
                authority=config.adma_authority,
                default_scope=config.adma_scope,
            )
            if len(f"{config.farmvibes_url}".strip()) > 0
            else None
        )  # No ADMA if there's not farmvibes URL
    except Exception as err:
        logger.error(f"Error creating ADMA client: {err}")
        return None
