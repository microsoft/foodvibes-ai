"""types.py

Common objects and functions used by various endpoints

20240508 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

import json
import os
from enum import Enum
from typing import List, Union
from sqlalchemy.orm import Session

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
from api.common.utils import is_production

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

    include_details: bool
    report_mode: bool
    global_filter: str
    column_filters: List[CommonQueryParamsColFilter]
    sorting: List[CommonQueryParamsColSorting]
    pagination: CommonQueryParamsPagination
    impersonated_user: str | None  # Added for impersonation in non-production environments
    group_id: int | None
    db_session: Session  # Updated by check_access()
    active_access_mask: int = 0  # Updated by check_access()
    username_list: List[str] = []  # Updated by check_access()
    privacy_on: bool = False  # Updated by check_access()
    bypass_mode_on: bool = False  # Updated by check_access()

    def __init__(
        self,
        include_details: bool | None = None,
        report_mode: bool | None = None,
        global_filter: str | None = None,
        column_filters: str | None = None,
        sorting: str | None = None,
        pagination: str | None = None,
        impersonated_user: str | None = None,
        group_id: int | None = None,
    ):
        """_summary_

        Args:
            include_details (bool | None, optional): _description_. Defaults to None.
            report_mode (bool | None, optional): _description_. Defaults to None.
            global_filter (str | None, optional): _description_. Defaults to None.
            column_filters (str | None, optional): _description_. Defaults to None.
            sorting (str | None, optional): _description_. Defaults to None.
            pagination (str | None, optional): _description_. Defaults to None.
            impersonated_user (str | None, optional): _description_. Defaults to None.
            group_id (int | None, optional): _description_. Defaults to None.
        """
        self.include_details = include_details or False
        self.report_mode = report_mode or False
        self.global_filter = global_filter or ""

        if self.global_filter:
            self.global_filter = f"%{self.global_filter}%"

        self.column_filters = CommonQueryParamsColFilter.load_from_json(column_filters or "[]")
        self.sorting = CommonQueryParamsColSorting.load_from_json(sorting or "[]")
        self.pagination = CommonQueryParamsPagination.load_from_json(
            pagination or "{" + f'"page_index":0,"page_size":{FETCH_PAGE_SIZE}' + "}"
        )
        self.group_id = group_id
        self.impersonated_user = None if is_production() else impersonated_user


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


config = ConfigSingletonClass()
