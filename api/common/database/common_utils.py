"""common_utils.py

Common objects and functions used by database operations

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from datetime import datetime, timezone
from http import HTTPStatus
from typing import Annotated, Any, List, Optional
from fastapi import Depends
from fastapi.responses import HTMLResponse
from sqlalchemy import Column, and_, asc, column, desc, or_
from sqlalchemy.dialects import mssql
from sqlalchemy.orm import Session

from api.common.config import logger
from api.common.models import (
    FoodvibesConstants,
    FoodvibesTrackingProductsLedgerView,
)
from api.common.storage import StorageManager
from api.common.types import (
    CommonError,
    CommonQueryParams,
    CommonQueryResponse,
    CommonQueryResponseMeta,
    CommonQueryResponseRow,
    config,
)

ROOT_PATH_BLOB_STORAGE = StorageManager(
    config.images_blob_service_url,
    config.images_blob_container_name,
)


def show_sql(stmt, is_select: bool = True):
    output = ""

    if is_select:
        output = stmt.statement.compile(
            dialect=mssql.dialect(), compile_kwargs={"literal_binds": True}
        )
    else:
        output = stmt.compile(dialect=mssql.dialect(), compile_kwargs={"literal_binds": False})

    print(f"\n** SQL **\n{str(output)}\n")


def get_session() -> Session:
    return Session(config.db_engine)


def get_timestamp_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def make_response_payload(
    content: str = "Error",
    status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR,
    is_html: bool = False,
):
    if is_html is True:
        return HTMLResponse(content=content, status_code=HTTPStatus.OK)

    if status_code != HTTPStatus.OK:
        logger.error(content)

    return CommonQueryResponse(
        CommonError(error_level=CommonError.ErrorLevel.ERROR, code=1, msessage=str(content)),
        CommonQueryResponseMeta(0, 0, CommonQueryParams()),
        [],
    )


def make_data_row(rowdata) -> CommonQueryResponseRow:
    newrow: CommonQueryResponseRow = {}

    for column_name, column_value in vars(rowdata).items():
        if not column_name.startswith("_"):
            if isinstance(column_value, datetime):
                column_value = str(column_value)

            if column_name.endswith("image_url"):
                id_column_name = column_name.replace("_url", "_id")
                id_column_value = getattr(rowdata, id_column_name, None)

                if id_column_value and not id_column_value.startswith("*"):
                    column_value = ROOT_PATH_BLOB_STORAGE.get_item_url_by_id(id_column_value)

            newrow[column_name] = column_value

    return newrow


def fetch_rows_common_apply_constraints(
    commons: CommonQueryParams,
    stmt,
    sort_col_1: Optional[Column[int]] = None,
    sort_col_2: Optional[Column[int]] = None,
    has_history: Optional[bool] = False,
    has_history_extended: Optional[bool] = False,
):
    limit = 0
    offset = 0
    have_custom_sort = False
    use_extended_range = False

    for column_filters_entry in commons.column_filters:
        stmt = stmt.where(
            column(column_filters_entry.id).like(column_filters_entry.value),  # Case sensitive
        )

    if not commons.report_mode:
        limit = commons.pagination.page_size
        offset = commons.pagination.page_index * limit

    use_extended_range = (
        has_history and has_history_extended and (commons.include_details or commons.report_mode)
    )

    if has_history and not commons.include_details and not commons.report_mode:
        # is_history == "0" for ledger header records
        # and is_history == "1" for ledger history records
        where_expr = column("is_history").ilike("0")

        if has_history_extended:
            where_expr = and_(
                where_expr,
                column("geotrack_is_history").ilike("0"),
                column("product_is_history").ilike("0"),
            )

        stmt = stmt.where(where_expr)

    if not commons.report_mode and commons.sorting and len(commons.sorting) > 0:
        have_custom_sort = True

        for sort_entry in commons.sorting:
            stmt = stmt.order_by(desc(sort_entry.id) if sort_entry.desc else asc(sort_entry.id))

    if not have_custom_sort and sort_col_1 is not None and sort_col_2 is not None:
        stmt = stmt.order_by(desc(sort_col_1)).order_by(desc(sort_col_2))

        if use_extended_range:
            stmt = (
                stmt.order_by(desc(FoodvibesTrackingProductsLedgerView.product_ledger_id))
                .order_by(desc(FoodvibesTrackingProductsLedgerView.product_tx_id))
                .order_by(desc(FoodvibesTrackingProductsLedgerView.geotrack_ledger_id))
                .order_by(desc(FoodvibesTrackingProductsLedgerView.geotrack_tx_id))
            )

    row_count = len(commons.db_session.scalars(stmt).all())

    if offset >= 0 and limit > 0:
        stmt = stmt.offset(offset).limit(limit)

    return stmt, row_count, limit, offset


def fetch_rows_common_apply_privacy(
    commons: CommonQueryParams,
    data_rows,
    row_count: int,
):
    blur_indices: List[int] = [1 for x in range(0, row_count)]  # blur all rows by default
    show_indices: List[int] = []

    for idx, rowdata in enumerate(data_rows):
        for user_col_name in ["username", "product_username", "geotrack_username"]:
            col_value = getattr(rowdata, user_col_name, None)

            if col_value == commons.impersonated_user:
                show_indices.append(idx)
                break

    for show_idx in show_indices:
        blur_indices[max(0, show_idx - 1)] = 0
        blur_indices[show_idx] = 0
        blur_indices[min(row_count - 1, show_idx + 1)] = 0

    for idx, rowdata in enumerate(data_rows):
        if blur_indices[idx] > 0:
            rowdata = data_rows[idx]

            for col in rowdata.__table__.columns:
                col_value = getattr(rowdata, col.name)

                if "VARCHAR" in str(col.type) and not f"{col.name}".endswith("is_history"):
                    setattr(rowdata, col.name, "*" * len(col_value))


def fetch_rows_common(
    commons: CommonQueryParams,
    stmt,
    sort_col_1: Optional[Column[int]] = None,
    sort_col_2: Optional[Column[int]] = None,
    has_history: Optional[bool] = False,
    has_history_extended: Optional[bool] = False,
) -> CommonQueryResponse:
    data: List[CommonQueryResponseRow] = []
    message = ""
    row_count = 0
    limit = 0
    offset = 0

    if commons.bypass_mode_on is False:
        stmt, row_count, limit, offset = fetch_rows_common_apply_constraints(
            commons, stmt, sort_col_1, sort_col_2, has_history, has_history_extended
        )

    # show_sql(stmt)

    data_rows = list(commons.db_session.scalars(stmt))

    if commons.bypass_mode_on is False:
        if commons.privacy_on:
            fetch_rows_common_apply_privacy(commons, data_rows, row_count)

        message = (
            f": fetched records {min(offset, row_count - 1) + 1} "
            f"to {min(offset + limit, row_count)} of {row_count}"
        )

    for rowdata in data_rows:
        data.append(make_data_row(rowdata))

    return CommonQueryResponse(
        CommonError(0, f"OK{message}", CommonError.ErrorLevel.SUCCESS),
        CommonQueryResponseMeta(row_count, 0, commons),
        data,
    )


def fetch_constants_rows_common(
    commons: CommonQueryParams,
    stmt,
) -> CommonQueryResponse:
    return fetch_rows_common(
        commons,
        stmt,
        FoodvibesConstants.constant_id,
        FoodvibesConstants.ledger_start_transaction_id,
        False,
        False,
    )


def fetch_constants_rows(
    commons: Annotated[Any, Depends(CommonQueryParams)] = None,
    ledger_id: Optional[int] = None,
    constant_name: Optional[str] = None,
    group_name: Optional[str] = None,
) -> CommonQueryResponse:
    stmt = commons.db_session.query(FoodvibesConstants)

    if ledger_id:
        stmt = stmt.where(FoodvibesConstants.constant_id == ledger_id)
    elif constant_name and group_name:
        stmt = stmt.where(
            and_(
                column("constant_name").ilike(constant_name),
                column("group_name").ilike(group_name),
            )
        )
    elif commons.global_filter:
        stmt = stmt.where(
            or_(
                column("constant_name").ilike(commons.global_filter),
                column("group_name").ilike(commons.global_filter),
            )
        )

    return fetch_constants_rows_common(commons, stmt)


def get_searchee_from_request(filter: str, token: str) -> int:
    search_pfx = f"%/{token}="
    search_sfx = "/%"

    if filter.startswith(search_pfx) and filter.endswith(search_sfx):
        return int(filter.replace(search_pfx, "").replace(search_sfx, ""))

    return 0


def get_ledger_id_from_request(filter: str) -> int:
    return get_searchee_from_request(filter, "ledger_id")


def get_ledger_id_alt_from_request(filter: str) -> int:
    return get_searchee_from_request(filter, "ledger_id_alt")


def is_id_value_present(value_to_check: int | str | None, value_tag: str) -> CommonQueryResponse:
    response: CommonQueryResponse = CommonQueryResponse()
    type_to_check = type(value_to_check)

    if (
        value_to_check is None
        or type_to_check is str
        and len(str(value_to_check)) == 0
        or type_to_check is int
        and int(value_to_check) < 1
    ):
        response.error.code = HTTPStatus.UNPROCESSABLE_ENTITY
        response.error.error_level = CommonError.ErrorLevel.ERROR
        response.error.message = f"Missing or invalid {value_tag}"

    return response
