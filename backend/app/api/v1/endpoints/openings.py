from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthUser
from app.schemas.opening import OpeningDataResponse, OpeningListResponse
from app.services.openings import OpeningService

router = APIRouter(prefix="/openings")


def get_opening_service() -> OpeningService:
    return OpeningService()


@router.get("", response_model=OpeningListResponse)
async def list_openings(
    current_user: AuthUser = Depends(get_current_user),
    service: OpeningService = Depends(get_opening_service),
) -> OpeningListResponse:
    openings = service.list_openings()
    return OpeningListResponse(data=openings)


@router.get("/{opening_id}", response_model=OpeningDataResponse)
async def get_opening(
    opening_id: int,
    current_user: AuthUser = Depends(get_current_user),
    service: OpeningService = Depends(get_opening_service),
) -> OpeningDataResponse:
    opening = service.get_opening(opening_id)
    return OpeningDataResponse(data=opening)
