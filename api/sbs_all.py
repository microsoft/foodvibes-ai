"""constants.py

Provides endpoint for CRUD operations on SBS Document_constants table

20240301 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Annotated, Any, List
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
    SbsFactReviewRequest,
    SbsSessionUpdateRequest,
    config,
    sbs_fact,
    sbs_session,
)


def extract_guid(file_path: str) -> str:
    match = re.search(r"([a-f0-9\-]{36})", file_path)
    if match:
        return match.group(1)
    return None


def get_db_path(session_id: int = 0) -> str:
    return f"data/sbs_session_id_{session_id}.db" if session_id != 0 else "data/sbs.db"


@config.app.get("/sbs_sessions_scan/", response_model=None)
async def sbs_sessions_scan(
    request: Request,
    commons: Annotated[Any, Depends(CommonQueryParams)],
):
    """Endpoint for sbs_sessions_scan table query"""
    try:
        data_obj_sessions = SbsSqlite(get_db_path())
        data_obj_sessions.db_create_sessions_table()
        paths: List[sbs_session] = []

        print("Scanning all blobs for .jsonl files")

        for path in [
            "data/cfca7fd0-a03f-4305-b48d-fd2ace8bb332.jsonl",
            "data/za.jsonl",
        ]:
            paths.append(sbs_session(path))

        total_count = data_obj_sessions.db_upsert_sbs_sessions(paths)

        return CommonQueryResponse(
            CommonError(0, "OK", CommonError.ErrorLevel.SUCCESS),
            CommonQueryResponseMeta(total_count, 0, commons),
            [],
        )

    except Exception as error:
        return make_response_payload(str(error))


@config.app.get("/sbs_sessions_get/", response_model=None)
async def sbs_sessions_get(
    request: Request,
    commons: Annotated[Any, Depends(CommonQueryParams)],
):
    """Endpoint for sbs_sessions table query"""
    try:
        data_obj_sessions = SbsSqlite(get_db_path())
        data_obj_sessions.db_create_sessions_table()
        data, total_count = data_obj_sessions.db_sbs_session_list(
            pagination=commons.pagination
        )

        return CommonQueryResponse(
            CommonError(0, "OK", CommonError.ErrorLevel.SUCCESS),
            CommonQueryResponseMeta(total_count, 0, commons),
            data,
        )

    except Exception as error:
        return make_response_payload(str(error))


@config.app.get("/sbs_fact/", response_model=None)
async def sbs_fact_get(
    request: Request,
    commons: Annotated[Any, Depends(CommonQueryParams)],
):
    """Endpoint for sbs_fact table query"""
    try:
        # "data/cfca7fd0-a03f-4305-b48d-fd2ace8bb332.jsonl"
        # {"page_index":0, "page_size": 2}
        data_obj_sessions = SbsSqlite(get_db_path())

        data_obj_sessions.db_create_sessions_table()

        session_data, total_count = data_obj_sessions.db_sbs_session_list(
            session_id_to_fetch=commons.id_to_fetch
        )

        if len(session_data) == 0:
            return make_response_payload("No data found")

        session_id = session_data[0]["id"]
        fact_count = session_data[0]["fact_count"]
        path = session_data[0]["path"]
        data_obj_facts = SbsSqlite(get_db_path(session_id))

        if len(path) == 0:
            return make_response_payload("No path found")

        data_obj_facts.db_create_fact_table()

        if fact_count == 0:
            with jsonlines.open(path) as reader:
                for obj in reader:
                    row: sbs_fact = sbs_fact(
                        session_id=commons.id_to_fetch,
                        main_clause=obj.get("main_clause"),
                        subclause_id=obj.get("subclause_id"),
                        subclause=obj.get("subclause"),
                        content=obj.get("content"),
                        score_completeness=obj.get("score_completeness"),
                        explanation_completeness=obj.get("explanation_completeness"),
                        draft_id=obj.get("draft_id"),
                        content_id=obj.get("content_id"),
                        document_text_reference=obj.get("document_text_reference"),
                        draft=obj.get("draft"),
                    )

                    data_obj_facts.db_populate_sbs_fact(row)

                    print(f"Inserted row {fact_count}")

                    fact_count += 1

                data_obj_sessions.db_patch_sbs_session(
                    commons.id_to_fetch, SbsSessionUpdateRequest(fact_count=fact_count)
                )

        session_data, total_count = data_obj_facts.db_get_sbs_fact_list(
            commons.id_to_fetch, commons.id2_to_fetch, commons.pagination
        )
        row_count = len(session_data)

        print(f"Row count: {row_count}")
        print(f"Total count: {total_count}")
        print(f"page_index: {commons.pagination.page_index}")
        print(f"page_size: {commons.pagination.page_size}")

        return CommonQueryResponse(
            CommonError(0, "OK", CommonError.ErrorLevel.SUCCESS),
            CommonQueryResponseMeta(total_count, 0, commons),
            session_data,
        )

    except Exception as error:
        return make_response_payload(str(error))


@config.app.patch("/sbs_fact/", response_model=None)
async def sbs_fact_patch(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
    item: SbsFactReviewRequest,
):
    """Endpoint to patch sbs_fact table"""
    try:
        data_obj_facts = SbsSqlite(get_db_path(commons.id_to_fetch))
        data_obj_facts.db_patch_sbs_fact(commons.id_to_fetch, commons.id2_to_fetch, item)

        return CommonQueryResponse(
            CommonError(0, "OK", CommonError.ErrorLevel.SUCCESS),
            CommonQueryResponseMeta(1, 0, commons),
            None,
        )

    except Exception as error:
        return make_response_payload(str(error))
