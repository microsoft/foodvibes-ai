"""constants.py

Provides endpoint for CRUD operations on SBS Document_constants table

20240301 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

import os
from typing import Annotated, Any, List
from fastapi import Depends, Request
from fastapi.responses import StreamingResponse

import jsonlines

from api.common.blob_utils import run_bash_script
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


def get_db_path(session_id: int = 0) -> str:
    return f"data/sbs_session_id_{session_id}.db" if session_id != 0 else "data/sbs.db"


@config.app.get("/sbs_sessions_get/", response_model=None)
async def sbs_sessions_get(
    request: Request,
    commons: Annotated[Any, Depends(CommonQueryParams)],
):
    """Endpoint for sbs_sessions_get table query"""
    try:
        # service_url = (
        #     "https://farmvibesllm6285804596.blob.core.windows.net/"
        #     + "azureml-blobstore-96d2e54b-9c8f-4ea9-b777-c74825e52a83/farmvibes-llm-pipelines/"
        # )
        # container_name = "azureml-blobstore-96d2e54b-9c8f-4ea9-b777-c74825e52a83"
        # blob_prefix = "farmvibes-llm-pipelines/"

        # za = BlobStorage(service_url, container_name)
        # za.list_blobs(blob_prefix)

        # blob_service_client = SbsSqlite.create_blob_service_client(connection_string)
        # SbsSqlite.list_blobs_in_hierarchy(blob_service_client, container_name, blob_prefix)

        # --
        # async def generate_stream():
        #     print(f"Scan argument is {commons.global_filter}")

        #     if (commons.global_filter or "good").endswith(".jsonl"):
        #         return

        #     idx = 0

        #     for entry in run_bash_script(blob_name=commons.global_filter):
        #         idx += 1
        #         print(f"{idx} - {entry}")
        #         flds = f"{entry}\t".split("\t")
        #         yield "|".join([flds[0], flds[1].replace("None", "")])
        #         # await asyncio.sleep(1)

        # return StreamingResponse(generate_stream(), media_type="text/event-stream")

        paths: List[sbs_session] = []

        print(
            f"""Scan arguments are:
global_filter: {commons.global_filter}
id_to_fetch::: {commons.id_to_fetch}
id2_to_fetch:: {commons.id2_to_fetch}
pagination:::: {commons.pagination.page_index} {commons.pagination.page_size}
"""
        )

        if (commons.global_filter or "good").endswith(".jsonl"):
            pass
        else:
            print("Scanning all blobs for .jsonl files")
            idx = 0

            for entry in run_bash_script(blob_name=commons.global_filter):
                idx += 1
                flds = f"{entry}\t".split("\t")

                if flds[0].endswith("/") or flds[0].endswith(".jsonl"):
                    print(f"{idx} - {entry}")
                    paths.append(sbs_session(flds[0], flds[1]))

        return CommonQueryResponse(
            CommonError(0, "OK", CommonError.ErrorLevel.SUCCESS),
            CommonQueryResponseMeta(len(paths), 0, commons),
            paths,
        )
    except Exception as error:
        return make_response_payload(str(error))


@config.app.get("/sbs_session_load/", response_model=None)
async def sbs_fact_load(
    request: Request,
    commons: Annotated[Any, Depends(CommonQueryParams)],
):
    """Endpoint for sbs_session_load"""
    try:
        print(f"Scan argument is {commons.global_filter}")

        data_obj_sessions = SbsSqlite(get_db_path())

        data_obj_sessions.db_create_sessions_table()

        session_id = data_obj_sessions.db_upsert_sbs_session(commons.global_filter)

        session_data, total_count = data_obj_sessions.db_sbs_session_list(
            session_id_to_fetch=session_id
        )

        if len(session_data) == 0:
            return make_response_payload("No data found")

        session_id = session_data[0]["id"]
        fact_count = session_data[0]["fact_count"]
        path = session_data[0]["path"]

        if len(path) == 0:
            return make_response_payload("No path found")

        async def generate_stream(session_id: int, path: str, fact_count: int):
            if fact_count == 0 and (path or "good").endswith(".jsonl"):
                idx = 0
                path_local = ""
                data_obj_facts = SbsSqlite(get_db_path(session_id))
                data_obj_facts.db_create_fact_table()

                yield "Loading blob..."

                for line in run_bash_script(blob_name=path):
                    idx += 1
                    print(f"{idx} - {line}")
                    path_local = line

                with jsonlines.open(path_local) as reader:
                    for obj in reader:
                        if obj.get("draft_id") is None:
                            print(f"Skipped row {fact_count} due to missing draft_id")
                        else:
                            row: sbs_fact = sbs_fact(
                                session_id=session_id,
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
                                document_text_reference=obj.get(
                                    "document_text_reference"
                                ),
                                draft=obj.get("draft"),
                            )

                            fact_count += 1

                            data_obj_facts.db_populate_sbs_fact(row)
                            print(f"Inserted row {fact_count}")
                            yield f"Scanning fact {fact_count}...\n"

                data_obj_sessions.db_patch_sbs_session(
                    session_id, SbsSessionUpdateRequest(fact_count=fact_count)
                )
                os.remove(path_local)

            yield f"Session={session_id}\n"

        return StreamingResponse(
            generate_stream(session_id, path, fact_count),
            media_type="text/event-stream",
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

        if commons.id_to_fetch == 0:
            session_id = data_obj_sessions.db_upsert_sbs_session(commons.global_filter)
        else:
            session_id = commons.id_to_fetch

        session_data, total_count = data_obj_sessions.db_sbs_session_list(
            session_id_to_fetch=session_id
        )

        if len(session_data) == 0:
            return make_response_payload("No data found")

        session_id = session_data[0]["id"]
        # fact_count = session_data[0]["fact_count"]
        path = session_data[0]["path"]
        data_obj_facts = SbsSqlite(get_db_path(session_id))

        if len(path) == 0:
            return make_response_payload("No path found")

        data_obj_facts.db_create_fact_table()

        session_data, total_count = data_obj_facts.db_get_sbs_fact_list(
            session_id, commons.id2_to_fetch, commons.pagination
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
        data_obj_sessions = SbsSqlite(get_db_path())

        data_obj_sessions.db_create_sessions_table()

        if commons.id_to_fetch == 0:
            session_id = data_obj_sessions.db_upsert_sbs_session(commons.global_filter)
        else:
            session_id = commons.id_to_fetch

        data_obj_facts = SbsSqlite(get_db_path(session_id))
        data_obj_facts.db_patch_sbs_fact(session_id, commons.id2_to_fetch, item)

        return CommonQueryResponse(
            CommonError(0, "OK", CommonError.ErrorLevel.SUCCESS),
            CommonQueryResponseMeta(1, 0, commons),
            None,
        )

    except Exception as error:
        return make_response_payload(str(error))
