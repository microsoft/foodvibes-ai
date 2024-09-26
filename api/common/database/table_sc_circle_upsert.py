"""table_sc_circle.py

Common objects and functions used by database operations for sc_circle

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from sqlalchemy import insert, update

from api.common.database.common_utils import (
    get_timestamp_now,
    make_response_payload,
)
from api.common.database.table_sc_circle import (
    fetch_sc_circle_rows,
    get_validated_sc_circle,
)
from api.common.types import (
    CommonError,
    CommonQueryParams,
    CommonQueryResponse,
    DatabaseOperation,
)
from api.common.models import FoodvibesScCircle, FoodvibesScCircleRequest


async def sc_circle_upsert(
    commons: CommonQueryParams,
    item: FoodvibesScCircleRequest,
):
    """sc_circle table upsert"""
    try:
        response: CommonQueryResponse = CommonQueryResponse()

        if commons.db_session:
            response = sc_circle_upsert_db(response, commons, item)

        return response
    except Exception as error:
        return make_response_payload(str(error))


def sc_circle_upsert_db(
    response_default: CommonQueryResponse,
    commons: CommonQueryParams,
    item: FoodvibesScCircleRequest,
):
    """sc_circle table upsert database logic

    Args:
        response_default (CommonQueryResponse): default response object
        commons (CommonQueryParams): common parameters used in the request
        item (FoodvibesScCircleRequest): data item being upserted

    Returns:
        _type_: updated response object
    """
    response: CommonQueryResponse = response_default
    ledger_id = -1

    if item.ledger_id > 0:
        response = get_validated_sc_circle(
            commons,
            sc_circle_ledger_id=item.ledger_id,
            sc_user_ledger_id=item.sc_user_ledger_id,
            sc_group_ledger_id=item.sc_group_ledger_id,
        )

        if (
            response.error.error_level == CommonError.ErrorLevel.SUCCESS
            or response.error.error_level == CommonError.ErrorLevel.INFORMATION
        ):
            ledger_id = item.ledger_id
    else:
        ledger_id = 0

    if ledger_id >= 0:
        result = None
        row_new = {
            "sc_group_ledger_id": item.sc_group_ledger_id or "",
            "sc_user_ledger_id": item.sc_user_ledger_id or "",
            "access_mask": item.access_mask or 0,
            "deleted": 1 if item.deleted is True else 0,
            "username": commons.impersonated_user or item.username,
            "created_at": get_timestamp_now(),
        }

        if ledger_id == 0:  # insert
            stmt = insert(FoodvibesScCircle).values(row_new)
            result = commons.db_session.execute(stmt)
            ledger_id = 0 if result.inserted_primary_key is None else result.inserted_primary_key[0]
            message = f"added new ScCircle with [ID={ledger_id}]"
        else:  # update
            row_new["operation"] = DatabaseOperation.UPDATE.value
            message = f"updated ScCircle [ID={ledger_id}]"
            stmt = (
                update(FoodvibesScCircle)
                .values(row_new)
                .where(FoodvibesScCircle.ledger_id == ledger_id)
            )
            result = commons.db_session.execute(stmt)

        response = fetch_sc_circle_rows(commons)
        response.meta.last_id = ledger_id

        response.error.append_message(message)
        commons.db_session.commit()

        if ledger_id == 0:
            response.error = CommonError(1, "Upsert failed", CommonError.ErrorLevel.ERROR)

    return response
