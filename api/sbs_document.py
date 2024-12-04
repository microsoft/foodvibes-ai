"""constants.py

Provides endpoint for CRUD operations on SBS Document_constants table

20240301 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Annotated, Any
from fastapi import Depends, Request
import re
import jsonlines
# from api.common.config import logger

# from sqlalchemy import insert, update
from api.common.database.common_utils import (
    make_response_payload,
)
from api.common.database.database_sqlite import SbsSqlite
from api.common.types import (
    CommonError,
    CommonQueryParams,
    CommonQueryResponse,
    CommonQueryResponseMeta,
    SbsReviewRequest,
    config,
    sbs_fact,
    sbs_session,
)


def extract_guid(file_path: str) -> str:
    match = re.search(r'([a-f0-9\-]{36})', file_path)
    if match:
        return match.group(1)
    return None


def get_db_path(file_path: str) -> str:
    guid = extract_guid(file_path)

    if guid is None:
        raise ValueError("No GUID found in file path")

    return f"data/sbs_{guid}.db"


@config.app.get("/sbs_document/", response_model=None)
async def sbs_document_get(
    request: Request,
    commons: Annotated[Any, Depends(CommonQueryParams)],
):
    """Endpoint for sbs_document table query"""
    try:
        # "data/cfca7fd0-a03f-4305-b48d-fd2ace8bb332.jsonl"
        # {"page_index":0, "page_size": 2}
        data_obj = SbsSqlite(get_db_path(commons.global_filter))
        data_obj.db_create()

        inserted_id, is_new = data_obj.db_populate_sbs_session(
            sbs_session(path=commons.global_filter)
        )

        if is_new:
            with jsonlines.open(commons.global_filter) as reader:
                counter: int = 0

                for obj in reader:
                    row: sbs_fact = sbs_fact(
                        session_id=inserted_id,
                        main_clause=obj.get("main_clause"),
                        subclause_id=obj.get("subclause_id"),
                        subclause=obj.get("subclause"),
                        content=obj.get("content"),
                        score_completeness=obj.get("score_completeness"),
                        explanation_completeness=obj.get(
                            "explanation_completeness"
                        ),
                        draft_id=obj.get("draft_id"),
                        content_id=obj.get("content_id"),
                        document_text_reference=obj.get("document_text_reference"),
                        draft=obj.get("draft"),
                    )

                    data_obj.db_populate_sbs_fact(row)

                    print(f"Inserted row {counter}")

                    counter += 1

        data, total_count = data_obj.db_get_sbs_fact_list(
            inserted_id, commons.id_to_fetch, commons.pagination)
        row_count = len(data)

        print(f"Row count: {row_count}")
        print(f"Total count: {total_count}")
        print(f"page_index: {commons.pagination.page_index}")
        print(f"page_size: {commons.pagination.page_size}")

        return CommonQueryResponse(
            CommonError(0, "OK", CommonError.ErrorLevel.SUCCESS),
            CommonQueryResponseMeta(total_count, 0, commons),
            data,
        )

    except Exception as error:
        return make_response_payload(str(error))


@config.app.put("/sbs_fact/{fact_id}", response_model=None)
async def update_sbs_fact(
    fact_id: int,
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
    item: SbsReviewRequest,
):
    """Endpoint to update sbs_fact table"""
    try:
        data_obj = SbsSqlite(get_db_path(commons.global_filter))
        data_obj.db_update_sbs_fact(fact_id, item)

        return CommonQueryResponse(
            CommonError(0, "OK", CommonError.ErrorLevel.SUCCESS),
            CommonQueryResponseMeta(1, 0, commons),
            None,
        )

    except Exception as error:
        return make_response_payload(str(error))
