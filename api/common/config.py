"""config.py

Provides config class utilized by webapi endpoints and their associated services

20240305 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

import logging
import struct
import time

import pyodbc
from azure.identity import AzureCliCredential, ManagedIdentityCredential
from azure.keyvault.secrets import SecretClient
from azure.monitor.opentelemetry import configure_azure_monitor
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, event

from api.common.fv_logging import fastapi_lifespan
from api.config_variables import (
    DEFAULT_ADMA_AUTHORITY,
    DEFAULT_ADMA_BASE_URL,
    DEFAULT_ADMA_CLIENT_ID,
    DEFAULT_ADMA_CLIENT_SECRET_NAME,
    DEFAULT_ADMA_PARTY_ID,
    DEFAULT_ADMA_SCOPE,
    DEFAULT_APP_INSIGHTS_INSTRUMENTATION_SECRET_NAME,
    DEFAULT_BING_MAPS_API_KEY,
    DEFAULT_ENTRA_ID_CLIENT_ID,
    DEFAULT_FARMVIBES_URL_SECRET_NAME,
    DEFAULT_FOODVIBES_DB_CONN_STR,
    DEFAULT_IMAGES_BLOB_CONTAINER_NAME,
    DEFAULT_IMAGES_BLOB_SERVICE_URL,
    DEFAULT_KEY_VAULT_URL,
)

title = "FoodVibes API"
logger = logging.getLogger(title)
use_db_token = False

logger.setLevel(logging.WARNING)


class ConfigSingletonClass(object):
    """Singleton configuration helper class"""

    adma_default_party: str
    adma_base_url: str
    adma_client_id: str
    adma_client_secret: str
    adma_authority: str
    adma_scope: str
    connection_string: str
    maps_api_key: str
    images_blob_service_url: str
    images_blob_container_name: str
    entra_id_client_id: str
    app: FastAPI

    @classmethod
    def test_credential_retrieve(
        cls, credential: AzureCliCredential | ManagedIdentityCredential
    ):
        test_client = SecretClient(
            vault_url=DEFAULT_KEY_VAULT_URL, credential=credential
        )
        test_client.get_secret(DEFAULT_FOODVIBES_DB_CONN_STR)

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
                raise RuntimeError("Unable to get Azure CLI credential") from err

    @classmethod
    def fetch_secret(cls, client: SecretClient, secret_name: str) -> str:
        try:
            fetched_value = client.get_secret(secret_name).value

            if fetched_value is None:
                raise RuntimeError(f"Empty secret name {secret_name}")

            if fetched_value == "NONE" or fetched_value == " ":
                fetched_value = ""

            return f"{fetched_value}"
        except Exception as err:
            raise RuntimeError(f"Unable to fetch {secret_name} with error {err}")

    @classmethod
    def fetch_key_vault_secrets(cls) -> str | None:
        credential = cls.acquire_credential()
        client = SecretClient(vault_url=DEFAULT_KEY_VAULT_URL, credential=credential)

        cls.connection_string = cls.fetch_secret(
            client=client, secret_name=DEFAULT_FOODVIBES_DB_CONN_STR
        )
        cls.maps_api_key = cls.fetch_secret(
            client=client, secret_name=DEFAULT_BING_MAPS_API_KEY
        )
        cls.adma_base_url = cls.fetch_secret(
            client=client, secret_name=DEFAULT_ADMA_BASE_URL
        )
        cls.adma_client_id = cls.fetch_secret(
            client=client, secret_name=DEFAULT_ADMA_CLIENT_ID
        )
        try:
            cls.adma_client_secret = cls.fetch_secret(
                client=client, secret_name=DEFAULT_ADMA_CLIENT_SECRET_NAME
            )
        except Exception:
            logger.warning("Unable to fetch ADMA client secret. Using empty string")
            cls.adma_client_secret = ""

        cls.adma_authority = cls.fetch_secret(
            client=client, secret_name=DEFAULT_ADMA_AUTHORITY
        )
        cls.adma_scope = DEFAULT_ADMA_SCOPE
        cls.adma_default_party = cls.fetch_secret(
            client=client, secret_name=DEFAULT_ADMA_PARTY_ID
        )

        cls.farmvibes_url = cls.fetch_secret(
            client=client, secret_name=DEFAULT_FARMVIBES_URL_SECRET_NAME
        )

        cls.app_insights_instrumentation_key = cls.fetch_secret(
            client=client, secret_name=DEFAULT_APP_INSIGHTS_INSTRUMENTATION_SECRET_NAME
        )

        cls.images_blob_service_url = cls.fetch_secret(
            client=client, secret_name=DEFAULT_IMAGES_BLOB_SERVICE_URL
        )
        cls.images_blob_container_name = cls.fetch_secret(
            client=client, secret_name=DEFAULT_IMAGES_BLOB_CONTAINER_NAME
        )
        cls.entra_id_client_id = cls.fetch_secret(
            client=client, secret_name=DEFAULT_ENTRA_ID_CLIENT_ID
        )

    @classmethod
    def get_user_token(cls) -> bytes:
        credential = cls.acquire_credential()
        try:
            token = credential.get_token("https://database.windows.net/.default").token
            token_bytes = token.encode("UTF-16-LE")
            return struct.pack(f"<I{len(token_bytes)}s", len(token_bytes), token_bytes)
        except Exception as err:
            raise RuntimeError("Unable to get the database user token") from err

    @classmethod
    def reconnecting_engine(cls, engine, num_retries, retry_interval):
        def _run_with_retries(fn, context, cursor_obj, statement, *arg, **kw):
            for retry in range(num_retries + 1):
                try:
                    fn(cursor_obj, statement, context=context, *arg)
                except engine.dialect.dbapi.Error as raw_dbapi_err:
                    connection = context.root_connection
                    if engine.dialect.is_disconnect(
                        raw_dbapi_err, connection, cursor_obj
                    ):
                        if retry > num_retries:
                            raise
                        engine.logger.error(
                            "disconnection error, retrying operation",
                            exc_info=True,
                        )
                        connection.invalidate()

                        # use SQLAlchemy 2.0 API if available
                        if hasattr(connection, "rollback"):
                            connection.rollback()
                        else:
                            trans = connection.get_transaction()
                            if trans:
                                trans.rollback()

                        time.sleep(retry_interval)
                        context.cursor = cursor_obj = connection.connection.cursor()
                    else:
                        engine.logger.error(str(raw_dbapi_err))
                        raise
                else:
                    return True

        e = engine.execution_options(isolation_level="AUTOCOMMIT")

        @event.listens_for(e, "do_execute_no_params")
        def do_execute_no_params(cursor_obj, statement, context):
            return _run_with_retries(
                context.dialect.do_execute_no_params, context, cursor_obj, statement
            )

        @event.listens_for(e, "do_execute")
        def do_execute(cursor_obj, statement, parameters, context):
            return _run_with_retries(
                context.dialect.do_execute, context, cursor_obj, statement, parameters
            )

        return e

    def __init__(self):
        origins = ["*"]
        try:
            self.fetch_key_vault_secrets()
        except Exception as err:
            raise RuntimeError(
                f"Unable to fetch key vault secrets using {DEFAULT_KEY_VAULT_URL}"
            ) from err

        if len(self.app_insights_instrumentation_key):
            configure_azure_monitor(
                connection_string=self.app_insights_instrumentation_key
            )
        self.app = FastAPI(
            swagger_ui_parameters={"syntaxHighlight": False},  # type: ignore
            title="FoodVibes API",
            summary="FoodVibes API to perform CRUD operations",
            description="This API performs CRUD operations on FoodVibes database",
            version="0.0.1",
            license_info={
                "name": "Apache 2.0",
                "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
            },
            lifespan=fastapi_lifespan,
        )
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        def connect():
            if use_db_token:
                # This connection option is defined by microsoft in msodbcsql.h
                SQL_COPT_SS_ACCESS_TOKEN = 1256
                return pyodbc.connect(
                    self.connection_string,
                    attrs_before={SQL_COPT_SS_ACCESS_TOKEN: self.get_user_token()},
                )
            else:
                return pyodbc.connect(
                    self.connection_string,
                )

        self.db_engine = self.reconnecting_engine(
            create_engine(
                "mssql+pyodbc://",
                creator=connect,
                pool_size=20,
                max_overflow=0,
                echo_pool=True,
            ),
            num_retries=5,
            retry_interval=2,
        )

    def __new__(cls):
        if not hasattr(cls, "instance"):
            cls.instance = super(ConfigSingletonClass, cls).__new__(cls)

        return cls.instance
