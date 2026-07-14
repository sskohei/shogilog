from pydantic import BaseModel, Field

from app.schemas.game import GameRead


class PlatformStat(BaseModel):
    platform_id: int
    win_rate: float = Field(..., ge=0, le=1)


class OpeningStat(BaseModel):
    opening_name: str
    win_rate: float = Field(..., ge=0, le=1)


class DashboardData(BaseModel):
    total_games: int = Field(..., ge=0)
    win_rate: float = Field(..., ge=0, le=1)
    recent_games: list[GameRead]
    platform_stats: list[PlatformStat]
    opening_stats: list[OpeningStat]


class DashboardResponse(BaseModel):
    data: DashboardData
