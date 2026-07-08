from datetime import UTC, datetime

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/health")


class HealthResponse(BaseModel):
    """
    Health check response model.
    """

    status: str
    service: str
    version: str
    timestamp: datetime


@router.get(
    "",
    response_model=HealthResponse,
    summary="Health Check",
    description="Returns the current health status of the API.",
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    """

    return HealthResponse(
        status="ok",
        service="ShogiLog API",
        version="1.0.0",
        timestamp=datetime.now(UTC),
    )