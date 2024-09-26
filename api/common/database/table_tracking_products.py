"""table_tracking_products.py

Common objects and functions used by database operations for tracking products

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Annotated, Any, Optional

from fastapi import Depends
from sqlalchemy import and_, column, or_
from api.common.database.common_utils import (
    fetch_rows_common,
    get_ledger_id_from_request,
)
from api.common.models import (
    FoodvibesTrackingProductsLedgerView,
)
from api.common.roles_permissions import common_get
from api.common.types import (
    ROLE_GEOTRACK_OWNER,
    ROLE_PRODUCT_OWNER,
    CommonQueryParams,
    CommonQueryResponse,
)


def fetch_tracking_products_rows_common(
    commons: CommonQueryParams,
    stmt,
) -> CommonQueryResponse:
    return fetch_rows_common(
        commons,
        stmt,
        FoodvibesTrackingProductsLedgerView.tracking_products_ledger_id,
        FoodvibesTrackingProductsLedgerView.tracking_products_tx_id,
        True,
        True,
    )


def fetch_tracking_products_rows(
    commons: Annotated[Any, Depends(CommonQueryParams)] = None,
    ledger_id: Optional[int] = None,
    geotrack_ledger_id: Optional[int] = None,
    product_ledger_id: Optional[int] = None,
) -> CommonQueryResponse:
    if not commons.db_session:
        raise Exception("No database session")

    stmt = commons.db_session.query(FoodvibesTrackingProductsLedgerView)

    if ledger_id:
        stmt = stmt.where(
            FoodvibesTrackingProductsLedgerView.tracking_products_ledger_id == ledger_id
        )
    elif geotrack_ledger_id or product_ledger_id:
        if geotrack_ledger_id and product_ledger_id:
            stmt = stmt.where(
                and_(
                    column("geotrack_ledger_id").__eq__(geotrack_ledger_id),
                    column("product_ledger_id").__eq__(product_ledger_id),
                )
            )
        elif geotrack_ledger_id:
            stmt = stmt.where(
                column("geotrack_ledger_id").__eq__(geotrack_ledger_id),
            )
        else:
            stmt = stmt.where(
                column("product_ledger_id").__eq__(product_ledger_id),
            )
    elif commons.global_filter:
        ledger_id = get_ledger_id_from_request(commons.global_filter)

        if ledger_id > 0:
            stmt = stmt.where(column("tracking_products_ledger_id").ilike(ledger_id))
        else:
            stmt = stmt.where(
                or_(
                    column("properties").ilike(commons.global_filter),
                    column("username").ilike(commons.global_filter),
                    column("geotrack_id").ilike(commons.global_filter),
                    column("name").ilike(commons.global_filter),
                    column("details").ilike(commons.global_filter),
                    column("geotrack_properties").ilike(commons.global_filter),
                    column("geotrack_username").ilike(commons.global_filter),
                    column("product_id").ilike(commons.global_filter),
                    column("description").ilike(commons.global_filter),
                    column("product_properties").ilike(commons.global_filter),
                    column("product_username").ilike(commons.global_filter),
                )
            )

    return common_get(
        commons,
        ROLE_PRODUCT_OWNER | ROLE_GEOTRACK_OWNER,
        stmt,
        fetch_tracking_products_rows_common,
        True,
    )
