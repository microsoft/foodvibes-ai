"""table_product.py

Common objects and functions used by database operations for product

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from sqlalchemy import insert, update
from api.common.database.common_utils import (
    get_timestamp_now,
    make_response_payload,
)
from api.common.database.table_product import fetch_product_rows
from uuid import uuid4
from api.common.roles_permissions import common_upsert_gate
from api.common.types import (
    ROLE_PRODUCT_OWNER,
    CommonError,
    CommonQueryParams,
    CommonQueryResponse,
    DatabaseOperation,
)
from api.common.models import FoodvibesProduct, FoodvibesProductRequest


async def product_upsert(
    commons: CommonQueryParams,
    item: FoodvibesProductRequest,
):
    """product table upsert"""
    try:
        common_upsert_gate(
            commons,
            item.ledger_id,
            ROLE_PRODUCT_OWNER,
            fetch_product_rows,
        )

        return product_upsert_db(commons, item)
    except Exception as error:
        return make_response_payload(str(error))


def product_upsert_db(
    commons: CommonQueryParams,
    item: FoodvibesProductRequest,
):
    """product table upsert database logic

    Args:
        commons (CommonQueryParams): common parameters used in the request
        item (FoodvibesProductRequest): data item being upserted

    Returns:
        _type_: updated response object
    """
    response: CommonQueryResponse = CommonQueryResponse()
    ledger_id = item.ledger_id

    if ledger_id >= 0:
        result = None
        row_new = {
            "product_id": item.product_id or "",
            "description": item.description or "",
            "quantity": item.quantity or 0,
            "storage_tier": item.storage_tier or 0,
            "recorded_at": item.recorded_at or get_timestamp_now(),
            "properties": item.properties or "",
            "username": commons.impersonated_user or item.username,
            "created_at": get_timestamp_now(),
            "operation": DatabaseOperation.CREATE.value,
            "image_id": "product/"
            + (item.image_id or f"{uuid4()}").replace("product/", ""),
        }

        if ledger_id == 0:  # insert
            stmt = insert(FoodvibesProduct).values(row_new)
            result = commons.db_session.execute(stmt)
            ledger_id = (
                0
                if result.inserted_primary_key is None
                else result.inserted_primary_key[0]
            )
            message = f"added new Product with [ID={ledger_id}]"
        else:  # update
            row_new["operation"] = DatabaseOperation.UPDATE.value
            message = f"updated Product [ID={ledger_id}]"
            stmt = (
                update(FoodvibesProduct)
                .values(row_new)
                .where(FoodvibesProduct.ledger_id == ledger_id)
            )
            result = commons.db_session.execute(stmt)

        response = fetch_product_rows(commons)
        response.meta.last_id = ledger_id

        response.error.append_message(message)
        commons.db_session.commit()

        if ledger_id == 0:
            response.error = CommonError(
                1, "Upsert failed", CommonError.ErrorLevel.ERROR
            )

    return response
