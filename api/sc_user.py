"""sc_user.py

Provides endpoint for CRUD operations on foodvibes_sc_user table

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Annotated
from fastapi import Depends, Request
from api.common.database.table_sc_user_upsert import sc_user_upsert
from api.common.access_check import access_check
from api.common.types import (
    CommonQueryParams,
    config,
)
from api.common.database.common_utils import (
    make_response_payload,
)
from api.common.database.table_sc_user import fetch_sc_user_rows
from api.common.models import FoodvibesScUserRequest


@config.app.get("/sc_user/", response_model=None)
@access_check(check_for_roles=True)
async def sc_user_get(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
):
    """Endpoint for sc_user table query"""
    try:
        return fetch_sc_user_rows(commons)
    except Exception as error:
        return make_response_payload(str(error))


@config.app.put("/sc_user/", response_model=None)
@access_check(check_for_roles=True)
async def sc_user_put(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
    item: FoodvibesScUserRequest,
):
    """Endpoint for sc_user table upsert"""
    return await sc_user_upsert(commons, item)
