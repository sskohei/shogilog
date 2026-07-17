from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.game import GameRead


class PlatformStat(BaseModel):
    platform_id: int
    win_rate: float = Field(..., ge=0, le=1)


class OpeningStat(BaseModel):
    opening_name: str
    win_rate: float = Field(..., ge=0, le=1)


class SideStat(BaseModel):
    side: Literal["sente", "gote"]
    win_rate: float = Field(..., ge=0, le=1)


class MonthlyStat(BaseModel):
    month: str
    game_count: int = Field(..., ge=0)


class RatingHistoryPoint(BaseModel):
    platform_id: int
    rating: int
    rank: str | None = None
    recorded_at: datetime


class DashboardData(BaseModel):
    total_games: int = Field(..., ge=0)
    win_rate: float = Field(..., ge=0, le=1)
    recent_games: list[GameRead]
    platform_stats: list[PlatformStat]
    opening_stats: list[OpeningStat]
    side_stats: list[SideStat]
    monthly_stats: list[MonthlyStat]
    rating_history: list[RatingHistoryPoint]


class DashboardResponse(BaseModel):
    data: DashboardData
