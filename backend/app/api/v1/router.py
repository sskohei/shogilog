from fastapi import APIRouter

from app.api.v1.endpoints.games import router as games_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.tags import router as tags_router

router = APIRouter()

router.include_router(
    games_router,
    tags=["Games"],
)

router.include_router(
    health_router,
    tags=["Health"],
)

router.include_router(
    tags_router,
    tags=["Tags"],
)
