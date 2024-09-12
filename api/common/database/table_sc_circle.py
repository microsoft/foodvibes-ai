"""table_sc_circle.py

Common objects and functions used by database operations for sc_circle

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from http import HTTPStatus
from typing import List, Optional

from sqlalchemy import and_, column, func, or_
from sqlalchemy.orm import aliased
from api.common.database.common_utils import (
    fetch_rows_common,
    get_ledger_id_alt_from_request,
    get_ledger_id_from_request,
    is_id_value_present,
)
from api.common.models import (
    FoodvibesScCircleLedgerView,
)
from api.common.types import (
    ROLE_GLOBAL_OWNER,
    ROLE_SUPPLY_CHAIN_OWNER,
    CommonError,
    CommonQueryParams,
    CommonQueryResponse,
)


def fetch_sc_circle_rows_common(
    commons: CommonQueryParams,
    stmt,
) -> CommonQueryResponse:
    return fetch_rows_common(
        commons,
        stmt,
        FoodvibesScCircleLedgerView.sc_circle_ledger_id,
        FoodvibesScCircleLedgerView.sc_circle_tx_id,
        True,
        False,
    )


def sc_circle_all_associates_of_sc_user_id(
    commons: CommonQueryParams, access_mask: int
) -> List[str]:
    sc_user_id_list: List[str] = []

    if commons.impersonated_user:
        table_a = FoodvibesScCircleLedgerView
        table_b = aliased(FoodvibesScCircleLedgerView)

        # Define the CTE
        table_a_cte = (
            commons.db_session.query(table_a.sc_group_id)
            .filter(
                and_(
                    func.lower(table_a.sc_user_id) == commons.impersonated_user.lower(),
                    table_a.access_mask.op("&")(access_mask) != 0,
                )
            )
            .cte(name="table_a_cte")
        )

        # Main query using the CTE
        stmt = (
            commons.db_session.query(table_b)
            .distinct()
            .join(table_a_cte, table_a_cte.c.sc_group_id == table_b.sc_group_id)
        )
        orig_bypass_mode_on = commons.bypass_mode_on
        commons.bypass_mode_on = True
        response: CommonQueryResponse = fetch_rows_common(commons, stmt)
        commons.bypass_mode_on = orig_bypass_mode_on

        if response.error.error_level == CommonError.ErrorLevel.SUCCESS:
            for row in response.data:
                if row["sc_user_id"] not in sc_user_id_list:
                    sc_user_id_list.append(row["sc_user_id"])

    return sc_user_id_list


def fetch_sc_circle_rows(
    commons: CommonQueryParams,
    ledger_id: Optional[int] = None,
    sc_group_ledger_id: Optional[int] = None,
    sc_user_ledger_id: Optional[int] = None,
    check_username: Optional[bool] = False,
) -> CommonQueryResponse:
    if not commons.db_session:
        raise Exception("No database session")

    stmt = commons.db_session.query(FoodvibesScCircleLedgerView)
    orig_bypass_mode_on = commons.bypass_mode_on

    if ledger_id:
        stmt = stmt.where(FoodvibesScCircleLedgerView.sc_circle_ledger_id == ledger_id)
    elif sc_group_ledger_id and sc_user_ledger_id:
        stmt = stmt.where(
            and_(
                column("sc_group_ledger_id").ilike(sc_group_ledger_id),
                column("sc_user_ledger_id").ilike(sc_user_ledger_id),
            )
        )
    elif commons and commons.global_filter:
        ledger_id = get_ledger_id_from_request(commons.global_filter)
        ledger_id_alt = get_ledger_id_alt_from_request(commons.global_filter)

        if ledger_id > 0:
            stmt = stmt.where(column("sc_circle_ledger_id").ilike(ledger_id))
        elif ledger_id_alt > 0:
            commons.bypass_mode_on = True
            table_a = FoodvibesScCircleLedgerView
            table_b = aliased(FoodvibesScCircleLedgerView)

            # Define the CTE
            table_a_cte = (
                commons.db_session.query(table_a.sc_group_id)
                .filter(table_a.sc_circle_ledger_id == ledger_id_alt)
                .cte(name="table_a_cte")
            )

            # Main query using the CTE
            stmt = (
                commons.db_session.query(table_b)
                .distinct()
                .join(table_a_cte, table_a_cte.c.sc_group_id == table_b.sc_group_id)
            )
        else:
            stmt = stmt.where(
                or_(
                    column("description").ilike(commons.global_filter),
                    column("username").ilike(commons.global_filter),
                    column("sc_user_id").ilike(commons.global_filter),
                    column("email_addr").ilike(commons.global_filter),
                    column("phone").ilike(commons.global_filter),
                    column("sc_user_username").ilike(commons.global_filter),
                    column("sc_group_id").ilike(commons.global_filter),
                    column("sc_group_description").ilike(commons.global_filter),
                    column("active_roles").ilike(commons.global_filter),
                    column("active_roles_long").ilike(commons.global_filter),
                )
            )

    if (
        commons.impersonated_user
        and commons.active_access_mask & ROLE_GLOBAL_OWNER == 0
        and check_username
    ):
        group_based_access = True if commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER else False
        sc_user_id_list: List[str] = []

        if group_based_access:
            sc_user_id_list = sc_circle_all_associates_of_sc_user_id(
                commons, ROLE_SUPPLY_CHAIN_OWNER
            )

        sc_user_id_list.append(commons.impersonated_user)

        stmt = stmt.where(column("sc_user_id").in_(sc_user_id_list))

    response: CommonQueryResponse = fetch_sc_circle_rows_common(commons, stmt)

    commons.bypass_mode_on = orig_bypass_mode_on

    return response


def get_validated_sc_circle(
    commons: CommonQueryParams,
    sc_circle_ledger_id: int | None = None,
    sc_user_ledger_id: int | None = None,
    sc_group_ledger_id: int | None = None,
):
    response = is_id_value_present(sc_circle_ledger_id, "sc_circle_ledger_id")

    if response.error.error_level == CommonError.ErrorLevel.SUCCESS:
        response = fetch_sc_circle_rows(
            commons,
            ledger_id=sc_circle_ledger_id,
            sc_user_ledger_id=sc_user_ledger_id,
            sc_group_ledger_id=sc_group_ledger_id,
        )

        if len(response.data) == 0:
            response.error.code = HTTPStatus.UNPROCESSABLE_ENTITY
            response.error.error_level = CommonError.ErrorLevel.INFORMATION
            response.error.message = "No sc_circle data was found"

    return response
