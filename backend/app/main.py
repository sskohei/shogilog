import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


app = FastAPI(
    title=settings.project_name,
    description="Backend API for ShogiLog",
    version=settings.api_version,
)

app.include_router(api_router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error: %s %s", request.method, request.url.path)
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
