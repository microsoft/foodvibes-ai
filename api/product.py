"""product.py

Provides endpoint for CRUD operations on foodvibes_product table

20240301 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Annotated
from fastapi import Depends, Request
from api.common.access_check import access_check
from api.common.types import CommonQueryParams, config
from api.common.database.common_utils import make_response_payload
from api.common.database.table_product import fetch_product_rows
from api.common.database.table_product_upsert import product_upsert
from api.common.models import FoodvibesProductRequest


@config.app.get("/product/", response_model=None)
@access_check(check_for_roles=True)
async def product_get(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
):
    """Endpoint for product table query"""
    try:
        return fetch_product_rows(commons)
    except Exception as error:
        return make_response_payload(str(error))


@config.app.put("/product/", response_model=None)
@access_check(check_for_roles=True)
async def product_put(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
    item: FoodvibesProductRequest,
):
    """Endpoint for product table upsert"""
    return await product_upsert(commons, item)
