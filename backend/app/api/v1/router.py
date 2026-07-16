from fastapi import APIRouter

from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.games import router as games_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.openings import router as openings_router
from app.api.v1.endpoints.profile import router as profile_router
from app.api.v1.endpoints.ratings import router as ratings_router
from app.api.v1.endpoints.tags import router as tags_router

router = APIRouter()

router.include_router(
    dashboard_router,
    tags=["Dashboard"],
)

router.include_router(
    games_router,
    tags=["Games"],
)

router.include_router(
    health_router,
    tags=["Health"],
)

router.include_router(
    openings_router,
    tags=["Openings"],
)

router.include_router(
    profile_router,
    tags=["Profile"],
)

router.include_router(
    ratings_router,
    tags=["Ratings"],
)

router.include_router(
    tags_router,
    tags=["Tags"],
)
