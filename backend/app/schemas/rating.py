from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.core.platforms import is_valid_rank, is_valid_rating_value


class RatingBase(BaseModel):
    platform_id: int = Field(..., ge=1)
    rating: int
    rank: str | None = None
    game_id: UUID | None = None


class RatingCreate(RatingBase):
    @model_validator(mode="after")
    def _validate_rating_and_rank(self) -> "RatingCreate":
        if not is_valid_rating_value(self.platform_id, self.rating):
            raise ValueError("Rating value is out of range for this platform.")

        if not is_valid_rank(self.platform_id, self.rank):
            raise ValueError("Rank value is not valid for this platform.")

        return self


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
