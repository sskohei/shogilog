import json
import logging

access_logger = logging.getLogger("app.access")

_EXTRA_FIELDS = (
    "request_id",
    "user_id",
    "method",
    "path",
    "status_code",
    "response_time_ms",
)


class JsonLogFormatter(logging.Formatter):
    """
    Format log records as single-line JSON, including any of the
    request-scoped fields (request_id, user_id, method, path, status_code,
    response_time_ms) that were attached via `extra=`.
    """

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, object] = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        for field in _EXTRA_FIELDS:
            if field in record.__dict__:
                payload[field] = record.__dict__[field]

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str)


def setup_logging(level: int = logging.INFO) -> None:
    """
    Configure the root logger to emit JSON-formatted log lines.
    """
    root_logger = logging.getLogger()

    if not any(isinstance(h.formatter, JsonLogFormatter) for h in root_logger.handlers):
        handler = logging.StreamHandler()
        handler.setFormatter(JsonLogFormatter())
        root_logger.addHandler(handler)

    root_logger.setLevel(level)
