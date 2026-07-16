from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthUser
from app.schemas.common import MessageResponse
from app.schemas.profile import (
    PlatformRatingListResponse,
    PlatformRatingUpsert,
    ProfileDataResponse,
    ProfileUpdate,
)
from app.services.profile import ProfileService

router = APIRouter(prefix="/profile")


def get_profile_service() -> ProfileService:
    return ProfileService()


@router.get("", response_model=ProfileDataResponse)
async def get_profile(
    current_user: AuthUser = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service),
) -> ProfileDataResponse:
    profile = service.get_profile(current_user.id)
    return ProfileDataResponse(data=profile)


@router.put("", response_model=ProfileDataResponse)
async def update_profile(
    payload: ProfileUpdate,
    current_user: AuthUser = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service),
) -> ProfileDataResponse:
    profile = service.update_profile(current_user.id, payload)
    return ProfileDataResponse(data=profile)


@router.get("/platform-ratings", response_model=PlatformRatingListResponse)
async def list_platform_ratings(
    current_user: AuthUser = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service),
) -> PlatformRatingListResponse:
    ratings = service.list_platform_ratings(current_user.id)
    return PlatformRatingListResponse(data=ratings)


@router.put("/platform-ratings/{platform_id}", response_model=MessageResponse)
async def update_platform_rating(
    platform_id: int,
    payload: PlatformRatingUpsert,
    current_user: AuthUser = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service),
) -> MessageResponse:
    service.upsert_platform_rating(current_user.id, platform_id, payload)
    return MessageResponse(message="Platform rating updated successfully.")
