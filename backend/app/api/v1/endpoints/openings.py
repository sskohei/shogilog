from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthUser
from app.schemas.common import MessageResponse
from app.schemas.opening import (
    FavoriteOpeningIdsResponse,
    OpeningDataResponse,
    OpeningListResponse,
)
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


@router.get("/favorites", response_model=FavoriteOpeningIdsResponse)
async def list_favorite_openings(
    current_user: AuthUser = Depends(get_current_user),
    service: OpeningService = Depends(get_opening_service),
) -> FavoriteOpeningIdsResponse:
    ids = service.list_favorite_ids(current_user.id)
    return FavoriteOpeningIdsResponse(data=ids)


@router.post(
    "/{opening_id}/favorite",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_favorite_opening(
    opening_id: int,
    current_user: AuthUser = Depends(get_current_user),
    service: OpeningService = Depends(get_opening_service),
) -> MessageResponse:
    service.add_favorite(current_user.id, opening_id)
    return MessageResponse(message="Opening added to favorites.")


@router.delete("/{opening_id}/favorite", response_model=MessageResponse)
async def remove_favorite_opening(
    opening_id: int,
    current_user: AuthUser = Depends(get_current_user),
    service: OpeningService = Depends(get_opening_service),
) -> MessageResponse:
    service.remove_favorite(current_user.id, opening_id)
    return MessageResponse(message="Opening removed from favorites.")


@router.get("/{opening_id}", response_model=OpeningDataResponse)
async def get_opening(
    opening_id: int,
    current_user: AuthUser = Depends(get_current_user),
    service: OpeningService = Depends(get_opening_service),
) -> OpeningDataResponse:
    opening = service.get_opening(opening_id)
    return OpeningDataResponse(data=opening)
