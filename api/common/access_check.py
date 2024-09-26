from http import HTTPStatus
import json
import time
from typing import Tuple
import requests
import jwt
from cryptography.hazmat.primitives import serialization
from fastapi import Request, HTTPException, status
from functools import wraps
from api.common.database.common_utils import get_session
from api.common.database.table_sc_user import fetch_sc_user_rows
from api.common.roles_permissions import is_op_allowed
from api.common.types import (
    CommonError,
    CommonQueryParams,
    CommonQueryResponse,
    CommonQueryResponseMeta,
    config,
)
from api.common.config import logger
from api.common.fv_logging import setup_logger
from api.common.utils import convert_unix_timestamp_to_iso8601, is_production


def is_access_token_valid(
    client_id: str, access_token: str, verbose: bool = False
) -> Tuple[bool, str, str]:
    logger.info(f"Checking if access token is valid for client ID: {client_id}...")

    try:
        # Fetch public keys from Microsoft Entra ID
        jwks_url = "https://login.microsoftonline.com/common/discovery/keys"
        response = requests.get(jwks_url)

        if response.status_code != status.HTTP_200_OK:
            raise Exception(f"Failed to fetch JWKS from {jwks_url}")

        jwks = response.json()

        if not jwks.get("keys"):
            raise Exception("No keys found in the JWKS")

        # Decode the token headers to get the key ID (kid)
        token_headers = jwt.get_unverified_header(access_token)
        kid = token_headers.get("kid")

        if not kid:
            raise Exception("Key ID (kid) not found in the token headers")

        # Find the public key in the JWKS
        public_key = None

        for key in jwks["keys"]:
            if key["kid"] == kid:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)  # type: ignore
                break

        # Convert the public key to PEM format
        rsa_pem_key_bytes = public_key.public_bytes(  # type: ignore
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )

        # Get algorithm from token header
        alg = jwt.get_unverified_header(access_token)["alg"]

        # Decode token
        decoded_token = jwt.decode(
            access_token,
            key=rsa_pem_key_bytes,
            algorithms=[alg],
            verify=True,
            audience=[client_id],
            options={"verify_signature": False},
        )

        if verbose is True:
            logger.info(f"Decoded token:\n{json.dumps(decoded_token, indent=4, sort_keys=True)}")
        else:
            logger.info(f"Decoded token name: {decoded_token.get('name')}")

        appid = decoded_token.get("appid")

        if appid is None:
            raise Exception("No appid found in the token")

        if client_id != appid:
            raise Exception("Client ID does not match appid")

        exp = decoded_token.get("exp")
        cur = int(time.time())

        logger.info(f"Token expiration: {convert_unix_timestamp_to_iso8601(exp)} {exp}")
        logger.info(f"Current time::::: {convert_unix_timestamp_to_iso8601(cur)} {cur}")

        # Check if the token has expired
        if exp and cur < exp:
            msg = "Token is valid"

            logger.info(msg)

            return True, msg, decoded_token.get("upn") or decoded_token.get("email")

        raise Exception("Token has expired")
    except Exception as e:
        msg = f"{e}"

        logger.error(msg)

        return False, msg, ""


def access_check(check_for_roles: bool = False):
    def decorator(func):
        @wraps(func)
        async def decorated_function(request: Request, *args, **kwargs):
            status_code = status.HTTP_403_FORBIDDEN

            try:
                logger.info(
                    f"Checking access for {func.__name__}(check_for_roles={check_for_roles})..."
                )

                authorization: str = request.headers.get("Authorization", "")

                if not authorization:
                    raise HTTPException(
                        status_code=status_code, detail="Authorization header missing"
                    )

                scheme, token = authorization.split()

                if scheme.lower() != "bearer":
                    raise HTTPException(
                        status_code=status_code,
                        detail="Invalid or missing bearer scheme",
                    )

                is_valid, msg, user = is_access_token_valid(
                    config.entra_id_client_id, token
                )

                if not is_valid:
                    raise HTTPException(status_code=status_code, detail=msg)

                if len(f'{user or ""}') == 0:
                    raise HTTPException(
                        status_code=status_code, detail="User not found in the token"
                    )

                if not is_production():
                    user_override = request.query_params.get("impersonated_user")

                    if len(f'{user_override or ""}') > 0:
                        user = user_override

                logger.info(f"Active user: {user}")

                if check_for_roles is True and "commons" in kwargs:
                    # Obtain user role(s) and permissions from db
                    with get_session() as db_session:
                        kwargs["commons"].impersonated_user = user
                        kwargs["commons"].db_session = db_session

                        commons_lookup: CommonQueryParams = CommonQueryParams()

                        commons_lookup.db_session = db_session

                        response: CommonQueryResponse = fetch_sc_user_rows(
                            commons_lookup, sc_user_id=f"{user}"
                        )

                        if response.error.error_level != CommonError.ErrorLevel.SUCCESS:
                            raise HTTPException(
                                status_code=status_code, detail=response.error.message
                            )

                        if len(response.data) == 0:
                            raise HTTPException(
                                status_code=status_code,
                                detail="User not found in the database",
                            )

                        active_access_mask = response.data[0]["access_mask"]

                        if active_access_mask == 0:
                            raise HTTPException(
                                status_code=status_code,
                                detail="User does not have the required role to access this "
                                "resource (access_mask is 0)",
                            )

                        kwargs["commons"].active_access_mask = active_access_mask

                        if not is_op_allowed(
                            func.__name__, kwargs["commons"], commons_lookup
                        ):
                            raise HTTPException(
                                status_code=status_code,
                                detail="User does not have the required role to access this "
                                "resource (2)",
                            )

                        logger.info(
                            f"Gate allowed {func.__name__}(check_for_roles={check_for_roles})"
                        )

                        resonse_fn = await func(request, *args, **kwargs)

                        if (
                            resonse_fn.error.error_level
                            != CommonError.ErrorLevel.SUCCESS
                        ):
                            raise HTTPException(
                                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                                detail=resonse_fn.error.message,
                            )

                        return resonse_fn
                else:
                    return await func(request, *args, **kwargs)
            except Exception as e:
                logger.error(
                    f"Error in access_check for {func.__name__}(check_for_roles={check_for_roles}):"
                    f" {e}"
                )

                return CommonQueryResponse(
                    CommonError(
                        error_level=CommonError.ErrorLevel.ERROR,
                        code=1,
                        msessage=str(e),
                    ),
                    CommonQueryResponseMeta(0, 0, CommonQueryParams()),
                    [],
                )

        return decorated_function

    return decorator


if __name__ == "__main__":
    import sys

    setup_logger(logger)

    if len(sys.argv) > 1:
        logger.info("Sample token validation test started")
        token = sys.argv[1]
        is_valid, msg, user = is_access_token_valid(
            config.entra_id_client_id, token, True
        )

        (logger.info if is_valid else logger.error)(
            f"valid token={is_valid} {msg} {user}"
        )
        logger.info("Sample token validation test completed")
    else:
        logger.warning(f"Usage: {sys.argv[0]} <token>")
