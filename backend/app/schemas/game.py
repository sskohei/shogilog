from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.core.platforms import is_valid_rank, is_valid_rating_value
from app.schemas.common import Pagination


class GameResult(StrEnum):
    WIN = "win"
    LOSE = "lose"
    DRAW = "draw"


class PlayerSide(StrEnum):
    SENTE = "sente"
    GOTE = "gote"


class GameBase(BaseModel):
    platform_id: int = Field(..., ge=1)
    played_at: datetime
    result: GameResult
    side: PlayerSide
    my_opening_id: int | None = Field(default=None, ge=1)
    opponent_opening_id: int | None = Field(default=None, ge=1)
    rating_before: int | None = None
    rating_after: int | None = None
    opponent_name: str | None = Field(default=None, max_length=255)
    opponent_rating: int | None = None
    rank_before: str | None = Field(default=None, max_length=32)
    rank_after: str | None = Field(default=None, max_length=32)
    opponent_rank: str | None = Field(default=None, max_length=32)
    memo: str | None = Field(default=None, max_length=2000)
    kifu_path: str | None = Field(default=None, max_length=1024)


class GameCreate(GameBase):
    @model_validator(mode="after")
    def _validate_rating_and_rank(self) -> "GameCreate":
        for value in (self.rating_before, self.rating_after, self.opponent_rating):
            if value is not None and not is_valid_rating_value(self.platform_id, value):
                raise ValueError("Rating value is out of range for this platform.")

        for rank in (self.rank_before, self.rank_after, self.opponent_rank):
            if not is_valid_rank(self.platform_id, rank):
                raise ValueError("Rank value is not valid for this platform.")

        return self


class GameUpdate(BaseModel):
    platform_id: int | None = Field(default=None, ge=1)
    played_at: datetime | None = None
    result: GameResult | None = None
    side: PlayerSide | None = None
    my_opening_id: int | None = Field(default=None, ge=1)
    opponent_opening_id: int | None = Field(default=None, ge=1)
    rating_before: int | None = None
    rating_after: int | None = None
    opponent_name: str | None = Field(default=None, max_length=255)
    opponent_rating: int | None = None
    rank_before: str | None = Field(default=None, max_length=32)
    rank_after: str | None = Field(default=None, max_length=32)
    opponent_rank: str | None = Field(default=None, max_length=32)
    memo: str | None = Field(default=None, max_length=2000)
    kifu_path: str | None = Field(default=None, max_length=1024)


class GameRead(GameBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class GameDataResponse(BaseModel):
    data: GameRead


class GameId(BaseModel):
    id: UUID


class GameIdResponse(BaseModel):
    data: GameId


class GameListResponse(BaseModel):
    data: list[GameRead]
    pagination: Pagination


class GameKifuUrl(BaseModel):
    url: str | None


class GameKifuUrlResponse(BaseModel):
    data: GameKifuUrl


class GameListFilters(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    platform_id: int | None = Field(default=None, ge=1)
    result: GameResult | None = None
    side: PlayerSide | None = None
    opening_id: int | None = Field(default=None, ge=1)
    from_date: datetime | None = None
    to_date: datetime | None = None
    search: str | None = Field(default=None, min_length=1, max_length=255)
    sort: str = Field(default="played_at", pattern="^(played_at|created_at|result)$")
    order: str = Field(default="desc", pattern="^(asc|desc)$")
