"""app.py

Main entry point for FoodVibes2024 webapi

20240301 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from fastapi import Request
import uvicorn
from fastapi.responses import RedirectResponse
from api.common.config import logger
from api.common.fv_logging import setup_logger
import api.adma
import api.constants
import api.farmvibes
import api.images
import api.sc_user
import api.sc_group
import api.sc_circle
import api.geotrack
import api.product
import api.tracking_products  # noqa: F401
from api.common.types import config
from api.common.access_check import access_check

setup_logger(logger)
logger.info("started")

app = config.app  # Make app globally available


@config.app.get("/", include_in_schema=False)
def hello():
    """Default endpoint -- redirects to Swagger page for API testing"""

    return RedirectResponse("/docs")


@config.app.get("/map_key")
@access_check(check_for_roles=True)
async def map_key(request: Request):
    """Map Key Endpoint -- Fetches Map Key from Azure Key Value"""

    return config.maps_api_key


if __name__ == "__main__":
    uvicorn.run(config.app, port=7478, host="0.0.0.0")
