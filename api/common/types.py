"""types.py

Common objects and functions used by various endpoints

20240508 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

import json
import os
from enum import Enum
from typing import Union
from pydantic import BaseModel

from api.common.config import ConfigSingletonClass
from api.common.models import (
    FoodvibesConstants,
    FoodvibesGeotrackLedgerView,
    FoodvibesProductLedgerView,
    FoodvibesScGroupLedgerView,
    FoodvibesScCircleLedgerView,
    FoodvibesScUserLedgerView,
    FoodvibesTrackingProductsLedgerView,
)

ROLE_PRODUCT_OWNER = 0b00001
ROLE_GEOTRACK_OWNER = 0b00010
ROLE_SUPPLY_CHAIN_OWNER = 0b0100
ROLE_SUPPLY_CHAIN_VIEWER = 0b01000
ROLE_GLOBAL_OWNER = 0b10000
FETCH_PAGE_SIZE_DEFAULT = 10
FETCH_PAGE_SIZE = os.environ.get("FETCH_PAGE_SIZE", f"{FETCH_PAGE_SIZE_DEFAULT}")


CommonQueryResponseRow = Union[
    dict,
    FoodvibesConstants,
    FoodvibesGeotrackLedgerView,
    FoodvibesProductLedgerView,
    FoodvibesTrackingProductsLedgerView,
    FoodvibesScGroupLedgerView,
    FoodvibesScCircleLedgerView,
    FoodvibesScUserLedgerView,
]


class JsonEnabled(object):
    def __init__(self, data_dict):
        self.__dict__.update(data_dict)

    @classmethod
    def load_from_json(cls, json_string):
        return json.loads(json_string, object_hook=cls)


class CommonQueryParamsColFilter(JsonEnabled):
    id: str
    value: str


class CommonQueryParamsColSorting(JsonEnabled):
    id: str
    desc: bool


class CommonQueryParamsPagination(JsonEnabled):
    page_index: int
    page_size: int


class CommonQueryParamsRole:
    sc_user_ledger_id: int
    sc_group_ledger_id: int
    sc_circle_ledger_id: int
    sc_user_id: str
    active_access_mask: int

    def __init__(
        self,
        sc_user_ledger_id: int,
        sc_group_ledger_id: int,
        sc_circle_ledger_id: int,
        sc_user_id: str,
        active_access_mask: int,
    ):
        """_summary_

        Args:
            sc_user_ledger_id (int): _description_
            sc_group_ledger_id (int): _description_
            sc_circle_ledger_id (int): _description_
            sc_user_id (str): _description_
            active_access_mask (int): _description_
        """
        self.sc_user_ledger_id = sc_user_ledger_id
        self.sc_group_ledger_id = sc_group_ledger_id
        self.sc_circle_ledger_id = sc_circle_ledger_id
        self.sc_user_id = sc_user_id
        self.active_access_mask = active_access_mask


class CommonQueryParams:
    """Common query parameters helper class"""

    id_to_fetch: int
    include_details: bool
    global_filter: str
    pagination: CommonQueryParamsPagination

    def __init__(
        self,
        id_to_fetch: int = 0,
        include_details: bool | None = None,
        global_filter: str | None = None,
        pagination: str | None = None,
    ):
        """_summary_

        Args:
            id_to_fetch (int, optional): _description_. Defaults to 0.
            include_details (bool | None, optional): _description_. Defaults to None.
            global_filter (str | None, optional): _description_. Defaults to None.
            pagination (str | None, optional): _description_. Defaults to None.
        """
        self.id_to_fetch = id_to_fetch or 0
        self.include_details = include_details or False
        self.global_filter = global_filter or ""

        if self.global_filter:
            self.global_filter = self.global_filter

        self.pagination = CommonQueryParamsPagination.load_from_json(
            pagination or "{" + f'"page_index":0,"page_size":{FETCH_PAGE_SIZE}' + "}"
        )


class CommonQueryResponseMeta:
    def __init__(self, row_count: int, last_id: int, query_params) -> None:
        self.row_count = row_count
        self.last_id = last_id
        self.query_params = query_params


class CommonError:
    class ErrorLevel(Enum):
        SUCCESS = 0
        INFORMATION = 1
        WARNING = 2
        ERROR = 3
        FATAL = 4

    def __init__(self, code: int, msessage: str, error_level: ErrorLevel) -> None:
        self.code = code
        self.error_level = error_level
        self.set_message(msessage)

    def set_message(self, message: str):
        self.message = message

    def append_message(self, message: str):
        message_fields = [self.message]
        message_fields.append(message)
        self.message = ": ".join(message_fields)


class CommonQueryResponse:
    def __init__(
        self,
        error=None,
        meta=None,
        data=None,
    ) -> None:
        self.error = error or CommonError(0, "", CommonError.ErrorLevel.SUCCESS)
        self.meta = meta or CommonQueryResponseMeta(0, 0, CommonQueryParams())
        self.data = data or []


class DatabaseOperation(Enum):
    CREATE = 0
    UPDATE = 1


class MetadataType(Enum):
    FARMVIBES_IMAGE = 0
    FARMVIBES_PIXELS = 1
    PRODUCT_IMAGE = 2
    GEOTRACK_IMAGE = 3


class sbs_session:
    def __init__(
        self,
        path: str,
    ):
        self.path = path

    def to_dict(self):
        return {
            "path": self.path
        }

    def __repr__(self) -> str:
        return (
            f"sbs_session(path={self.path})"
        )


class sbs_fact:
    def __init__(
        self,
        session_id: int,
        main_clause: str,
        subclause_id: str,
        subclause: str,
        content: str,
        score_completeness: int,
        explanation_completeness: str,
        draft_id: str,
        content_id: str,
        document_text_reference: str,
        draft: str,
    ):
        self.session_id = session_id
        self.main_clause = main_clause
        self.subclause_id = subclause_id
        self.subclause = subclause
        self.content = content
        self.score_completeness = score_completeness
        self.explanation_completeness = explanation_completeness
        self.draft_id = draft_id
        self.content_id = content_id
        self.document_text_reference = document_text_reference
        self.draft = draft

    def to_dict(self):
        return {
            "session_id": self.session_id,
            "main_clause": self.main_clause,
            "subclause_id": self.subclause_id,
            "subclause": self.subclause,
            "content": self.content,
            "score_completeness": self.score_completeness,
            "explanation_completeness": self.explanation_completeness,
            "draft_id": self.draft_id,
            "content_id": self.content_id,
            "document_text_reference": self.document_text_reference,
            "draft": self.draft
        }

    def __repr__(self) -> str:
        return (
            f"sbs_fact(session_id={self.session_id}, main_clause={self.main_clause}, "
            f"subclause_id={self.subclause_id}, subclause={self.subclause}, "
            f"content={self.content}, score_completeness={self.score_completeness}, "
            f"explanation_completeness={self.explanation_completeness}, draft_id={self.draft_id}, "
            f"content_id={self.content_id}, "
            f"document_text_reference={self.document_text_reference}, draft={self.draft})"
        )


class SbsReviewRequest(BaseModel):
    score: int
    reviewer: str
    review_date: str


config = ConfigSingletonClass()
