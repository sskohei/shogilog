from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class RatingBase(BaseModel):
    platform_id: int = Field(..., ge=1)
    rating: int
    rank: str | None = None
    game_id: UUID | None = None


class RatingCreate(RatingBase):
    pass


class RatingRead(RatingBase):
    id: UUID
    user_id: UUID
    recorded_at: datetime
    created_at: datetime


class RatingListResponse(BaseModel):
    data: list[RatingRead]


class RatingId(BaseModel):
    id: UUID


class RatingIdResponse(BaseModel):
    data: RatingId
