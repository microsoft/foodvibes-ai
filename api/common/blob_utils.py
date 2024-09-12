"""config.py

Provides Azure Blob Storage support tools

20240625 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

import logging
import os
from datetime import datetime, timedelta, timezone
from tempfile import TemporaryDirectory

from azure.storage.blob import (
    BlobClient,
    BlobSasPermissions,
    BlobServiceClient,
    ContentSettings,
    generate_blob_sas,
)

from api.common.fv_logging import setup_logger
from api.common.types import config

# Set up logging
logger = logging.getLogger("blob_utils")
setup_logger(logger)


class BlobRetriever:
    """
    BlobRetriever class to download a blob to a temporary file and return the path.
    It is used as a context manager to ensure the temporary file with blob content
    is deleted after use.
    """

    def __init__(self, blob_client: BlobClient):
        self.tmp_dir = TemporaryDirectory()
        self.blob_client = blob_client

    def __enter__(self):
        tmp_path = os.path.join(self.tmp_dir.name, "tmp_file")
        with open(tmp_path, "wb") as tmp_file:
            tmp_file.write(self.blob_client.download_blob().readall())
        return tmp_path

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.tmp_dir:
            self.tmp_dir.cleanup()


class BlobStorage:
    images_blob_service_url: str = ""
    images_blob_container_name: str = ""

    def __init__(self, images_blob_service_url: str, images_blob_container_name: str):
        self.images_blob_service_url = images_blob_service_url
        self.images_blob_container_name = images_blob_container_name
        self.credential = config.acquire_credential()
        self.blob_service_client = BlobServiceClient(
            account_url=self.images_blob_service_url,
            credential=self.credential,
        )
        self.container_client = self.blob_service_client.get_container_client(
            self.images_blob_container_name
        )
        self.user_delegation_key = None
        self.next_refresh_time = None
        self.next_expiration_time = None

    def _refresh_user_key(self, start_time: datetime):
        expirity_time = start_time + timedelta(days=1)
        self.user_delegation_key = self.blob_service_client.get_user_delegation_key(
            key_start_time=start_time,
            key_expiry_time=expirity_time,
        )

        self.next_refresh_time = start_time + timedelta(seconds=300)
        self.next_expiration_time = expirity_time

    def _refresh_user_key_if_needed(self):
        start_time = datetime.now(timezone.utc)

        if (
            self.user_delegation_key is None
            or self.next_refresh_time is None
            or self.next_refresh_time <= start_time + timedelta(seconds=10)
        ):
            self._refresh_user_key(start_time)

    def _download_blob(self, remote_path: str) -> bytes:
        blob_client = self.container_client.get_blob_client(remote_path)
        return blob_client.download_blob().readall()

    def store(self, local_path: str, remote_path: str, content_type: str = ""):
        blob_client = self.container_client.get_blob_client(remote_path)
        content_settings = ContentSettings(content_type=content_type)

        with open(local_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True, content_settings=content_settings)

    def retrieve(self, remote_path: str) -> BlobRetriever:
        blob_client = self.container_client.get_blob_client(remote_path)
        return BlobRetriever(blob_client)

    def list_blobs(self, prefix: str):
        return [blob for blob in self.container_client.list_blobs(name_starts_with=prefix)]

    def check_blob_exists(self, blob_name: str) -> bool:
        return self.container_client.get_blob_client(blob_name).exists()

    def get_blob_sas_url(self, blob_name: str) -> str:
        blob_client = self.container_client.get_blob_client(blob_name)

        self._refresh_user_key_if_needed()
        sas_token = generate_blob_sas(
            account_name=blob_client.account_name,  # type: ignore
            container_name=self.container_client.container_name,
            blob_name=blob_name,
            permission=BlobSasPermissions(read=True),
            expiry=self.next_expiration_time,
            user_delegation_key=self.user_delegation_key,
        )

        return f"{blob_client.url}?{sas_token}"
