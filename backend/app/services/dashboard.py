from datetime import datetime, timedelta, timezone
from uuid import UUID

from app.repositories.games import GameRepository
from app.repositories.openings import OpeningRepository
from app.repositories.ratings import RatingRepository
from app.schemas.dashboard import (
    DailyStat,
    DashboardData,
    MonthlyStat,
    OpeningDistributionStat,
    OpeningStat,
    PlatformStat,
    RatingHistoryPoint,
    SideStat,
    WeeklyStat,
    YearlyStat,
)
from app.schemas.game import GameListFilters

RECENT_GAMES_LIMIT = 5
RATING_HISTORY_LIMIT_PER_PLATFORM = 100
DAILY_STATS_WINDOW_DAYS = 30


def _win_rate(wins: int, losses: int) -> float:
    decided = wins + losses

    if decided == 0:
        return 0.0

    return wins / decided


class DashboardService:
    """
    Aggregates game history into dashboard statistics.
    """

    def __init__(
        self,
        game_repository: GameRepository | None = None,
        opening_repository: OpeningRepository | None = None,
        rating_repository: RatingRepository | None = None,
    ) -> None:
        self.game_repository = game_repository or GameRepository()
        self.opening_repository = opening_repository or OpeningRepository()
        self.rating_repository = rating_repository or RatingRepository()

    def get_dashboard(self, user_id: UUID, now: datetime | None = None) -> DashboardData:
        now = now or datetime.now(timezone.utc)
        rows = self.game_repository.list_stats_by_user(user_id)
        recent_games, _ = self.game_repository.list_by_user(
            user_id,
            GameListFilters(
                page=1,
                limit=RECENT_GAMES_LIMIT,
                sort="played_at",
                order="desc",
            ),
        )

        wins = sum(1 for row in rows if row["result"] == "win")
        losses = sum(1 for row in rows if row["result"] == "lose")
        opening_names = {
            opening["id"]: opening["name"]
            for opening in self.opening_repository.list_all()
        }

        return DashboardData(
            total_games=len(rows),
            win_rate=_win_rate(wins, losses),
            recent_games=recent_games,
            platform_stats=self._aggregate_platform_stats(rows),
            opening_stats=self._aggregate_opening_stats(rows, opening_names),
            side_stats=self._aggregate_side_stats(rows),
            my_opening_distribution=self._aggregate_opening_distribution(
                rows, opening_names, "my_opening_id"
            ),
            opponent_opening_distribution=self._aggregate_opening_distribution(
                rows, opening_names, "opponent_opening_id"
            ),
            daily_stats=self._aggregate_daily_stats(rows, now),
            weekly_stats=self._aggregate_weekly_stats(rows),
            monthly_stats=self._aggregate_monthly_stats(rows),
            yearly_stats=self._aggregate_yearly_stats(rows),
            rating_history=self._aggregate_rating_history(
                self.rating_repository.list_by_user(user_id)
            ),
        )

    def _aggregate_platform_stats(self, rows: list[dict]) -> list[PlatformStat]:
        grouped: dict[int, dict[str, int]] = {}

        for row in rows:
            counts = grouped.setdefault(row["platform_id"], {"win": 0, "lose": 0})

            if row["result"] in counts:
                counts[row["result"]] += 1

        return [
            PlatformStat(
                platform_id=platform_id,
                win_rate=_win_rate(counts["win"], counts["lose"]),
            )
            for platform_id, counts in sorted(grouped.items())
        ]

    def _aggregate_opening_stats(
        self, rows: list[dict], opening_names: dict[int, str]
    ) -> list[OpeningStat]:
        counts: dict[int, dict[str, int]] = {}
        totals: dict[int, int] = {}

        for row in rows:
            opening_id = row["my_opening_id"]

            if opening_id is None:
                continue

            result_counts = counts.setdefault(opening_id, {"win": 0, "lose": 0})

            if row["result"] in result_counts:
                result_counts[row["result"]] += 1

            totals[opening_id] = totals.get(opening_id, 0) + 1

        ordered_ids = sorted(
            counts.keys(),
            key=lambda opening_id: (
                -totals[opening_id],
                opening_names.get(opening_id, ""),
            ),
        )

        return [
            OpeningStat(
                opening_name=opening_names.get(opening_id, "Unknown"),
                win_rate=_win_rate(
                    counts[opening_id]["win"],
                    counts[opening_id]["lose"],
                ),
            )
            for opening_id in ordered_ids
        ]

    def _aggregate_opening_distribution(
        self, rows: list[dict], opening_names: dict[int, str], key: str
    ) -> list[OpeningDistributionStat]:
        counts: dict[int, int] = {}

        for row in rows:
            opening_id = row[key]

            if opening_id is None:
                continue

            counts[opening_id] = counts.get(opening_id, 0) + 1

        ordered_ids = sorted(
            counts.keys(),
            key=lambda opening_id: (-counts[opening_id], opening_names.get(opening_id, "")),
        )

        return [
            OpeningDistributionStat(
                opening_name=opening_names.get(opening_id, "Unknown"),
                game_count=counts[opening_id],
            )
            for opening_id in ordered_ids
        ]

    def _aggregate_side_stats(self, rows: list[dict]) -> list[SideStat]:
        grouped: dict[str, dict[str, int]] = {}

        for row in rows:
            counts = grouped.setdefault(row["side"], {"win": 0, "lose": 0})

            if row["result"] in counts:
                counts[row["result"]] += 1

        return [
            SideStat(
                side=side,
                win_rate=_win_rate(grouped[side]["win"], grouped[side]["lose"]),
            )
            for side in ("sente", "gote")
            if side in grouped
        ]

    def _aggregate_daily_stats(self, rows: list[dict], now: datetime) -> list[DailyStat]:
        end_date = now.date()
        start_date = end_date - timedelta(days=DAILY_STATS_WINDOW_DAYS - 1)

        counts: dict[str, int] = {
            (start_date + timedelta(days=offset)).isoformat(): 0
            for offset in range(DAILY_STATS_WINDOW_DAYS)
        }

        for row in rows:
            played_date = datetime.fromisoformat(row["played_at"]).date()

            if start_date <= played_date <= end_date:
                date_key = played_date.isoformat()
                counts[date_key] += 1

        return [
            DailyStat(date=date, game_count=counts[date])
            for date in sorted(counts)
        ]

    def _aggregate_weekly_stats(self, rows: list[dict]) -> list[WeeklyStat]:
        counts: dict[str, int] = {}

        for row in rows:
            played_date = datetime.fromisoformat(row["played_at"]).date()
            week_start = played_date - timedelta(days=played_date.weekday())
            week = week_start.isoformat()
            counts[week] = counts.get(week, 0) + 1

        return [
            WeeklyStat(week=week, game_count=counts[week])
            for week in sorted(counts)
        ]

    def _aggregate_monthly_stats(self, rows: list[dict]) -> list[MonthlyStat]:
        counts: dict[str, int] = {}

        for row in rows:
            month = row["played_at"][:7]
            counts[month] = counts.get(month, 0) + 1

        return [
            MonthlyStat(month=month, game_count=counts[month])
            for month in sorted(counts)
        ]

    def _aggregate_yearly_stats(self, rows: list[dict]) -> list[YearlyStat]:
        counts: dict[str, int] = {}

        for row in rows:
            year = row["played_at"][:4]
            counts[year] = counts.get(year, 0) + 1

        return [
            YearlyStat(year=year, game_count=counts[year])
            for year in sorted(counts)
        ]

    def _aggregate_rating_history(self, rows: list[dict]) -> list[RatingHistoryPoint]:
        by_platform: dict[int, list[dict]] = {}

        for row in rows:
            by_platform.setdefault(row["platform_id"], []).append(row)

        limited_rows = [
            row
            for platform_rows in by_platform.values()
            for row in platform_rows[-RATING_HISTORY_LIMIT_PER_PLATFORM:]
        ]
        limited_rows.sort(key=lambda row: row["recorded_at"])

        return [
            RatingHistoryPoint(
                platform_id=row["platform_id"],
                rating=row["rating"],
                rank=row.get("rank"),
                recorded_at=row["recorded_at"],
            )
            for row in limited_rows
        ]
