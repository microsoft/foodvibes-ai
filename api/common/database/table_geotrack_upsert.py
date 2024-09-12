"""table_geotrack.py

Common objects and functions used by database operations for geotrack

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from http import HTTPStatus
from typing import Annotated
from fastapi import Depends
from sqlalchemy import insert, update
from api.common.database.common_utils import (
    get_timestamp_now,
    make_response_payload,
)
from api.common.database.table_geotrack import fetch_geotrack_rows
from uuid import uuid4
from api.common.roles_permissions import common_upsert_gate
from api.common.types import (
    ROLE_GEOTRACK_OWNER,
    CommonError,
    CommonQueryParams,
    CommonQueryResponse,
    DatabaseOperation,
)
from api.common.models import FoodvibesGeotrack, FoodvibesGeotrackRequest


async def geotrack_upsert(
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
    item: FoodvibesGeotrackRequest,
):
    """geotrack table upsert"""
    try:
        common_upsert_gate(
            commons,
            item.ledger_id,
            ROLE_GEOTRACK_OWNER,
            fetch_geotrack_rows,
        )

        if (
            item.latitude is None or abs(float(item.latitude)) > 90
        ):  # 0 is a valid value so checking for None
            return make_response_payload(
                f'Missing or invalid latitude "{item.latitude}"',
                HTTPStatus.UNPROCESSABLE_ENTITY,
            )
        if (
            item.longitude is None or abs(float(item.longitude)) > 180
        ):  # 0 is a valid value so checking for None
            return make_response_payload(
                f'Missing or invalid longitude "{item.longitude}"',
                HTTPStatus.UNPROCESSABLE_ENTITY,
            )

        return geotrack_upsert_db(commons, item)
    except Exception as error:
        return make_response_payload(str(error))


def geotrack_upsert_db(
    commons: CommonQueryParams,
    item: FoodvibesGeotrackRequest,
):
    """geotrack table upsert database logic

    Args:
        commons (CommonQueryParams): common parameters used in the request
        item (FoodvibesGeotrackRequest): data item being upserted

    Returns:
        _type_: updated response object
    """
    response: CommonQueryResponse = CommonQueryResponse()
    ledger_id = item.ledger_id

    if ledger_id >= 0:
        result = None
        row_new = {
            "geotrack_id": item.geotrack_id,
            "name": item.name or "",
            "details": item.details or "",
            "latitude": item.latitude,
            "longitude": item.longitude,
            "recorded_at": item.recorded_at or get_timestamp_now(),
            "properties": item.properties or "",
            "username": commons.impersonated_user or item.username,
            "created_at": get_timestamp_now(),
            "operation": DatabaseOperation.CREATE.value,
            "image_id": "geotrack/" + (item.image_id or f"{uuid4()}").replace("geotrack/", ""),
        }

        if ledger_id == 0:  # insert
            stmt = insert(FoodvibesGeotrack).values(row_new)
            result = commons.db_session.execute(stmt)
            ledger_id = 0 if result.inserted_primary_key is None else result.inserted_primary_key[0]
            message = f"added new Geotrack with [ID={ledger_id}]"
        else:  # update
            row_new["operation"] = DatabaseOperation.UPDATE.value
            message = f"updated Geotrack [ID={ledger_id}]"
            stmt = (
                update(FoodvibesGeotrack)
                .values(row_new)
                .where(FoodvibesGeotrack.ledger_id == ledger_id)
            )
            result = commons.db_session.execute(stmt)

        response = fetch_geotrack_rows(commons)
        response.meta.last_id = ledger_id

        response.error.append_message(message)
        commons.db_session.commit()

        if ledger_id == 0:
            response.error = CommonError(1, "Upsert failed", CommonError.ErrorLevel.ERROR)

    return response
