"""tracking_products.py

Provides endpoint for CRUD operations on foodvibes_tracking_products table

20240301 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Annotated
from fastapi import Depends, Request
from api.common.database.table_tracking_products_upsert import tracking_products_upsert
from api.common.access_check import access_check
from api.common.types import CommonQueryParams, config
from api.common.database.common_utils import make_response_payload
from api.common.database.table_tracking_products import fetch_tracking_products_rows
from api.common.models import FoodvibesTrackingProductsRequest


@config.app.get("/tracking_products/", response_model=None)
@access_check(check_for_roles=True)
async def tracking_products_get(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
):
    """Endpoint for tracking_products table query"""
    try:
        return fetch_tracking_products_rows(commons)
    except Exception as error:
        return make_response_payload(str(error))


@config.app.put("/tracking_products/", response_model=None)
@access_check(check_for_roles=True)
async def tracking_products_put(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
    item: FoodvibesTrackingProductsRequest,
):
    """Endpoint for tracking_products table upsert"""
    return await tracking_products_upsert(commons, item)
