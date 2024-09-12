"""farmvibes.py

Provided endpoints for integration with Farmvibes API

20240410 Bruno Silva -- brunosilva@microsoft.com -- Initial release

"""

import json
import os
from datetime import datetime
from tempfile import TemporaryDirectory
from typing import Any, Tuple, cast
from uuid import uuid4 as uuid

from fastapi import Request
import matplotlib.pyplot as plt
import numpy as np
import rasterio
from matplotlib.colors import ListedColormap
from rasterio.mask import mask
from shapely import geometry as shpg
from shapely.geometry.base import BaseGeometry
from vibe_core.data import Raster
from vibe_core.datamodel import RunStatus

from api.common.config import logger
from api.common.models import FarmVibesForestRequest
from api.common.storage import StorageManager
from api.common.access_check import access_check
from api.common.types import CommonError, config
from api.common.utils import calculate_hash
from api.farmvibes_client import create_farmvibes_client

os.environ["MPLBACKEND"] = "Agg"  # noqa

CLIENT = create_farmvibes_client()
WORKFLOW_NAME = "data_ingestion/alos/alos_forest_extent_download_merge"
ALOS_CATEGORIES = [
    "No data",
    "Forest (>90 percent canopy cover)",
    "Forest (10-90 percent canopy cover)",
    "Non-forest",
    "Water",
]

FARMVIBES_IMAGES_STORAGE_PATH = "cache/demo_data/farmvibes/images/"
FARMVIBES_IMAGE_STORAGE = StorageManager(
    config.images_blob_service_url,
    config.images_blob_container_name,
    base_path=FARMVIBES_IMAGES_STORAGE_PATH,
    extension=".svg",
    mime_type="image/svg+xml",
)


FARMVIBES_PIXELS_STORAGE_PATH = "cache/demo_data/farmvibes/pixels/"
FARMVIBES_PIXELS_STORAGE = StorageManager(
    config.images_blob_service_url,
    config.images_blob_container_name,
    base_path=FARMVIBES_PIXELS_STORAGE_PATH,
    extension=".json",
    mime_type="application/json",
)


class FarmVibesForestRequester:
    def __init__(self):
        self.tmp_dir = TemporaryDirectory()

    def __del__(self):
        self.tmp_dir.cleanup()

    def run_forest_map_workflow(
        self,
        forest_request: FarmVibesForestRequest,
    ) -> str:
        logger.info(f"Running forest map workflow for year {forest_request.forest_year}")
        # GeoJSON data
        geometry: BaseGeometry = shpg.shape(forest_request.geojson["geometry"])
        time_range = (
            datetime(forest_request.forest_year, 1, 1),
            datetime(forest_request.forest_year, 12, 31),
        )

        run = CLIENT.run(
            WORKFLOW_NAME,
            "Download ALOS Forest Map",
            geometry=geometry,
            time_range=time_range,
            parameters={"pc_key": "@SECRET(eywa-secrets, pc-sub-key)"},
        )

        run.block_until_complete()

        if run.status != RunStatus.done:
            raise ValueError(f"Workflow failed with status {run.status} and reason {run.reason}")

        # Read the data from the run
        merged_raster = cast(
            Raster,
            (
                run.output["merged_raster"][0]  # type: ignore
                if run.output is not None and len(run.output) > 0
                else ""
            ),
        )

        logger.info(f"Workflow completed with status {run.status}")

        return merged_raster.raster_asset.path_or_url

    def read_forest_map_data(self, asset_path: str, geom: shpg.Polygon) -> np.ndarray:
        with rasterio.open(asset_path) as src:
            data, _ = mask(src, [geom], crop=True, filled=False)
            image_data = data[0]
        return image_data

    def generate_forest_map_image(
        self, data: np.ndarray, border: bool = False, color: str = "red"
    ) -> str:

        color_dict = {
            0: "black",
            1: "red",
            2: "orange",
            3: "grey",
            4: "blue",
        }

        logger.info("Generating forest map image")
        # Generate the image
        _, ax = plt.subplots()

        # Hide axes
        ax.axis("off")

        colors = [
            color_dict[color] for color in np.unique(list(data.flatten())) if color in color_dict
        ]
        cmap = ListedColormap(colors)

        # Display the band
        ax.imshow(data, cmap=cmap)

        # Draw border
        if border:
            ax.contour(data.mask, colors=color, linewidths=2)  # type: ignore

        # Create the file path
        fpath = os.path.join(self.tmp_dir.name, f"{uuid()}.svg")

        # Save the figure in SVG format
        plt.savefig(fpath, format="svg", bbox_inches="tight", pad_inches=0, transparent=True)

        logger.info(f"Image saved to {fpath}")

        return fpath

    def get_forest_pixels(self, data: np.ndarray) -> str:
        # Get the unique values and their counts
        unique, counts = np.unique(list(data), return_counts=True)
        categories = [ALOS_CATEGORIES[i] for i in unique]
        pixels = dict(zip(categories, counts.astype(float)))

        # Save the pixels to a JSON file
        pixels_path = os.path.join(self.tmp_dir.name, f"{uuid()}.json")
        with open(pixels_path, "w") as f:
            json.dump(pixels, f)

        return pixels_path

    def get_forest_map_image(self, forest_request: FarmVibesForestRequest) -> Tuple[str, str]:
        local_path = self.run_forest_map_workflow(forest_request)
        geom_data: Any = shpg.shape(forest_request.geojson["geometry"])
        data = self.read_forest_map_data(local_path, geom_data)
        return self.generate_forest_map_image(
            data, forest_request.contour, forest_request.color  # type: ignore
        ), self.get_forest_pixels(data)


FARMVIBES_REQUESTER = FarmVibesForestRequester()


def cache_forest_map_image(forest_request: FarmVibesForestRequest):
    """Cache forest map image and pixels"""

    id_to_use = calculate_hash(shpg.shape(forest_request.geojson["geometry"]).wkt)

    if not (
        FARMVIBES_IMAGE_STORAGE.check_item_exists_by_id(id_to_use)
        and FARMVIBES_PIXELS_STORAGE.check_item_exists_by_id(id_to_use)
    ):
        image_path, forest_pixels_path = FARMVIBES_REQUESTER.get_forest_map_image(forest_request)

        FARMVIBES_IMAGE_STORAGE.store_file_by_id(id_to_use, image_path)
        FARMVIBES_PIXELS_STORAGE.store_file_by_id(id_to_use, forest_pixels_path)

    return id_to_use


def read_pixels_from_item_id(item_id: str) -> dict:
    with FARMVIBES_PIXELS_STORAGE.read_item_by_id(item_id) as local_file:
        with open(local_file) as f:
            return json.load(f)


def calculate_deforestation_pct(forest_pixels_path: dict) -> float:
    forest_cover_no_data = forest_pixels_path.get("No data", 0)
    forest_cover_above_90 = forest_pixels_path.get("Forest (>90 percent canopy cover)", 0)
    forest_cover_below_90 = forest_pixels_path.get("Forest (10-90 percent canopy cover)", 0)
    forest_cover_non_forest = forest_pixels_path.get("Non-forest", 0)
    forest_cover_water = forest_pixels_path.get("Water", 0)
    return round(
        (forest_cover_above_90 + forest_cover_below_90)
        / (
            forest_cover_no_data
            + forest_cover_above_90
            + forest_cover_below_90
            + forest_cover_non_forest
            + forest_cover_water
        )
        * 100,
        2,
    )


@config.app.post("/forest_map/", response_model=None)
@access_check(check_for_roles=True)
async def call_farmvibes_forest_map(request: Request, forest_request: FarmVibesForestRequest):
    """Endpoint for forest map integration"""

    try:
        if "geometry" not in forest_request.geojson:
            raise ValueError("GeoJSON must contain a 'geometry' key")

        id_to_use = cache_forest_map_image(forest_request)

        img_url = FARMVIBES_IMAGE_STORAGE.get_item_url_by_id(id_to_use)
        forest_pixels = read_pixels_from_item_id(id_to_use)

        deforestation_pct = calculate_deforestation_pct(forest_pixels)

        return {
            "image_url": img_url,
            "forest_pixels": forest_pixels,
            "deforestation_pct": deforestation_pct,
        }
    except Exception as error:
        return (CommonError(error_level=CommonError.ErrorLevel.ERROR, code=1, msessage=str(error)),)
