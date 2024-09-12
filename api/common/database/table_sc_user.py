"""table_sc_user.py

Common objects and functions used by database operations for sc_user

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from http import HTTPStatus
from typing import Optional
from sqlalchemy import column, or_
from api.common.database.common_utils import (
    fetch_rows_common,
    get_ledger_id_from_request,
    is_id_value_present,
)
from api.common.models import (
    FoodvibesScUserLedgerView,
)
from api.common.types import (
    CommonError,
    CommonQueryParams,
    CommonQueryResponse,
)


def fetch_sc_user_rows_common(
    commons: CommonQueryParams,
    stmt,
) -> CommonQueryResponse:
    return fetch_rows_common(
        commons,
        stmt,
        FoodvibesScUserLedgerView.sc_user_ledger_id,
        FoodvibesScUserLedgerView.sc_user_tx_id,
        True,
        False,
    )


def fetch_sc_user_rows(
    commons: CommonQueryParams,
    ledger_id: Optional[int] = None,
    sc_user_id: Optional[str] = None,
) -> CommonQueryResponse:
    if not commons.db_session:
        raise Exception("No database session")

    stmt = commons.db_session.query(FoodvibesScUserLedgerView)

    if ledger_id:
        stmt = stmt.where(FoodvibesScUserLedgerView.sc_user_ledger_id == ledger_id)
    elif sc_user_id:
        stmt = stmt.where(column("sc_user_id").ilike(sc_user_id))
    elif commons.global_filter:
        ledger_id = get_ledger_id_from_request(commons.global_filter)

        if ledger_id > 0:
            stmt = stmt.where(column("sc_user_ledger_id").ilike(ledger_id))
        else:
            stmt = stmt.where(
                or_(
                    column("sc_user_id").ilike(commons.global_filter),
                    column("email_addr").ilike(commons.global_filter),
                    column("phone").ilike(commons.global_filter),
                    column("username").ilike(commons.global_filter),
                )
            )

    return fetch_sc_user_rows_common(commons, stmt)


def get_validated_sc_user(
    commons: CommonQueryParams,
    sc_user_id: str | None = None,
    sc_user_ledger_id: int | None = None,
):
    response: CommonQueryResponse = is_id_value_present(sc_user_id, "sc_user_id")

    if response.error.error_level != CommonError.ErrorLevel.SUCCESS:
        response = is_id_value_present(sc_user_ledger_id, "sc_user_ledger_id")

    if response.error.error_level == CommonError.ErrorLevel.SUCCESS:
        if sc_user_id is not None:
            response = fetch_sc_user_rows(commons, sc_user_id=sc_user_id)
        else:
            response = fetch_sc_user_rows(commons, ledger_id=sc_user_ledger_id)

        if len(response.data) == 0:
            response.error.code = HTTPStatus.UNPROCESSABLE_ENTITY
            response.error.error_level = CommonError.ErrorLevel.INFORMATION
            response.error.message = "No sc_user data was found"

    return response
