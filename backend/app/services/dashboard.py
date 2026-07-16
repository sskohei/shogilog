from uuid import UUID

from app.repositories.games import GameRepository
from app.repositories.openings import OpeningRepository
from app.schemas.dashboard import (
    DashboardData,
    MonthlyStat,
    OpeningStat,
    PlatformStat,
    SideStat,
)
from app.schemas.game import GameListFilters

RECENT_GAMES_LIMIT = 5


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
    ) -> None:
        self.game_repository = game_repository or GameRepository()
        self.opening_repository = opening_repository or OpeningRepository()

    def get_dashboard(self, user_id: UUID) -> DashboardData:
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

        return DashboardData(
            total_games=len(rows),
            win_rate=_win_rate(wins, losses),
            recent_games=recent_games,
            platform_stats=self._aggregate_platform_stats(rows),
            opening_stats=self._aggregate_opening_stats(rows),
            side_stats=self._aggregate_side_stats(rows),
            monthly_stats=self._aggregate_monthly_stats(rows),
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

    def _aggregate_opening_stats(self, rows: list[dict]) -> list[OpeningStat]:
        opening_names = {
            opening["id"]: opening["name"]
            for opening in self.opening_repository.list_all()
        }

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

    def _aggregate_monthly_stats(self, rows: list[dict]) -> list[MonthlyStat]:
        counts: dict[str, int] = {}

        for row in rows:
            month = row["played_at"][:7]
            counts[month] = counts.get(month, 0) + 1

        return [
            MonthlyStat(month=month, game_count=counts[month])
            for month in sorted(counts)
        ]
