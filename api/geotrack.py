"""geotrack.py

Provides endpoint for CRUD operations on foodvibes_geotrack table

20240301 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Annotated
from fastapi import Depends, Request
from api.common.database.table_geotrack_upsert import geotrack_upsert
from api.common.access_check import access_check
from api.common.types import CommonQueryParams, config
from api.common.database.common_utils import make_response_payload
from api.common.database.table_geotrack import fetch_geotrack_rows
from api.common.models import FoodvibesGeotrackRequest


@config.app.get("/geotrack/", response_model=None)
@access_check(check_for_roles=True)
async def geotrack_get(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
):
    """Endpoint for geotrack table query"""
    try:
        return fetch_geotrack_rows(commons)
    except Exception as error:
        return make_response_payload(str(error))


@config.app.put("/geotrack/", response_model=None)
@access_check(check_for_roles=True)
async def geotrack_put(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
    item: FoodvibesGeotrackRequest,
):
    # """Endpoint for geotrack table upsert"""
    return await geotrack_upsert(commons, item)
