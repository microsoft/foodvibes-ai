import logging
import os

from shapely.geometry import Polygon

from api.common.fv_logging import setup_logger
from api.common.models import FarmVibesForestRequest
from api.common.storage import StorageManager
from api.common.types import config
from api.common.utils import calculate_hash
from api.farmvibes import FarmVibesForestRequester
from api.farmvibes_client import FARMVIBES_DATA_TIFF
from scripts.adma.generate_adma_data import load_predefined_polygons

# Set up logging
logger = logging.getLogger("generate_farmvibes_data")
setup_logger(logger)

GENERATE_FV_DATA_STORAGE_MANAGER = StorageManager(
    images_blob_service_url=config.images_blob_service_url,
    images_blob_container_name=config.images_blob_container_name,
    base_path=FARMVIBES_DATA_TIFF,
    extension=".tif",
    mime_type="image/tiff",
)


def save_forest_map_image(polygon: Polygon, farmvibes_requester: FarmVibesForestRequester):
    geojson = {"geometry": polygon}
    # Calculate hash
    polygon_hash = calculate_hash(polygon.wkt)
    logger.info(f"Calculated hash: {polygon_hash}")

    # Create a request
    forest_request = FarmVibesForestRequest(
        id="fake_id",
        forest_year=2020,
        geojson=geojson,
        contour=True,
        color="red",
    )

    forest_tiff_path = farmvibes_requester.run_forest_map_workflow(forest_request)

    # Move the forest map image to the data folder
    image_path = os.path.join(FARMVIBES_DATA_TIFF, f"{polygon_hash}.tif")

    logger.info(f"Moving forest map image from {forest_tiff_path} to {image_path}")

    if FARMVIBES_DATA_TIFF not in forest_tiff_path:
        GENERATE_FV_DATA_STORAGE_MANAGER.store_file_by_id(polygon_hash, forest_tiff_path)
        logger.info(f"Forest map image saved to {image_path}")
    else:
        logger.info("Not moving the file as it is already in the correct location.")


def main():
    # Load predefined polygons
    polygons = load_predefined_polygons()

    # Create a FarmVibes requester
    farmvibes_requester = FarmVibesForestRequester()

    for polygon in polygons:
        logger.info(f"Processing polygon: {polygon.wkt}")
        save_forest_map_image(polygon, farmvibes_requester)


if __name__ == "__main__":
    main()
