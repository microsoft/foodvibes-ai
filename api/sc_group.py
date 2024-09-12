"""sc_group.py

Provides endpoint for CRUD operations on foodvibes_sc_group table

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Annotated
from fastapi import Depends, Request
from api.common.database.table_sc_group_upsert import sc_group_upsert
from api.common.access_check import access_check
from api.common.types import (
    CommonQueryParams,
    config,
)
from api.common.database.common_utils import (
    make_response_payload,
)
from api.common.database.table_sc_group import fetch_sc_group_rows
from api.common.models import FoodvibesScGroupRequest


@config.app.get("/sc_group/", response_model=None)
@access_check(check_for_roles=True)
async def sc_group_get(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
):
    """Endpoint for sc_group table query"""
    try:
        return fetch_sc_group_rows(commons)
    except Exception as error:
        return make_response_payload(str(error))


@config.app.put("/sc_group/", response_model=None)
@access_check(check_for_roles=True)
async def sc_group_put(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
    item: FoodvibesScGroupRequest,
):
    """Endpoint for sc_group table upsert"""
    return await sc_group_upsert(commons, item)
