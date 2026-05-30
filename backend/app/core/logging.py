"""Structured logging configuration untuk AgriShield API."""

import json
import logging
import time
import uuid
from collections.abc import Awaitable, Callable
from typing import Any

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class RequestIDFilter(logging.Filter):
    """Filter logging yang menambahkan request_id ke setiap log record."""

    def __init__(self) -> None:
        super().__init__()
        self._request_id: str = ""

    def set_request_id(self, request_id: str) -> None:
        self._request_id = request_id

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = self._request_id or "-"
        return True


# Instance global dari filter — digunakan oleh middleware dan logger
request_id_filter = RequestIDFilter()


class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware yang:
    1. Memberi setiap request X-Request-ID (UUID).
    2. Mencatat method, path, status, duration, request_id.
    """

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        request_id = request.headers.get("X-Request-ID", uuid.uuid4().hex[:12])
        request.state.request_id = request_id

        # Pasang request_id di filter logging supaya semua log di request ini kebawa
        request_id_filter.set_request_id(request_id)

        start = time.monotonic()
        response: Response = await call_next(request)
        duration_ms = int((time.monotonic() - start) * 1000)

        response.headers["X-Request-ID"] = request_id

        logger = logging.getLogger("uvicorn.access")
        extra: dict[str, Any] = {
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "duration_ms": duration_ms,
        }
        logger.info("%s %s → %s (%dms)", request.method, request.url.path, response.status_code, duration_ms, extra=extra)

        return response


def setup_logging(app: FastAPI, log_level: str = "INFO") -> None:
    """
    Konfigurasi logging terstruktur (JSON) untuk AgriShield API.
    """
    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Hapus handler default agar tidak dobel
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    handler = logging.StreamHandler()
    handler.setFormatter(_JsonFormatter())
    root_logger.addHandler(handler)

    # Pasang request_id filter
    root_logger.addFilter(request_id_filter)

    # Set level untuk logger pihak ketiga yang bawel
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("botocore").setLevel(logging.WARNING)

    # Register middleware — pasang paling awal
    app.add_middleware(StructuredLoggingMiddleware)


class _JsonFormatter(logging.Formatter):
    """Format log sebagai JSON untuk agregasi di log system."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry: dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", "-"),
        }
        if record.exc_info and record.exc_info[0]:
            log_entry["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "extra"):
            log_entry.update(record.extra)  # type: ignore[arg-type]
        return json.dumps(log_entry, default=str)
