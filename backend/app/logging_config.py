"""Structured JSON logging configuration for the application.

Configures the root logger to emit JSON-formatted log records, which makes
logs trivially parseable by any observability platform (Railway, Datadog, etc.).
"""

import json
import logging
import traceback


class JsonFormatter(logging.Formatter):
    """Format log records as single-line JSON objects."""

    def format(self, record: logging.LogRecord) -> str:
        log_object: dict[str, object] = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            log_object["exc_info"] = traceback.format_exception(*record.exc_info)
        return json.dumps(log_object, ensure_ascii=False)


def configure_logging(level: str = "INFO") -> None:
    """Install the JSON formatter on the root logger.

    Call this once at application startup before any other logger is used.
    Uvicorn's own loggers are also captured so all output is uniform.
    """
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())

    root = logging.getLogger()
    root.setLevel(level)
    # Remove any handlers installed by uvicorn or earlier imports
    root.handlers.clear()
    root.addHandler(handler)

    # Suppress overly verbose SQLAlchemy engine logs in non-debug environments
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
