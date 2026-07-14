from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthUser
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard import DashboardService

router = APIRouter(prefix="/dashboard")


def get_dashboard_service() -> DashboardService:
    return DashboardService()


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    current_user: AuthUser = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service),
) -> DashboardResponse:
    data = service.get_dashboard(current_user.id)
    return DashboardResponse(data=data)
