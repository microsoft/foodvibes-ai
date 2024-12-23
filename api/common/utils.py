"""common_utils.py

Common objects and functions used by database operations

20240708 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from http import HTTPStatus
from fastapi.responses import HTMLResponse

from api.common.config import logger
from api.common.types import (
    CommonError,
    CommonQueryParams,
    CommonQueryResponse,
    CommonQueryResponseMeta,
)


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
        CommonError(
            error_level=CommonError.ErrorLevel.ERROR, code=1, msessage=str(content)
        ),
        CommonQueryResponseMeta(0, 0, CommonQueryParams()),
        [],
    )


def unjsonify(data, indent=0) -> str:
    result = ""
    for key, value in data.items():
        result += " " * indent + str(key) + ":\n"
        if isinstance(value, dict):
            result += unjsonify(value, indent + 4)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    result += unjsonify(item, indent + 4)
                else:
                    result += " " * (indent + 4) + str(item) + "\n"
        else:
            result += " " * (indent + 4) + str(value) + "\n"

    return result
