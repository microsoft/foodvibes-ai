"""database.py

Common objects and functions used by all modules for roles and permissions management

20240725 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Callable, List, Tuple
from sqlalchemy import column, or_
from api.common.database.table_sc_circle import sc_circle_all_associates_of_sc_user_id
from api.common.types import (
    ROLE_GEOTRACK_OWNER,
    ROLE_GLOBAL_OWNER,
    ROLE_PRODUCT_OWNER,
    ROLE_SUPPLY_CHAIN_OWNER,
    ROLE_SUPPLY_CHAIN_VIEWER,
    CommonError,
    CommonQueryParams,
    CommonQueryResponse,
)

"""

Create fns to blur out single p, g &/or tpCreate fns that take historical p, g &/or tp and username
based on username will blur out +/-2 records 
op1: p read1-Fetch sc_user where sc_user_id == user into A2-If A.base_mask & 00001 then fetch all p
where sc_user == user (in any historical p) into B (adjust total count based on data eligible to be
returned and blur out +/-2 records if full history is on)3-If A.base_mask & 11100 then fetch all p
into B4-Return B passed through blur fns 
op2: p upsert by ledger_id == 00-reject if missing sc_group_id1-Fetch sc_user where sc_user_id ==
user into A2-if A.base_mask & 10101 then do op3-If op was done then return data based on op1 rules
op3: p upsert by ledger_id > 00-reject if missing username & sc_group_id1-Fetch sc_user where
sc_user_id == user into A2-Fetch p by ledger_id into B
3-if A.base_mask & 10101 and B.username == user or A.base_mask & 10000 then do op4-If base_mask &
00100 then
4.1-Fetch all sc_circle where sc_user_id == user into C4.2-Search sc_circle for sc_user_id
== B.username and sc_group_id in C.sc_group_id into D4.3-If D has data then do op5-If op was done
then return data based on op1 rules
"""


def is_op_allowed(
    function_name: str, commons: CommonQueryParams, commons_lookup: CommonQueryParams
) -> bool:
    print(f"Checking if operation is allowed for {function_name}")
    print(f"impersonated_user: {commons.impersonated_user}")
    print(f"group_id: {commons.group_id}")
    print(f"active_access_mask: {commons.active_access_mask}")

    if function_name == "constants_get":
        if (
            commons.active_access_mask & ROLE_PRODUCT_OWNER
            or commons.active_access_mask & ROLE_GEOTRACK_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_VIEWER
            or commons.active_access_mask & ROLE_GLOBAL_OWNER
        ):
            return True
    if function_name == "constants_put":
        if commons.active_access_mask & ROLE_GLOBAL_OWNER:
            return True
    if function_name == "geotrack_get":
        if (
            commons.active_access_mask & ROLE_GEOTRACK_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_VIEWER
            or commons.active_access_mask & ROLE_GLOBAL_OWNER
        ):
            return True
    if function_name == "geotrack_put":
        if (
            commons.active_access_mask & ROLE_GEOTRACK_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER
            or commons.active_access_mask & ROLE_GLOBAL_OWNER
        ):
            return True
    if function_name == "map_key":
        if (
            commons.active_access_mask & ROLE_PRODUCT_OWNER
            or commons.active_access_mask & ROLE_GEOTRACK_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_VIEWER
            or commons.active_access_mask & ROLE_GLOBAL_OWNER
        ):
            return True
    if function_name == "product_get":
        if (
            commons.active_access_mask & ROLE_PRODUCT_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_VIEWER
            or commons.active_access_mask & ROLE_GLOBAL_OWNER
        ):
            return True
    if function_name == "product_put":
        if (
            commons.active_access_mask & ROLE_PRODUCT_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER
            or commons.active_access_mask & ROLE_GLOBAL_OWNER
        ):
            return True
    if (
        function_name == "sc_circle_get"
        or function_name == "sc_group_get"
        or function_name == "sc_user_get"
    ):
        if (
            commons.active_access_mask & ROLE_PRODUCT_OWNER
            or commons.active_access_mask & ROLE_GEOTRACK_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_VIEWER
            or commons.active_access_mask & ROLE_GLOBAL_OWNER
        ):
            return True
    if (
        function_name == "sc_circle_put"
        or function_name == "sc_group_put"
        or function_name == "sc_user_put"
    ):
        if (
            commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER
            or commons.active_access_mask & ROLE_GLOBAL_OWNER
        ):
            return True
    if function_name == "tracking_products_get":
        if (
            commons.active_access_mask & ROLE_PRODUCT_OWNER
            or commons.active_access_mask & ROLE_GEOTRACK_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_VIEWER
            or commons.active_access_mask & ROLE_GLOBAL_OWNER
        ):
            return True
    if function_name == "tracking_products_put":
        if (
            commons.active_access_mask & ROLE_GEOTRACK_OWNER
            or commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER
            or commons.active_access_mask & ROLE_GLOBAL_OWNER
        ):
            return True

    return False


def common_get(
    commons: CommonQueryParams,
    access_mask_base: int,
    stmt,
    fetch_fn: Callable,
    is_tracking_products: bool = False,
) -> CommonQueryResponse:
    if not commons.impersonated_user:
        raise Exception("No impersonated user")

    if not (
        commons.active_access_mask & ROLE_GLOBAL_OWNER
        or commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER
        or commons.active_access_mask & ROLE_SUPPLY_CHAIN_VIEWER
        or commons.active_access_mask & access_mask_base
    ):
        raise Exception("Insufficient permissions")

    is_global_owner = True if commons.active_access_mask & ROLE_GLOBAL_OWNER else False

    if not is_global_owner:
        group_based_access = (
            True
            if commons.active_access_mask & (ROLE_SUPPLY_CHAIN_OWNER | ROLE_SUPPLY_CHAIN_VIEWER)
            else False
        )
        commons.privacy_on = False
        sc_user_id_list: List[str] = []

        if group_based_access:
            sc_user_id_list = sc_circle_all_associates_of_sc_user_id(
                commons, commons.active_access_mask
            )

        if commons.active_access_mask & access_mask_base:
            sc_user_id_list.append(commons.impersonated_user)

            commons.privacy_on = False if group_based_access else True

        stmt_inner = column("username").in_(sc_user_id_list)

        if is_tracking_products:
            stmt_inner_list = [stmt_inner]

            if commons.active_access_mask & ROLE_PRODUCT_OWNER:
                stmt_inner_list.append(column("product_username").in_(sc_user_id_list))
            if commons.active_access_mask & ROLE_GEOTRACK_OWNER:
                stmt_inner_list.append(column("geotrack_username").in_(sc_user_id_list))

            is_report_mode_originally_on = commons.report_mode

            if not is_report_mode_originally_on:
                commons.report_mode = True

            commons.bypass_mode_on = True
            response: CommonQueryResponse = fetch_fn(commons, stmt.where(or_(*stmt_inner_list)))
            commons.bypass_mode_on = False

            if not is_report_mode_originally_on:
                commons.report_mode = False

            if response.error.error_level == CommonError.ErrorLevel.SUCCESS:
                tracking_products_ledger_id_list: List[int] = []

                for rec in response.data:
                    if rec["tracking_products_ledger_id"] not in tracking_products_ledger_id_list:
                        tracking_products_ledger_id_list.append(rec["tracking_products_ledger_id"])

                stmt_inner = column("tracking_products_ledger_id").in_(
                    tracking_products_ledger_id_list
                )

        stmt = stmt.where(stmt_inner)

    return fetch_fn(commons, stmt)


def common_upsert_gate(
    commons: CommonQueryParams,
    ledger_id: int,
    permission_mask_base: int,
    fetch_fn: Callable,
    sc_user_id_list_override: List[str] = [],
) -> Tuple[CommonQueryResponse, List[str]]:
    if not commons.impersonated_user:
        raise Exception("No impersonated user")

    if not (
        commons.active_access_mask & ROLE_GLOBAL_OWNER
        or commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER
        or commons.active_access_mask & permission_mask_base
    ):
        raise Exception("Insufficient permissions")

    sc_user_id_list: List[str] = []
    results: CommonQueryResponse = fetch_fn(commons, ledger_id=ledger_id)

    if (
        results.error.error_level == CommonError.ErrorLevel.SUCCESS
        and results.meta.row_count
        and (
            commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER
            or commons.active_access_mask & permission_mask_base
        )
    ):
        group_based_access = True if commons.active_access_mask & ROLE_SUPPLY_CHAIN_OWNER else False

        if group_based_access:
            if len(sc_user_id_list_override) > 0:
                sc_user_id_list = sc_user_id_list_override
            else:
                sc_user_id_list = sc_circle_all_associates_of_sc_user_id(
                    commons, commons.active_access_mask
                )

        if commons.active_access_mask & permission_mask_base:
            sc_user_id_list.append(commons.impersonated_user)

        if results.data[0].get("username") not in sc_user_id_list:
            raise Exception("Target record not in the same group")

    return results, sc_user_id_list
