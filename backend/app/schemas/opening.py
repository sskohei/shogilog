from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class OpeningCategory(StrEnum):
    STATIC_ROOK = "static_rook"
    RANGING_ROOK = "ranging_rook"
    OTHER = "other"


class OpeningRead(BaseModel):
    id: int
    name: str
    slug: str
    category: OpeningCategory
    description: str | None = None
    is_active: bool
    created_at: datetime


class OpeningListResponse(BaseModel):
    data: list[OpeningRead]


class OpeningDataResponse(BaseModel):
    data: OpeningRead


class FavoriteOpeningIdsResponse(BaseModel):
    data: list[int]
