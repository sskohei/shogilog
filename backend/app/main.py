from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import get_settings

settings = get_settings()


app = FastAPI(
    title=settings.project_name,
    description="Backend API for ShogiLog",
    version=settings.api_version,
)

app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    """
    APIルート
    """
    return {
        "message": f"Welcome to {settings.project_name}",
        "version": settings.api_version,
    }
