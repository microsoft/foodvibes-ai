from fastapi import Request
from shapely.geometry import Point, Polygon
from shapely.geometry.base import BaseGeometry

from api.adma_client import create_adma_client
from api.common.access_check import access_check
from api.common.config import logger
from api.common.types import config

BUFFER = 0.0001
ADMA_CLIENT = create_adma_client(config)


def get_geometry_from_lat_lon(lat: float, lon: float) -> BaseGeometry:
    if ADMA_CLIENT is None:
        raise RuntimeError("ADMA client not found.")

    field_list = ADMA_CLIENT.search_field(
        config.adma_default_party, Point(lon, lat).__geo_interface__
    )

    if not field_list or "value" not in field_list or not field_list["value"]:
        raise RuntimeError(f"field_not_found for {lat}, {lon}")

    found_field = field_list["value"][0]
    field = ADMA_CLIENT.get_field(config.adma_default_party, found_field["id"])

    if not field or "geometry" not in field:
        raise RuntimeError(f"field_not_found for {lat}, {lon}")

    return field["geometry"]


@config.app.get("/adma/")
@access_check(check_for_roles=True)
async def adma_call(request: Request, id: str, lat: float, lon: float):
    status = "success"
    geometry: BaseGeometry = BaseGeometry()

    try:
        logger.info(f"Reading the GeoJson from lat={lat} and lon={lon} for id={id}.")

        geometry = get_geometry_from_lat_lon(lat, lon)

        if geometry["type"] == "Polygon" and len(geometry["coordinates"]) > 0:  # type: ignore
            logger.info(f"Found point ({lat}, {lon}) in polygon.")
        else:
            raise ValueError(f"Field not found for lat={lat} lon={lon} not found.")
    except Exception:
        status = "field_not_found"
        square = Polygon(
            [
                (lon - BUFFER, lat - BUFFER),
                (lon - BUFFER, lat + BUFFER),
                (lon + BUFFER, lat + BUFFER),
                (lon - BUFFER, lat + BUFFER),
            ]
        )
        geometry = square.__geo_interface__  # type: ignore
    finally:
        return {
            "status": status,
            "geojson": geometry,
        }
