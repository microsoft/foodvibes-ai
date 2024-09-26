"""database.py

Common objects and functions used by all modules

20240625 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

import hashlib
from datetime import datetime, timezone
import os


def calculate_hash(polygon_wkt: str) -> str:
    return hashlib.md5(polygon_wkt.encode()).hexdigest()


def convert_unix_timestamp_to_iso8601(input_timestamp: int) -> str:
    # Convert the Unix timestamp to a datetime object with UTC timezone
    dt_object = datetime.fromtimestamp(input_timestamp, tz=timezone.utc)

    # Convert the datetime object to an ISO 8601 string
    iso_string = dt_object.isoformat()

    return iso_string


def is_production() -> bool:
    return os.environ.get("ENVIRONMENT") == "production"
