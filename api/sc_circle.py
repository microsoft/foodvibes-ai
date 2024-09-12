"""sc_circle.py

Provides endpoint for CRUD operations on foodvibes_sc_circle table

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Annotated
from fastapi import Depends, Request
from api.common.database.table_sc_circle_upsert import sc_circle_upsert
from api.common.access_check import access_check
from api.common.types import (
    CommonQueryParams,
    config,
)
from api.common.database.common_utils import (
    make_response_payload,
)
from api.common.database.table_sc_circle import fetch_sc_circle_rows
from api.common.models import FoodvibesScCircleRequest


@config.app.get("/sc_circle/", response_model=None)
@access_check(check_for_roles=True)
async def sc_circle_get(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
):
    """Endpoint for sc_circle table query"""
    try:
        return fetch_sc_circle_rows(commons, check_username=True)
    except Exception as error:
        return make_response_payload(str(error))


@config.app.put("/sc_circle/", response_model=None)
@access_check(check_for_roles=True)
async def sc_circle_put(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
    item: FoodvibesScCircleRequest,
):
    """Endpoint for sc_circle table upsert"""
    return await sc_circle_upsert(commons, item)
