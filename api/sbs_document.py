"""constants.py

Provides endpoint for CRUD operations on SBS Document_constants table

20240301 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Annotated, Any
from fastapi import Depends, Request
import jsonlines
# from api.common.config import logger

# from sqlalchemy import insert, update
from api.common.database.common_utils import (
    make_response_payload,
)
from api.common.database.database_sqlite import SbsSqlite
from api.common.models import (
    # FoodvibesConstants,
    FoodvibesConstantsRequest,
)
from api.common.types import (
    CommonError,
    CommonQueryParams,
    CommonQueryResponse,
    CommonQueryResponseMeta,
    config,
    sbs_fact,
    sbs_session,
)


# async def data_generator(data, chunk_size=500):
#     for i in range(0, len(data), chunk_size):
#         chunk = data[i : i + chunk_size]

#         logger.info(f"Processing rows {i + 1} to {i + len(chunk)}")
#         yield data[i : 1 + chunk_size]
#         await asyncio.sleep(0.01)  # Simulate a delay


@config.app.get("/sbs_document/", response_model=None)
async def sbs_document_get(
    request: Request,
    commons: Annotated[Any, Depends(CommonQueryParams)],
):
    """Endpoint for sbs_document table query"""
    try:
        if commons.global_filter:
            data_obj = SbsSqlite("data/sbs.db")
            data_obj.db_create()

            inserted_id, is_new = data_obj.db_populate_sbs_session(
                sbs_session(path=commons.global_filter)
            )

            if is_new:
                # "data/cfca7fd0-a03f-4305-b48d-fd2ace8bb332.jsonl"
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

            data = data_obj.db_get_sbs_fact_list(inserted_id)
            row_count = len(data)

        return CommonQueryResponse(
            CommonError(0, "OK", CommonError.ErrorLevel.SUCCESS),
            CommonQueryResponseMeta(row_count, 0, commons),
            data,
        )

    except Exception as error:
        return make_response_payload(str(error))


@config.app.put("/sbs_document/", response_model=None)
async def sbs_document_put(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
    item: FoodvibesConstantsRequest,
):
    """Endpoint for constants table upsert"""
    try:
        response: CommonQueryResponse = CommonQueryResponse()

        # if commons.db_session:
        #     result = None
        #     row_new = {
        #         "constant_name": item.constant_name,
        #         "constant_value": item.constant_value,
        #         "group_name": item.group_name,
        #     }
        #     ledger_id = item.constant_id

        #     if ledger_id > 0:
        #         response = fetch_constants_rows(commons.db_session, ledger_id=ledger_id)

        #     if len(response.data) == 0 and item.constant_name and item.group_name:
        #         response = fetch_constants_rows(
        #             commons.db_session,
        #             constant_name=item.constant_name,
        #             group_name=item.group_name,
        #         )

        #     if len(response.data) == 0:  # insert
        #         stmt = insert(FoodvibesConstants).values(row_new)
        #         result = commons.db_session.execute(stmt)
        #         ledger_id = (
        #             0 if result.inserted_primary_key is None else result.inserted_primary_key[0]
        #         )
        #         operation = f"added new Constant with [ID={ledger_id}]"
        #     else:  # update
        #         ledger_id = response.data[0]["constant_id"]
        #         operation = f"updated Constant [ID={ledger_id}]"
        #         stmt = (
        #             update(FoodvibesConstants)
        #             .values(row_new)
        #             .where(FoodvibesConstants.constant_id == ledger_id)
        #         )
        #         result = commons.db_session.execute(stmt)

        #     response = fetch_constants_rows(commons)
        #     response.error.append_message(operation)

        #     commons.db_session.commit()

        return response
    except Exception as error:
        return make_response_payload(str(error))
