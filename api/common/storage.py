"""database.py

Common objects and functions used by Azure Blob Storage

20240508 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

import logging
import os
import tempfile

from fastapi import UploadFile

from api.common.blob_utils import BlobStorage
from api.common.fv_logging import setup_logger

# Set up logging
logger = logging.getLogger("storage")
setup_logger(logger)


class StorageManager:

    def __init__(
        self,
        images_blob_service_url: str,
        images_blob_container_name: str,
        base_path: str = "",
        extension: str = "",
        mime_type: str = "",
    ):
        self.blob_storage = BlobStorage(images_blob_service_url, images_blob_container_name)
        self.base_path = base_path
        self.extension = extension
        self.mime_type = mime_type

    def _get_storage_path(self, id: str) -> str:
        return os.path.join(self.base_path, f"{id}{self.extension}")

    def store_file(self, local_file_path: str, blob_path: str, content_type: str):
        self.blob_storage.store(local_file_path, blob_path, content_type)

    def list_storage_items(self) -> list:
        return self.blob_storage.list_blobs(self.base_path)

    def store_file_by_id(self, item_id: str, local_file_path: str):
        blob_name = self._get_storage_path(item_id)
        self.store_file(local_file_path, blob_name, self.mime_type)

    def get_item_url_by_path(self, blob_name: str) -> str:
        return self.blob_storage.get_blob_sas_url(blob_name)

    def get_item_url_by_id(self, id: str) -> str:
        blob_name = self._get_storage_path(id)
        return self.get_item_url_by_path(blob_name)

    def read_item_by_path(self, blob_name: str):
        return self.blob_storage.retrieve(blob_name)

    def read_item_by_id(self, item_id: str):
        blob_name = self._get_storage_path(item_id)
        return self.read_item_by_path(blob_name)

    def check_item_exists_by_id(self, blob_name: str) -> bool:
        blob_path = self._get_storage_path(blob_name)
        return self.blob_storage.check_blob_exists(blob_path)

    async def upload_file_and_return_sas_url(
        self,
        file: UploadFile,
        file_name: str,
        content_type: str,
    ) -> str | None:

        with tempfile.TemporaryDirectory() as tmpdir:

            temporary_path = os.path.join(tmpdir, "tmpfile")
            with open(temporary_path, "wb") as f:
                content = await file.read()
                f.write(content)

            self.blob_storage.store(temporary_path, file_name, content_type)
            return self.blob_storage.get_blob_sas_url(file_name)
