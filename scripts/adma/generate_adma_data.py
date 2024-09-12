import logging

import geopandas as gpd
from shapely.geometry import Polygon, mapping

from api.adma import create_adma_client
from api.common.fv_logging import setup_logger
from api.common.storage import StorageManager
from api.common.types import config

# Set up logging
logger = logging.getLogger("generate_adma_data")
setup_logger(logger)

BUFFER = 0.0001
ADMA_GEOJSON_PATH = "cache/demo_data/fake_adma/geojson/"

GENERATE_ADMA_DATA_STORAGE = StorageManager(
    images_blob_service_url=config.images_blob_service_url,
    images_blob_container_name=config.images_blob_container_name,
    base_path=ADMA_GEOJSON_PATH,
    extension=".geojson",
)


def load_predefined_polygons():
    """Load predefined polygons from GeoJSON files"""
    geopandas = []
    blobs = GENERATE_ADMA_DATA_STORAGE.list_storage_items()

    for blob in blobs:
        logger.info(f"Loading GeoJSON file: {blob.name}")
        with GENERATE_ADMA_DATA_STORAGE.read_item_by_path(blob.name) as local_file:
            geopandas.append(gpd.read_file(local_file))

    return [Polygon(data.geometry[0]) for data in geopandas]


def generate_adma_data():
    adma_client = create_adma_client(config)

    if adma_client is None:
        raise RuntimeError("ADMA client not found.")

    parties = adma_client.list_parties()
    logger.info(f"The system has the total of {len(parties['value'])} parties")

    party_id = "FoodVibesPartyID"

    adma_client.create_party(
        party_id=party_id,
        party_name="FoodVibes Party Name",
        party_description="FoodVibes Party Description",
        properties={"Sample Property": "Sample Value"},
    )

    logger.info(f"Added a new party with id {party_id}")

    parties = adma_client.list_parties()

    logger.info(
        f"The system has the total of {len(parties['value'])} parties after the new party was added"
    )

    new_party = adma_client.get_party(party_id)

    logger.info(f"Details of the new party are: {new_party}")

    # Create a new Farm
    farm_id = "FoodVibesFarmID"

    adma_client.create_farm(
        party_id=party_id,
        farm_id=farm_id,
        farm_name="FoodVibes Farm Name",
        farm_description="FoodVibes Farm Description",
        properties={"Sample Farm Property": "Sample Farm Value"},
    )

    logger.info(f"Added a new Farm with id {farm_id}")

    new_farm = adma_client.get_farm(party_id, farm_id)
    logger.info(f"Details of the new farm are: {new_farm}")

    base_field_id = "FoodVibesFieldID"

    for index, polygon in enumerate(load_predefined_polygons()):
        # Register the field
        logger.info(f"Registering polygon #{index} in ADMA")
        field_id = f"{base_field_id}_{index}"
        adma_client.create_field(
            party_id=party_id,
            farm_id=farm_id,
            field_id=field_id,
            field_name=f"FoodVibes Name ({index})",
            field_description="FoodVibes Field Description",
            geometry=mapping(polygon),
            properties={"Sample Field Porperty": "Sample Field Value"},
        )

        created_field = adma_client.get_field(party_id, field_id)
        logger.info(f"Created field {created_field}")

        # Collect the centroid of the polygon
        centroid = polygon.centroid
        found_field = adma_client.search_field(
            party_id=party_id, geometry=mapping(centroid), farm_id=farm_id
        )

        assert len(found_field["value"]) == 1
        assert found_field["value"][0]["id"] == field_id


if __name__ == "__main__":
    generate_adma_data()
