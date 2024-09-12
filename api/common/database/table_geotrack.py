"""table_geotrack.py

Common objects and functions used by database operations for geotrack

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Annotated, Any, Optional
from fastapi import Depends
from sqlalchemy import column, or_
from api.common.database.common_utils import (
    fetch_rows_common,
    get_ledger_id_from_request,
)
from api.common.models import (
    FoodvibesGeotrackLedgerView,
)
from api.common.roles_permissions import common_get
from api.common.types import (
    ROLE_GEOTRACK_OWNER,
    CommonQueryParams,
    CommonQueryResponse,
)


def fetch_getotrack_rows_common(
    commons: CommonQueryParams,
    stmt,
) -> CommonQueryResponse:
    return fetch_rows_common(
        commons,
        stmt,
        FoodvibesGeotrackLedgerView.geotrack_ledger_id,
        FoodvibesGeotrackLedgerView.geotrack_tx_id,
        True,
        False,
    )


def fetch_geotrack_rows(
    commons: Annotated[Any, Depends(CommonQueryParams)] = None,
    ledger_id: Optional[int] = None,
    geotrack_id: Optional[str] = None,
) -> CommonQueryResponse:
    if not commons.db_session:
        raise Exception("No database session")

    stmt = commons.db_session.query(FoodvibesGeotrackLedgerView)

    if ledger_id:
        stmt = stmt.where(FoodvibesGeotrackLedgerView.geotrack_ledger_id == ledger_id)
    elif geotrack_id:
        stmt = stmt.where(column("geotrack_id").ilike(geotrack_id))
    elif commons and commons.global_filter:
        ledger_id = get_ledger_id_from_request(commons.global_filter)

        if ledger_id > 0:
            stmt = stmt.where(column("geotrack_ledger_id").ilike(ledger_id))
        else:
            stmt = stmt.where(
                or_(
                    column("geotrack_id").ilike(commons.global_filter),
                    column("name").ilike(commons.global_filter),
                    column("details").ilike(commons.global_filter),
                    column("properties").ilike(commons.global_filter),
                    column("username").ilike(commons.global_filter),
                )
            )

    return common_get(
        commons,
        ROLE_GEOTRACK_OWNER,
        stmt,
        fetch_getotrack_rows_common,
    )
