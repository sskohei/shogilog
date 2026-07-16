from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=30)
    bio: str | None = Field(default=None, max_length=500)


class ProfileRead(BaseModel):
    id: UUID
    display_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    created_at: datetime
    updated_at: datetime


class ProfileDataResponse(BaseModel):
    data: ProfileRead


class PlatformRatingRead(BaseModel):
    platform_id: int
    has_played: bool
    rating: int | None = None
    rank: str | None = None
    updated_at: datetime | None = None


class PlatformRatingListResponse(BaseModel):
    data: list[PlatformRatingRead]


class PlatformRatingUpsert(BaseModel):
    has_played: bool
    rating: int | None = None
    rank: str | None = None
