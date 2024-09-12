import pytest
from shapely.geometry import shape

from api.adma_client import AdmaClient
from api.common.types import config


@pytest.mark.skip(reason="This test is for development purposes only. Not for CI/CD.")
def test_adma():
    adma_client = AdmaClient(
        base_url=config.adma_base_url,
        client_id=config.adma_client_id,
        client_secret=config.adma_client_secret,
        authority=config.adma_authority,
        default_scope=config.adma_scope,
    )

    parties = adma_client.list_parties()

    assert len(parties["value"]) > 0
    assert 1 == 1

    party_id = "FoodVibesPartyID"
    field_id = "FoodVibesFieldID_1"

    created_field = adma_client.get_field(party_id, field_id)

    shapelygeom = shape(created_field["geometry"])
    assert shapelygeom.geom_type == "Polygon"

    centroid = shapelygeom.centroid

    found_geom = adma_client.search_field(party_id, centroid.__geo_interface__)

    assert len(found_geom["value"]) == 1
    assert found_geom["value"][0]["id"] == field_id
