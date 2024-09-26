import os

# Load .env file
from dotenv import load_dotenv

load_dotenv()

DEFAULT_KEY_VAULT_NAME = os.environ.get(
    "KEY_VAULT_NAME", "--NONE--"
)  # Leave the default as an invalid value to ensure user-provided value is used
DEFAULT_KEY_VAULT_URL = f"https://{DEFAULT_KEY_VAULT_NAME}.vault.azure.net"
DEFAULT_FOODVIBES_DB_CONN_STR = "foodvibes-connection-string"
DEFAULT_BING_MAPS_API_KEY = "bingmaps-api-key"
DEFAULT_IMAGES_BLOB_SERVICE_URL = "images-blob-service-url"
DEFAULT_IMAGES_BLOB_CONTAINER_NAME = "images-blob-container-name"
DEFAULT_APP_INSIGHTS_INSTRUMENTATION_SECRET_NAME = "foodvibes-app-insights-instrumentation-key"
DEFAULT_ENTRA_ID_CLIENT_ID = "entra-id-client-id"
DEFAULT_FARMVIBES_URL_SECRET_NAME = "farmvibes-url"

# ADMA authentication has 2 methods:
#   1. Entra ID Authentication
#   2. APP registration
#
# Common to both auth methods
#   adma-base-url      - Value from key vault
#   adma-party-id      - Value from key vault. This is the ID of client in ADMA.
#   adma-scope         - Value is hardcoded as it's always the same
#
# If NOT using Entra ID Authentication and using APP registration
#   adma-authority     - Value from key vault
#   adma-client-id     - Value from key vault
#   adma-client-secret - Value from key vault

DEFAULT_ADMA_BASE_URL = "adma-base-url"
DEFAULT_ADMA_PARTY_ID = "adma-party-id"
DEFAULT_ADMA_SCOPE = "https://farmbeats.azure.net/.default"

DEFAULT_ADMA_AUTHORITY = "adma-authority"
DEFAULT_ADMA_CLIENT_ID = "adma-client-id"
DEFAULT_ADMA_CLIENT_SECRET_NAME = "adma-client-secret"
