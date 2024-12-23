"""types.py

Common objects and functions used by various endpoints

20240508 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

import json
import os
from enum import Enum
from pydantic import BaseModel
from datetime import datetime
import getpass

from api.common.config import ConfigSingletonClass

FETCH_PAGE_SIZE = os.environ.get("FETCH_PAGE_SIZE", 10)


class JsonEnabled(object):
    def __init__(self, data_dict):
        self.__dict__.update(data_dict)

    @classmethod
    def load_from_json(cls, json_string):
        return json.loads(json_string, object_hook=cls)


class CommonQueryParamsPagination(JsonEnabled):
    page_index: int
    page_size: int


class CommonQueryParams:
    """Common query parameters helper class"""

    id_to_fetch: int
    id2_to_fetch: int
    include_details: bool
    global_filter: str
    pagination: CommonQueryParamsPagination

    def __init__(
        self,
        id_to_fetch: int = 0,
        id2_to_fetch: int = 0,
        include_details: bool | None = None,
        global_filter: str | None = None,
        pagination: str | None = None,
    ):
        """_summary_

        Args:
            id_to_fetch (int, optional): _description_. Defaults to 0.
            id2_to_fetch (int, optional): _description_. Defaults to 0.
            include_details (bool | None, optional): _description_. Defaults to None.
            global_filter (str | None, optional): _description_. Defaults to None.
            pagination (str | None, optional): _description_. Defaults to None.
        """
        self.id_to_fetch = id_to_fetch or 0
        self.id2_to_fetch = id2_to_fetch or 0
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


class sbs_session:
    def __init__(
        self,
        path: str = "",
        modified: str = "",
    ):
        self.path = path
        self.modified = modified.replace("None", "")

    def to_dict(self):
        return {
            "path": self.path,
            "modified": self.modified,
        }

    def __repr__(self) -> str:
        return f"sbs_session(path={self.path}, modified={self.modified})"


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
            "draft": self.draft,
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


class SbsBaseRequest(BaseModel):
    reviewer: str = getpass.getuser() or "system"
    review_date: str = datetime.now().isoformat()

    def __init__(self, reviewer: str = "", review_date: str = ""):
        super().__init__(reviewer=reviewer, review_date=review_date)


class SbsSessionUpdateRequest(SbsBaseRequest):
    fact_count: int = 0

    def __init__(self, reviewer: str = "", review_date: str = "", fact_count: int = 0):
        super().__init__(reviewer, review_date)
        self.fact_count = fact_count


class SbsFactReviewRequest(SbsBaseRequest):
    property_name: str = ""
    is_numeric: bool = False
    property_value: str = ""
    property_value_numeric: int = 0

    def __init__(
        self,
        property_name: str = "",
        is_numeric: bool = False,
        property_value: str = "",
        property_value_numeric: int = 0,
        reviewer: str = "",
        review_date: str = "",
    ):
        super().__init__(reviewer, review_date)

        self.property_name = property_name
        self.is_numeric = is_numeric
        self.property_value = property_value
        self.property_value_numeric = property_value_numeric


config = ConfigSingletonClass()
