"""geotrack.py

Provides endpoint for image read/write operations

20240625 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from http import HTTPStatus

from fastapi import HTTPException, Request, UploadFile

from api.common.storage import StorageManager
from api.common.access_check import access_check
from api.common.types import config

PRODUCT_IMAGES_STORAGE = StorageManager(
    config.images_blob_service_url,
    config.images_blob_container_name,
    base_path="products",
    extension=".png",
    mime_type="image/png",
)

GEOTRACK_IMAGE_STORAGE = StorageManager(
    config.images_blob_service_url,
    config.images_blob_container_name,
    base_path="geotrack",
    extension=".png",
    mime_type="image/png",
)


@config.app.post("/upload_image")
@access_check(check_for_roles=True)
async def upload_image(
    request: Request,
    file: UploadFile,
    image_id: str,
    is_product: bool = True,
    content_type: str = "image/png",
):
    if file.filename is None or image_id is None:
        return HTTPException(HTTPStatus.BAD_REQUEST, "No file name provided.")

    if is_product:
        return await PRODUCT_IMAGES_STORAGE.upload_file_and_return_sas_url(
            file, image_id, content_type
        )
    return await GEOTRACK_IMAGE_STORAGE.upload_file_and_return_sas_url(file, image_id, content_type)


@config.app.get("/get_image_url")
@access_check(check_for_roles=True)
async def get_image_url(request: Request, image_id: str):
    """Image URL Endpoint -- Fetches Image URL in Azure Blob Storage for a given image_id"""

    if image_id.startswith("product"):
        return PRODUCT_IMAGES_STORAGE.get_item_url_by_id(image_id)
    elif image_id.startswith("geotrack"):
        return GEOTRACK_IMAGE_STORAGE.get_item_url_by_id(image_id)

    return HTTPException(HTTPStatus.BAD_REQUEST, "Invalid image_id provided.")
