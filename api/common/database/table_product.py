"""table_product.py

Common objects and functions used by database operations for product

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Optional
from sqlalchemy import column, or_
from api.common.database.common_utils import (
    fetch_rows_common,
    get_ledger_id_from_request,
)
from api.common.models import (
    FoodvibesProductLedgerView,
)
from api.common.roles_permissions import (
    common_get,
)
from api.common.types import (
    ROLE_PRODUCT_OWNER,
    CommonQueryParams,
    CommonQueryResponse,
)


def fetch_product_rows_common(
    commons: CommonQueryParams,
    stmt,
) -> CommonQueryResponse:
    return fetch_rows_common(
        commons,
        stmt,
        FoodvibesProductLedgerView.product_ledger_id,
        FoodvibesProductLedgerView.product_tx_id,
        True,
        False,
    )


def fetch_product_rows(
    commons: CommonQueryParams,
    ledger_id: Optional[int] = None,
    product_id: Optional[str] = None,
) -> CommonQueryResponse:
    if not commons.db_session:
        raise Exception("No database session")

    stmt = commons.db_session.query(FoodvibesProductLedgerView)

    if ledger_id:
        stmt = stmt.where(FoodvibesProductLedgerView.product_ledger_id == ledger_id)
    elif product_id:
        stmt = stmt.where(column("product_id").ilike(product_id))
    elif commons.global_filter:
        ledger_id = get_ledger_id_from_request(commons.global_filter)

        if ledger_id > 0:
            stmt = stmt.where(column("product_ledger_id").ilike(ledger_id))
        else:
            stmt = stmt.where(
                or_(
                    column("product_id").ilike(commons.global_filter),
                    column("description").ilike(commons.global_filter),
                    column("properties").ilike(commons.global_filter),
                    column("username").ilike(commons.global_filter),
                )
            )

    return common_get(
        commons,
        ROLE_PRODUCT_OWNER,
        stmt,
        fetch_product_rows_common,
    )
