"""_summary_

Generate test data for Foodvibes tables

--
ChatGPT request to generate data for product table:

generate 300 rows of data with the following spec

columns are:
product_id: unique name of at least 200 unique farm products or crops as a multi-word phrase with
no underscore in all lowercase  with a numeric suffix
description: unique description of product_id in 8-12 words
quantity: numeric value in the range of 1 to 24
recorded_at: timestamp in iso format to be dated within the last 500 days
properties: stringified json of at least 2 properties
operation: always to be number value 0
username: usernames limited to only 12 variations of first initial+lastname

no field to contain single quote in its text
all columns except quantity and operation to be in single quotes
each row to be in parenthesis
each row to end with comma

--
ChatGPT request to generate data for geotrack table:

generate 150 rows of data with the following spec

columns are:
latitude: geographical latitude
longitude: geographical longitude
geotrack id: unique name of a farm or ranch location as a multi-word phrase with no underscore in
all lowercase  with a numeric suffix
name: full name of the farm or ranch location from geotrack_id above to always contain unique city,
state/province, country name corresponding with latitude and longitude
details: description of geotrack_id in 8-12 words
recorded_at: timestamp in iso format to be dated within the last 500 days
properties: stringified json of at least 2 properties
operation: always to be number value 0
username: usernames limited to only 12 variations

latitude and longitude combination to be unique and always point to a farmable land randomly
anywhere on earth and to include all continents
no field to contain single quote in its text
all columns except longitude, latitude and operation to be in single quotes
each row to be in parenthesis
each row to end with comma

"""

import logging
import os
import sys
from fastapi.responses import HTMLResponse
from sqlalchemy import text
from api.common.database.common_utils import get_session, get_timestamp_now
from api.common.database.table_sc_group import fetch_sc_group_rows
from api.common.database.table_sc_group_upsert import sc_group_upsert
from api.common.database.table_sc_circle import fetch_sc_circle_rows
from api.common.database.table_sc_circle_upsert import sc_circle_upsert
from api.common.database.table_sc_user import fetch_sc_user_rows
from api.common.database.table_sc_user_upsert import sc_user_upsert
from api.common.fv_logging import setup_logger
from api.common.models import (
    FoodvibesGeotrackRequest,
    FoodvibesProductRequest,
    FoodvibesScUserRequest,
    FoodvibesScGroupRequest,
    FoodvibesScCircleRequest,
    FoodvibesTrackingProductsRequest,
)
from api.common.database.table_geotrack_upsert import geotrack_upsert
from api.common.database.table_product_upsert import product_upsert
from api.common.database.table_tracking_products_upsert import tracking_products_upsert
from api.common.roles_permissions import (
    ROLE_GEOTRACK_OWNER,
    ROLE_GLOBAL_OWNER,
    ROLE_PRODUCT_OWNER,
    ROLE_SUPPLY_CHAIN_OWNER,
    ROLE_SUPPLY_CHAIN_VIEWER,
)
from api.common.types import CommonQueryParams, CommonQueryResponse
import asyncio

# Set up logging
logger = logging.getLogger("generate_foodvibes_data")
setup_logger(logger)
commons: CommonQueryParams = CommonQueryParams()
commons.db_session = get_session()
commons.active_access_mask = ROLE_GLOBAL_OWNER
commons.impersonated_user = "system"


async def sc_user_item_create(
    sc_user_id: str, email_addr: str, phone: str, access_mask: int, username: str
):
    """Creating demo sc_user record"""
    response: CommonQueryResponse | HTMLResponse = fetch_sc_user_rows(
        commons, sc_user_id=sc_user_id
    )

    if (
        isinstance(response, CommonQueryResponse)
        and response.error.error_level.name == "SUCCESS"
        and len(response.data) > 0
    ):
        return response.data[0]["sc_user_ledger_id"]

    item: FoodvibesScUserRequest = FoodvibesScUserRequest(
        ledger_id=0,
        sc_user_id=sc_user_id,
        email_addr=email_addr,
        phone=phone,
        access_mask=access_mask,
        deleted=False,
        operation=None,
        created_at=get_timestamp_now(),
        username=username,
    )
    response = await sc_user_upsert(commons, item)

    if (
        isinstance(response, CommonQueryResponse)
        and response.error.error_level.name == "SUCCESS"
        and len(response.data) > 0
    ):
        return response.data[0]["sc_user_ledger_id"]

    return -1


async def sc_group_item_create(sc_group_id: str, description: str, username: str):
    """Creating demo sc_group record"""
    response: CommonQueryResponse | HTMLResponse = fetch_sc_group_rows(
        commons, sc_group_id=sc_group_id
    )

    if (
        isinstance(response, CommonQueryResponse)
        and response.error.error_level.name == "SUCCESS"
        and len(response.data) > 0
    ):
        return response.data[0]["sc_group_ledger_id"]

    item: FoodvibesScGroupRequest = FoodvibesScGroupRequest(
        ledger_id=0,
        sc_group_id=sc_group_id,
        description=description,
        deleted=False,
        operation=None,
        created_at=get_timestamp_now(),
        username=username,
    )
    response = await sc_group_upsert(commons, item)

    if (
        isinstance(response, CommonQueryResponse)
        and response.error.error_level.name == "SUCCESS"
        and len(response.data) > 0
    ):
        return response.data[0]["sc_group_ledger_id"]

    return -1


async def sc_circle_item_create(
    sc_group_ledger_id: int,
    sc_user_ledger_id: int,
    access_mask: int,
    username: str,
):
    """Creating demo sc_circle record"""
    response: CommonQueryResponse | HTMLResponse = fetch_sc_circle_rows(
        commons,
        sc_group_ledger_id=sc_group_ledger_id,
        sc_user_ledger_id=sc_user_ledger_id,
    )

    if (
        isinstance(response, CommonQueryResponse)
        and response.error.error_level.name == "SUCCESS"
        and len(response.data) > 0
    ):
        return response.data[0]["sc_circle_ledger_id"]

    item: FoodvibesScCircleRequest = FoodvibesScCircleRequest(
        ledger_id=0,
        sc_group_ledger_id=sc_group_ledger_id,
        sc_user_ledger_id=sc_user_ledger_id,
        access_mask=access_mask,
        deleted=False,
        operation=None,
        created_at=get_timestamp_now(),
        username=username,
    )
    response = await sc_circle_upsert(commons, item)

    if (
        isinstance(response, CommonQueryResponse)
        and response.error.error_level.name == "SUCCESS"
        and len(response.data) > 0
    ):
        return response.data[0]["sc_circle_ledger_id"]

    return -1


async def geotrack_item_create(
    geotrack_id: str, latitude: float, longitude: float, username: str, image_id: str
):
    """Creating demo geotrack record"""

    item: FoodvibesGeotrackRequest = FoodvibesGeotrackRequest(
        ledger_id=0,
        geotrack_id=geotrack_id,
        name=f"Demo {geotrack_id}",
        details=f"Details for {geotrack_id}",
        latitude=latitude,
        longitude=longitude,
        recorded_at=None,
        properties='{"DemoDataGeotrack": true}',
        username=username,
        created_at=get_timestamp_now(),
        operation=None,
        image_id=image_id,
    )
    impersonated_user = commons.impersonated_user
    commons.impersonated_user = username
    response: CommonQueryResponse | HTMLResponse = await geotrack_upsert(commons, item)
    commons.impersonated_user = impersonated_user

    if (
        isinstance(response, CommonQueryResponse)
        and response.error.error_level.name == "SUCCESS"
        and len(response.data) > 0
    ):
        return response.data[0]["geotrack_ledger_id"]

    return -1


async def product_item_create(
    product_id: str, quantity: int, storage_tier: int, username: str, image_id: str
):
    """Creating demo product record"""

    item: FoodvibesProductRequest = FoodvibesProductRequest(
        ledger_id=0,
        product_id=product_id,
        description=f"Demo {product_id}",
        quantity=quantity,
        storage_tier=storage_tier,
        recorded_at=None,
        properties='{"DemoDataProduct": true}',
        username=username,
        created_at=get_timestamp_now(),
        operation=None,
        image_id=image_id,
    )
    impersonated_user = commons.impersonated_user
    commons.impersonated_user = username
    response: CommonQueryResponse | HTMLResponse = await product_upsert(commons, item)
    commons.impersonated_user = impersonated_user

    if (
        isinstance(response, CommonQueryResponse)
        and response.error.error_level.name == "SUCCESS"
        and len(response.data) > 0
    ):
        return response.data[0]["product_ledger_id"]

    return -1


async def tracking_products_item_create(
    ledger_id: int,
    geotrack_ledger_id: int,
    product_ledger_id: int,
    product_aggregation: int,
    notes: str,
    username: str,
):
    """Creating demo tracking_products record"""

    item: FoodvibesTrackingProductsRequest = FoodvibesTrackingProductsRequest(
        ledger_id=ledger_id,
        geotrack_ledger_id=geotrack_ledger_id,
        geotrack_tx_id=0,
        product_ledger_id=product_ledger_id,
        product_tx_id=0,
        product_aggregation=product_aggregation,
        notes=notes,
        recorded_at=None,
        properties='{"DemoDataTrackingProducts": true}',
        username=username,
        created_at=get_timestamp_now(),
        operation=None,
    )
    impersonated_user = commons.impersonated_user
    commons.impersonated_user = username
    response: CommonQueryResponse | HTMLResponse = await tracking_products_upsert(commons, item)
    commons.impersonated_user = impersonated_user

    if (
        isinstance(response, CommonQueryResponse)
        and response.error.error_level.name == "SUCCESS"
        and len(response.data) > 0
    ):
        return response.data[0]["tracking_products_ledger_id"]

    return -1


async def main(user_name: str):
    tag = (
        "_"
        + get_timestamp_now()
        .split(".")[0]
        .replace(" ", "")
        .replace(":", "")
        .replace("-", "")
        .replace("T", "")
        + ":"
    )[:15]
    """
    --ScUser
    """
    go1 = await sc_user_item_create(
        f"go1{tag}", "go1@microsoft.com", "425-555-1212", ROLE_GEOTRACK_OWNER, "system"
    )
    go2 = await sc_user_item_create(
        f"go2{tag}", "go2@microsoft.com", "425-555-1213", ROLE_GEOTRACK_OWNER, "system"
    )
    go3 = await sc_user_item_create(
        f"go3{tag}", "go3@microsoft.com", "425-555-1214", ROLE_GEOTRACK_OWNER, "system"
    )
    go4 = await sc_user_item_create(
        f"go4{tag}", "go4@microsoft.com", "425-555-1215", ROLE_GEOTRACK_OWNER, "system"
    )
    go5 = await sc_user_item_create(
        f"go5{tag}", "go5@microsoft.com", "425-555-1216", ROLE_GEOTRACK_OWNER, "system"
    )
    go6 = await sc_user_item_create(
        f"go6{tag}", "go6@microsoft.com", "425-555-1217", ROLE_GEOTRACK_OWNER, "system"
    )

    po1 = await sc_user_item_create(
        f"po1{tag}", "po1@microsoft.com", "425-555-1222", ROLE_PRODUCT_OWNER, "system"
    )
    po2 = await sc_user_item_create(
        f"po2{tag}", "po2@microsoft.com", "425-555-1232", ROLE_PRODUCT_OWNER, "system"
    )
    po3 = await sc_user_item_create(
        f"po3{tag}", "po3@microsoft.com", "425-555-1242", ROLE_PRODUCT_OWNER, "system"
    )
    po4 = await sc_user_item_create(
        f"po4{tag}", "po4@microsoft.com", "425-555-1252", ROLE_PRODUCT_OWNER, "system"
    )
    po5 = await sc_user_item_create(
        f"po5{tag}", "po5@microsoft.com", "425-555-1262", ROLE_PRODUCT_OWNER, "system"
    )
    po6 = await sc_user_item_create(
        f"po6{tag}", "po6@microsoft.com", "425-555-1272", ROLE_PRODUCT_OWNER, "system"
    )
    po7 = await sc_user_item_create(
        f"po7{tag}", "po7@microsoft.com", "425-555-1282", ROLE_PRODUCT_OWNER, "system"
    )

    sco1 = await sc_user_item_create(
        f"sco1{tag}", "sco1@microsoft.com", "425-555-1312", ROLE_SUPPLY_CHAIN_OWNER, "system"
    )
    sco2 = await sc_user_item_create(
        f"sco2{tag}", "sco2@microsoft.com", "425-555-1412", ROLE_SUPPLY_CHAIN_OWNER, "system"
    )

    scv1 = await sc_user_item_create(
        f"scv1{tag}", "scv1@microsoft.com", "425-555-5212", ROLE_SUPPLY_CHAIN_VIEWER, "system"
    )

    if len(user_name) > 0:
        logger.info(f'adding user "{user_name}" as global owner...')

        glo0 = await sc_user_item_create(
            user_name,
            user_name,
            "425-555-1000",
            ROLE_GLOBAL_OWNER,
            "system",
        )
    else:
        logger.warning("Not adding a default global owner (needs to be added manually)")
        glo0 = -1

    """
    --ScGroup
    """
    group0 = await sc_group_item_create(
        "Global Admin", "Global admin user group holding all GLRO usernames", "system"
    )
    group1 = await sc_group_item_create(
        f"test group 1{tag}", f"test group 1{tag} auto-generated for testing", "system"
    )
    group2 = await sc_group_item_create(
        f"test group 2{tag}", f"test group 2{tag} auto-generated for testing", "system"
    )

    """
    --ScCircle
    """
    await sc_circle_item_create(
        group0,
        glo0,
        31,
        "system",
    )
    await sc_circle_item_create(group1, go1, 2, "system")
    await sc_circle_item_create(group1, go2, 2, "system")
    await sc_circle_item_create(group1, go3, 2, "system")
    await sc_circle_item_create(group1, go4, 2, "system")
    await sc_circle_item_create(group1, go5, 2, "system")
    await sc_circle_item_create(group1, go6, 2, "system")

    await sc_circle_item_create(group1, po1, 1, "system")
    await sc_circle_item_create(group1, po2, 1, "system")
    await sc_circle_item_create(group1, po3, 1, "system")
    await sc_circle_item_create(group1, po4, 1, "system")
    await sc_circle_item_create(group1, po5, 1, "system")
    await sc_circle_item_create(group1, po6, 1, "system")
    await sc_circle_item_create(group1, po7, 1, "system")

    await sc_circle_item_create(group2, go1, 2, "system")
    await sc_circle_item_create(group2, go2, 2, "system")
    await sc_circle_item_create(group2, go6, 2, "system")

    await sc_circle_item_create(group2, po1, 1, "system")
    await sc_circle_item_create(group2, po2, 1, "system")
    await sc_circle_item_create(group2, po5, 1, "system")
    await sc_circle_item_create(group2, po6, 1, "system")

    await sc_circle_item_create(group1, sco1, 4, "system")
    await sc_circle_item_create(group2, sco1, 4, "system")
    await sc_circle_item_create(group2, sco2, 4, "system")

    await sc_circle_item_create(group2, scv1, 7, "system")
    """
    --Geotrack
    g1_nf-Non-deforested Farm
    g1_df-Deforested Farm
    g2-Processor
    g3-Roaster
    g4-Grinder
    g5-Consumer
    """
    g1_nf = await geotrack_item_create(
        f"G{tag}:Non-Deforested Farm (South)",
        -0.893562169491987,
        -52.869207132010715,
        f"go1{tag}",
        "geotrack/farm.png",
    )
    logger.info(f"g1_nf: {g1_nf}")
    g1_df = await geotrack_item_create(
        f"G{tag}:Deforested Farm (North)",
        -0.8664821557134423,
        -52.8699933539346,
        f"go2{tag}",
        "geotrack/farm.png",
    )
    logger.info(f"g1_df: {g1_df}")
    g2 = await geotrack_item_create(
        f"G{tag}:Processor",
        -1.3411789,
        -48.5292651,
        f"go3{tag}",
        "geotrack/farm_processor.png",
    )
    logger.info(f"g2: {g2}")
    g3 = await geotrack_item_create(
        f"G{tag}:Roaster",
        -2.5061862,
        -44.197317,
        f"go4{tag}",
        "geotrack/geotrack-roasting.png",
    )
    logger.info(f"g3: {g3}")
    g4 = await geotrack_item_create(
        f"G{tag}:Grinder",
        39.96463,
        -86.2882722,
        f"go5{tag}",
        "geotrack/geotrack-grinding.png",
    )
    logger.info(f"g4: {g4}")
    g5 = await geotrack_item_create(
        f"G{tag}:Consumer", 47.6420983, -122.144643, f"go6{tag}", "building00.jpg"
    )
    logger.info(f"g5: {g5}")
    """
    --Product
    p1_df-Coffee Berry Deforested Farm
    p1_nd-Coffee Berry Non-Deforested Farm
    p2-Parchment Coffee
    p3-Green Coffee Bean 60 Kg Bag
    p4-Roasted Coffee Bean
    p5_df-Coffee Powder Deforested Farm
    p5_nf-Coffee Powder Non-Deforested Farm
    """
    p1_df = await product_item_create(
        f"P{tag}:Coffee Berry Deforested Farm",
        1000,
        10,
        f"po1{tag}",
        "product/product-coffee-red.png",
    )
    p1_nf = await product_item_create(
        f"P{tag}:Coffee Berry Non-Deforested Farm",
        1000,
        10,
        f"po2{tag}",
        "product/product-coffee-green.png",
    )
    logger.info(f"p1: {p1_df}")
    p2 = await product_item_create(
        f"P{tag}:Parchment Coffee",
        1000,
        20,
        f"po3{tag}",
        "product/product-parchment-coffee.png",
    )
    logger.info(f"p2: {p2}")
    p3 = await product_item_create(
        f"P{tag}:Green Coffee Bean 60 Kg Bag",
        12,
        30,
        f"po4{tag}",
        "product/product-coffee-bean-bag.png",
    )
    logger.info(f"p3: {p3}")
    p4 = await product_item_create(
        f"P{tag}:Roasted Coffee Bean",
        1000,
        40,
        f"po5{tag}",
        "product/product-roasted-coffee-beans.png",
    )
    logger.info(f"p4: {p4}")
    p5_nf = await product_item_create(
        f"P{tag}:Coffee Powder from Non-Deforested Farm",
        1,
        50,
        f"po6{tag}",
        "product/product-coffee-powder.png",
    )
    logger.info(f"p5_nf: {p5_nf}")
    p5_df = await product_item_create(
        f"P{tag}:Coffee Powder from Deforested Farm",
        1,
        50,
        f"po7{tag}",
        "product/product-coffee-powder.png",
    )
    logger.info(f"p5_df: {p5_df}")
    """
    --TrackingProducts
    g1_df+p1_df -> g3+p2 -> g3+p3 -> g4+p4 -> g5+p5_df -> g6+p5_df
    g1_nf+p1_nd -> g3+p2 -> g3+p3 -> g4+p4 -> g5+p5_nf -> g6+p5_nf
    """
    t1 = await tracking_products_item_create(0, g1_df, p1_df, 0, "Coffee Berry", f"sco1{tag}")
    logger.info(f"t1: {t1} g1_df+p1_df")
    await tracking_products_item_create(t1, g2, p2, 1, "Parchment Coffee", f"sco1{tag}")
    logger.info(f"t1: {t1} g1_df+p1_df -> g2+p2")
    await tracking_products_item_create(t1, g2, p3, 1, "Green coffee bean 60 Kg Bag", f"sco1{tag}")
    logger.info(f"t1: {t1} g1_df+p1_df -> g2+p2 -> g2+p3")
    await tracking_products_item_create(t1, g3, p4, -1, "Roasting", f"sco1{tag}")
    logger.info(f"t1: {t1} g1_df+p1_df -> g2+p2 -> g2+p3 -> g3+p4")
    await tracking_products_item_create(t1, g4, p5_df, -1, "Roasted Coffee Bean", f"sco1{tag}")
    logger.info(f"t1: {t1} g1_df+p1_df -> g2+p2 -> g2+p3 -> g3+p4 -> g4+p5_df")
    await tracking_products_item_create(t1, g5, p5_df, 0, "Grinding/Coffee Powder", f"sco1{tag}")
    logger.info(f"t1: {t1} g1_df+p1_df -> g2+p2 -> g2+p3 -> g3+p4 -> g4+p5_df -> g5+p5_df")

    t2 = await tracking_products_item_create(0, g1_nf, p1_nf, 0, "Coffee Berry", f"sco2{tag}")
    logger.info(f"t2: {t2} g1_nf+p1_nf")
    await tracking_products_item_create(t2, g2, p2, 1, "Parchment Coffee", f"sco2{tag}")
    logger.info(f"t2: {t2} g1_nf+p1_nf -> g2+p2")
    await tracking_products_item_create(t2, g2, p3, 1, "Green coffee bean 60 Kg Bag", f"sco2{tag}")
    logger.info(f"t2: {t2} g1_nf+p1_nf -> g2+p2 -> g2+p3")
    await tracking_products_item_create(t2, g3, p4, -1, "Roasting", f"sco2{tag}")
    logger.info(f"t2: {t2} g1_nf+p1_nf -> g2+p2 -> g2+p3 -> g3+p4")
    await tracking_products_item_create(t2, g4, p5_nf, -1, "Roasted Coffee Bean", f"sco2{tag}")
    logger.info(f"t2: {t2} g1_nf+p1_nf -> g2+p2 -> g2+p3 -> g3+p4 -> g4+p5_nf")
    await tracking_products_item_create(t2, g5, p5_nf, 0, "Grinding/Coffee Powder", f"sco2{tag}")
    logger.info(f"t2: {t2} g1_nf+p1_nf -> g2+p2 -> g2+p3 -> g3+p4 -> g4+p5_nf -> g5+p5_nf")


async def init_db():
    def read_file_in_chunks(file_path, marker):
        with open(file_path, "r") as file:
            chunk = []
            for line in file:
                if line.strip() == marker:
                    if chunk:
                        yield chunk
                        chunk = []
                else:  # ignore the marker
                    chunk.append(line)
            if chunk:
                yield chunk

    logger.info("Initializing database...")
    sql_script = os.path.join(os.path.dirname(__file__), "create-ledger-tables.sql")

    for chunk in read_file_in_chunks(sql_script, "GO"):
        print(text("".join(chunk)))
        commons.db_session.execute(text("".join(chunk)))

    logger.info("Initialized database")


async def run_main(init_schema: bool, user_name: str):
    if init_schema:
        await init_db()

    logger.info("Populating database with demo data...")
    await main(user_name)


if __name__ == "__main__":
    asyncio.run(
        run_main(
            bool(sys.argv[1]) if len(sys.argv) > 1 else False,
            sys.argv[2] if len(sys.argv) > 2 else "",
        )
    )
