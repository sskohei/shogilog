import logging
import time
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import get_settings
from app.core.logging import access_logger, setup_logging

logger = logging.getLogger(__name__)

settings = get_settings()

setup_logging()


app = FastAPI(
    title=settings.project_name,
    description="Backend API for ShogiLog",
    version=settings.api_version,
)

app.include_router(api_router)


@app.middleware("http")
async def access_log_middleware(request: Request, call_next):
    """
    Log every request as a single JSON access log line and echo an
    X-Request-ID header, so requests can be correlated with the Error Log.
    """
    request_id = request.headers.get("x-request-id") or str(uuid4())
    request.state.request_id = request_id
    start_time = time.perf_counter()
    response = None

    try:
        response = await call_next(request)
    finally:
        response_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
        status_code = response.status_code if response is not None else 500
        access_logger.info(
            "%s %s %s",
            request.method,
            request.url.path,
            status_code,
            extra={
                "request_id": request_id,
                "user_id": getattr(request.state, "user_id", None),
                "method": request.method,
                "path": request.url.path,
                "status_code": status_code,
                "response_time_ms": response_time_ms,
            },
        )

    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(
        "Unhandled error: %s %s",
        request.method,
        request.url.path,
        extra={
            "request_id": getattr(request.state, "request_id", None),
            "user_id": getattr(request.state, "user_id", None),
            "method": request.method,
            "path": request.url.path,
        },
    )
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/", tags=["Root"])
async def root():
    """
    APIルート
    """
    return {
        "message": f"Welcome to {settings.project_name}",
        "version": settings.api_version,
    }
