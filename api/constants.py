"""constants.py

Provides endpoint for CRUD operations on foodvibes_constants table

20240301 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from typing import Annotated, Any
from fastapi import Depends, Request
from sqlalchemy import insert, update
from api.common.database.common_utils import (
    fetch_constants_rows,
    make_response_payload,
)
from api.common.models import (
    FoodvibesConstants,
    FoodvibesConstantsRequest,
)
from api.common.access_check import access_check
from api.common.types import (
    CommonQueryParams,
    CommonQueryResponse,
    config,
)


@config.app.get("/constants/", response_model=None)
@access_check(check_for_roles=True)
async def constants_get(
    request: Request,
    commons: Annotated[Any, Depends(CommonQueryParams)],
):
    """Endpoint for constants table query"""
    try:
        response: CommonQueryResponse = CommonQueryResponse()

        if commons.db_session:
            response = fetch_constants_rows(commons)

        return response
    except Exception as error:
        return make_response_payload(str(error))


@config.app.put("/constants/", response_model=None)
@access_check(check_for_roles=True)
async def constants_put(
    request: Request,
    commons: Annotated[CommonQueryParams, Depends(CommonQueryParams)],
    item: FoodvibesConstantsRequest,
):
    """Endpoint for constants table upsert"""
    try:
        response: CommonQueryResponse = CommonQueryResponse()

        if commons.db_session:
            result = None
            row_new = {
                "constant_name": item.constant_name,
                "constant_value": item.constant_value,
                "group_name": item.group_name,
            }
            ledger_id = item.constant_id

            if ledger_id > 0:
                response = fetch_constants_rows(commons.db_session, ledger_id=ledger_id)

            if len(response.data) == 0 and item.constant_name and item.group_name:
                response = fetch_constants_rows(
                    commons.db_session,
                    constant_name=item.constant_name,
                    group_name=item.group_name,
                )

            if len(response.data) == 0:  # insert
                stmt = insert(FoodvibesConstants).values(row_new)
                result = commons.db_session.execute(stmt)
                ledger_id = (
                    0 if result.inserted_primary_key is None else result.inserted_primary_key[0]
                )
                operation = f"added new Constant with [ID={ledger_id}]"
            else:  # update
                ledger_id = response.data[0]["constant_id"]
                operation = f"updated Constant [ID={ledger_id}]"
                stmt = (
                    update(FoodvibesConstants)
                    .values(row_new)
                    .where(FoodvibesConstants.constant_id == ledger_id)
                )
                result = commons.db_session.execute(stmt)

            response = fetch_constants_rows(commons)
            response.error.append_message(operation)

            commons.db_session.commit()

        return response
    except Exception as error:
        return make_response_payload(str(error))
