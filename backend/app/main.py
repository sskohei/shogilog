from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.db.supabase import initialize_supabase


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    アプリケーション起動時・終了時の処理
    """
    initialize_supabase()
    yield


app = FastAPI(
    title=settings.project_name,
    description="Backend API for ShogiLog",
    version=settings.api_version,
    lifespan=lifespan,
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