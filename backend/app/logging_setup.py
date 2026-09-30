"""Process-wide logging configuration shared by the API and background workers."""

import logging

from .config import LOG_LEVEL

# One line per record with timestamp, level, and module keeps Docker logs greppable.
LOG_FORMAT = "%(asctime)s %(levelname)s %(name)s: %(message)s"


def configure_logging() -> None:
    """Configure root logging once per process from ``LOG_LEVEL`` (default ``INFO``).

    Calling this more than once is harmless: ``logging.basicConfig`` leaves existing handlers alone,
    so uvicorn's or pytest's handlers are not replaced.
    """
    logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT)
