from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthUser
from app.schemas.rating import (
    RatingCreate,
    RatingId,
    RatingIdResponse,
    RatingListResponse,
)
from app.services.ratings import RatingService

router = APIRouter(prefix="/ratings")


def get_rating_service() -> RatingService:
    return RatingService()


@router.get("", response_model=RatingListResponse)
async def list_ratings(
    current_user: AuthUser = Depends(get_current_user),
    service: RatingService = Depends(get_rating_service),
) -> RatingListResponse:
    ratings = service.list_ratings(current_user.id)
    return RatingListResponse(data=ratings)


@router.post(
    "",
    response_model=RatingIdResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_rating(
    payload: RatingCreate,
    current_user: AuthUser = Depends(get_current_user),
    service: RatingService = Depends(get_rating_service),
) -> RatingIdResponse:
    rating = service.create_rating(current_user.id, payload)
    return RatingIdResponse(data=RatingId(id=rating["id"]))
