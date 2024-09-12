from typing import Any, Dict

from vibe_core.client import FarmvibesAiClient

from api.common.storage import StorageManager
from api.common.types import config

# Path to the tiff images used by the run-time script to create .svg images
FARMVIBES_DATA_TIFF = (
    "cache/demo_data/fake_farmvibes/images/raw_images_used_by_generate_farmvibes_data"
)

FARMVIBES_CLIENT_STORAGE = StorageManager(
    config.images_blob_service_url,
    config.images_blob_container_name,
    base_path=FARMVIBES_DATA_TIFF,
    extension=".tif",
    mime_type="image/tiff",
)


class RunStatus:
    status: str
    reasons: str
    output: Dict[str, Any]

    def __init__(self, status: str, reason: str, output: Dict[str, Any]):
        self.status = status
        self.reason = reason
        self.output = output

    def block_until_complete(self):
        # This is just a placeholder
        pass


def create_farmvibes_client() -> FarmvibesAiClient:
    return FarmvibesAiClient(config.farmvibes_url)
