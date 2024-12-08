"""app.py

Main entry point for SSB Document2024 webapi

20240301 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

import uvicorn
from fastapi.responses import RedirectResponse
from api.common.config import logger
from api.common.fv_logging import setup_logger
import api.sbs_all  # noqa: F401
from api.common.types import config


setup_logger(logger)
logger.info("started")

app = config.app  # Make app globally available


@config.app.get("/", include_in_schema=False)
def hello():
    """Default endpoint -- redirects to Swagger page for API testing"""

    return RedirectResponse("/docs")


if __name__ == "__main__":
    uvicorn.run(config.app, port=7478, host="0.0.0.0")
