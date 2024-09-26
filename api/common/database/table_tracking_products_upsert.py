"""table_tracking_products.py

Common objects and functions used by database operations for tracking products

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Annotated, Any
from fastapi import Depends
from sqlalchemy import insert, update
from api.common.database.common_utils import (
    get_timestamp_now,
    make_response_payload,
)
from api.common.database.table_tracking_products import fetch_tracking_products_rows
from api.common.roles_permissions import common_upsert_gate
from api.common.types import (
    ROLE_GEOTRACK_OWNER,
    ROLE_PRODUCT_OWNER,
    CommonError,
    CommonQueryParams,
    CommonQueryResponse,
    DatabaseOperation,
)
from api.common.database.table_geotrack import fetch_geotrack_rows
from api.common.database.table_product import fetch_product_rows
from api.common.models import (
    FoodvibesTrackingProducts,
    FoodvibesTrackingProductsRequest,
)


async def tracking_products_upsert(
    commons: Annotated[Any, Depends(CommonQueryParams)],
    item: FoodvibesTrackingProductsRequest,
):
    """tracking_products table upsert"""
    try:
        common_upsert_gate(
            commons,
            item.ledger_id,
            ROLE_PRODUCT_OWNER | ROLE_GEOTRACK_OWNER,
            fetch_tracking_products_rows,
        )

        return tracking_products_upsert_db(commons, item)
    except Exception as error:
        return make_response_payload(str(error))


def tracking_products_upsert_db(
    commons: CommonQueryParams,
    item: FoodvibesTrackingProductsRequest,
):
    """geotrack table upsert database logic

    Args:
        commons (CommonQueryParams): common parameters used in the request
        item (FoodvibesTrackingProductsRequest): data item being upserted

    Returns:
        _type_: updated response object
    """
    if item.geotrack_ledger_id == 0 or item.product_ledger_id == 0:
        raise Exception("Missing required geotrack and/or product ledger_id data")

    response_geotrack, sc_user_id_list_override = common_upsert_gate(
        commons,
        item.geotrack_ledger_id,
        ROLE_PRODUCT_OWNER | ROLE_GEOTRACK_OWNER,
        fetch_geotrack_rows,
    )
    response_product, sc_user_id_list_override = common_upsert_gate(
        commons,
        item.product_ledger_id,
        ROLE_PRODUCT_OWNER | ROLE_GEOTRACK_OWNER,
        fetch_product_rows,
        sc_user_id_list_override,
    )
    ledger_id = item.ledger_id
    geotrack_tx_id = (
        response_geotrack.data[0]["geotrack_tx_id"] if len(response_geotrack.data) else 0
    )
    product_tx_id = response_product.data[0]["product_tx_id"] if len(response_product.data) else 0

    if geotrack_tx_id == 0 or product_tx_id == 0:
        raise Exception("Missing required geotrack and/or product tx_id data")

    response: CommonQueryResponse = CommonQueryResponse()
    result = None
    row_new = {
        "geotrack_ledger_id": item.geotrack_ledger_id,
        "geotrack_tx_id": geotrack_tx_id,
        "product_ledger_id": item.product_ledger_id,
        "product_tx_id": product_tx_id,
        "product_aggregation": item.product_aggregation,
        "notes": item.notes,
        "recorded_at": item.recorded_at or get_timestamp_now(),
        "properties": item.properties or "",
        "username": commons.impersonated_user or item.username,
        "created_at": get_timestamp_now(),
        "operation": DatabaseOperation.CREATE.value,
    }

    if ledger_id == 0:  # insert
        stmt = insert(FoodvibesTrackingProducts).values(row_new)
        result = commons.db_session.execute(stmt)
        ledger_id = 0 if result.inserted_primary_key is None else result.inserted_primary_key[0]
        message = f"added new TrackingProducts with [ID={ledger_id}]"
    else:  # update
        row_new["operation"] = DatabaseOperation.UPDATE.value
        message = f"updated TrackingProducts [ID={ledger_id}]"
        stmt = (
            update(FoodvibesTrackingProducts)
            .values(row_new)
            .where(FoodvibesTrackingProducts.ledger_id == ledger_id)
        )
        result = commons.db_session.execute(stmt)

    response = fetch_tracking_products_rows(commons)
    response.meta.last_id = ledger_id

    response.error.append_message(message)
    commons.db_session.commit()

    if ledger_id == 0:
        response.error = CommonError(1, "Upsert failed", CommonError.ErrorLevel.ERROR)

    return response
