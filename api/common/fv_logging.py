"""logging.py

Provides logging class utilized by webapi endpoints and their associated services

20240305 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI


def setup_logger_level(logger, log_level: int = logging.INFO):
    logger.setLevel(log_level)


def setup_logger(logger, allow_emit: bool = True, log_level: int = logging.INFO):
    setup_logger_level(logger, log_level)

    stream_handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s (%(filename)s:%(lineno)s)"
    )
    reset_color = "\x1b[0m"
    stream_handler.setFormatter(formatter)

    def decorate_emit(fn):
        def new(record: logging.LogRecord):
            levelno = record.levelno

            if levelno >= logging.CRITICAL:
                color = "\x1b[31;1m"
            elif levelno >= logging.ERROR:
                color = "\x1b[31;1m"
            elif levelno >= logging.WARNING:
                color = "\x1b[33;1m"
            elif levelno >= logging.INFO:
                color = "\x1b[32;1m"
            elif levelno >= logging.DEBUG:
                color = "\x1b[35;1m"
            else:
                color = reset_color

            record.levelname = f"{color}{record.levelname}{reset_color}"
            record.msg = f"{color}{record.msg}{reset_color}"

            args = record.args or []
            record.args = tuple(f"\x1b[1m{arg}{reset_color}" for arg in args)

            return fn(record)

        return new

    if allow_emit:
        stream_handler.emit = decorate_emit(stream_handler.emit)

    logger.addHandler(stream_handler)


@asynccontextmanager
async def fastapi_lifespan(app: FastAPI):
    # Startup
    setup_logger(logging.getLogger("uvicorn.access"), allow_emit=False)
    # Lifespan
    yield
    # Shutdown
    pass
