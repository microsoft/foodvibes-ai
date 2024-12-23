"""config.py

Provides config class utilized by webapi endpoints and their associated services

20240305 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

import logging

from azure.identity import AzureCliCredential, ManagedIdentityCredential
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.common.fv_logging import fastapi_lifespan

title = "SBS Documents API"
logger = logging.getLogger(title)
use_db_token = False

logger.setLevel(logging.WARNING)


class ConfigSingletonClass(object):
    """Singleton configuration helper class"""

    app: FastAPI

    # @classmethod
    # def test_credential_retrieve(
    #     cls, credential: AzureCliCredential | ManagedIdentityCredential
    # ):
    #     test_client = SecretClient(
    #         vault_url=DEFAULT_KEY_VAULT_URL, credential=credential
    #     )
    #     test_client.get_secret(DEFAULT_FOODVIBES_DB_CONN_STR)

    @classmethod
    def acquire_credential(cls) -> AzureCliCredential | ManagedIdentityCredential:
        # Try to get a token from the Azure CLI if it is available
        try:
            credential = ManagedIdentityCredential()
            cls.test_credential_retrieve(credential)
            return credential
        except Exception:
            try:
                logger.info(
                    "Unable to get Managed Identity credential. Trying azure CLI"
                )
                credential = AzureCliCredential()
                cls.test_credential_retrieve(credential)
                logger.info("Acquired Azure CLI credential")
                return credential
            except Exception as err:
                logger.error("Unable to get Azure CLI credential with error %s", err)
                # raise RuntimeError("Unable to get Azure CLI credential") from err
                return credential

    def __init__(self):
        self.app = FastAPI(
            swagger_ui_parameters={"syntaxHighlight": False},  # type: ignore
            title="SBS Document API",
            summary="SBS Document to perform CRUD operations",
            description="This API performs CRUD operations on SBS Document database",
            version="0.0.1",
            license_info={
                "name": "Apache 2.0",
                "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
            },
            lifespan=fastapi_lifespan,
        )
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    def __new__(cls):
        if not hasattr(cls, "instance"):
            cls.instance = super(ConfigSingletonClass, cls).__new__(cls)

        return cls.instance
