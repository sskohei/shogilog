from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from app.schemas.game import GameListFilters
from app.services.dashboard import DashboardService


class FakeGameRepository:
    def __init__(self) -> None:
        self.user_id = uuid4()
        self.rows: list[dict] = [
            {
                "result": "win",
                "platform_id": 1,
                "my_opening_id": 6,
                "side": "sente",
                "played_at": "2026-06-10T10:00:00+00:00",
            },
            {
                "result": "win",
                "platform_id": 1,
                "my_opening_id": 6,
                "side": "sente",
                "played_at": "2026-07-05T10:00:00+00:00",
            },
            {
                "result": "lose",
                "platform_id": 1,
                "my_opening_id": 7,
                "side": "gote",
                "played_at": "2026-07-06T10:00:00+00:00",
            },
            {
                "result": "draw",
                "platform_id": 2,
                "my_opening_id": None,
                "side": "gote",
                "played_at": "2026-07-07T10:00:00+00:00",
            },
        ]
        self.recent: list[dict] = [
            {
                "id": str(uuid4()),
                "user_id": str(self.user_id),
                "platform_id": 1,
                "played_at": "2026-07-05T10:00:00+00:00",
                "result": "win",
                "side": "sente",
                "my_opening_id": 6,
                "opponent_opening_id": None,
                "rating_before": 1200,
                "rating_after": 1210,
                "opponent_name": "player123",
                "opponent_rating": 1190,
                "memo": None,
                "kifu_path": None,
                "created_at": "2026-07-05T10:10:00+00:00",
                "updated_at": "2026-07-05T10:10:00+00:00",
            }
        ]

    def list_stats_by_user(self, user_id: UUID) -> list[dict]:
        return self.rows if user_id == self.user_id else []

    def list_by_user(self, user_id: UUID, filters: GameListFilters):
        return self.recent, len(self.recent)


class FakeOpeningRepository:
    def list_all(self) -> list[dict]:
        return [
            {"id": 6, "name": "四間飛車"},
            {"id": 7, "name": "三間飛車"},
        ]


class FakeRatingRepository:
    def __init__(self, user_id: UUID) -> None:
        self.user_id = user_id
        self.rows: list[dict] = [
            {
                "platform_id": 1,
                "rating": 1200,
                "rank": None,
                "recorded_at": "2026-06-10T10:00:00+00:00",
            },
            {
                "platform_id": 1,
                "rating": 1215,
                "rank": "初段",
                "recorded_at": "2026-07-05T10:00:00+00:00",
            },
            {
                "platform_id": 2,
                "rating": 1500,
                "rank": None,
                "recorded_at": "2026-07-06T10:00:00+00:00",
            },
        ]

    def list_by_user(self, user_id: UUID) -> list[dict]:
        return self.rows if user_id == self.user_id else []


def make_service(
    game_repository: FakeGameRepository,
    rating_repository: FakeRatingRepository | None = None,
) -> DashboardService:
    return DashboardService(
        game_repository=game_repository,
        opening_repository=FakeOpeningRepository(),
        rating_repository=rating_repository or FakeRatingRepository(game_repository.user_id),
    )


def test_get_dashboard_computes_overall_win_rate():
    game_repository = FakeGameRepository()
    service = make_service(game_repository)

    data = service.get_dashboard(game_repository.user_id)

    assert data.total_games == 4
    assert data.win_rate == 2 / 3


def test_get_dashboard_groups_platform_stats():
    game_repository = FakeGameRepository()
    service = make_service(game_repository)

    data = service.get_dashboard(game_repository.user_id)

    platform_1 = next(p for p in data.platform_stats if p.platform_id == 1)
    platform_2 = next(p for p in data.platform_stats if p.platform_id == 2)

    assert platform_1.win_rate == 2 / 3
    assert platform_2.win_rate == 0.0


def test_get_dashboard_opening_stats_excludes_null_opening():
    game_repository = FakeGameRepository()
    service = make_service(game_repository)

    data = service.get_dashboard(game_repository.user_id)

    opening_names = {o.opening_name for o in data.opening_stats}
    assert opening_names == {"四間飛車", "三間飛車"}

    shikenbisha = next(
        o for o in data.opening_stats if o.opening_name == "四間飛車"
    )
    assert shikenbisha.win_rate == 1.0


def test_get_dashboard_groups_side_stats():
    game_repository = FakeGameRepository()
    service = make_service(game_repository)

    data = service.get_dashboard(game_repository.user_id)

    sente = next(s for s in data.side_stats if s.side == "sente")
    gote = next(s for s in data.side_stats if s.side == "gote")

    assert sente.win_rate == 1.0
    assert gote.win_rate == 0.0


def test_get_dashboard_groups_monthly_stats():
    game_repository = FakeGameRepository()
    service = make_service(game_repository)

    data = service.get_dashboard(game_repository.user_id)

    monthly = {m.month: m.game_count for m in data.monthly_stats}
    assert monthly == {"2026-06": 1, "2026-07": 3}
    assert [m.month for m in data.monthly_stats] == ["2026-06", "2026-07"]


def test_get_dashboard_groups_yearly_stats():
    game_repository = FakeGameRepository()
    service = make_service(game_repository)

    data = service.get_dashboard(game_repository.user_id)

    yearly = {y.year: y.game_count for y in data.yearly_stats}
    assert yearly == {"2026": 4}


def test_get_dashboard_groups_weekly_stats():
    game_repository = FakeGameRepository()
    service = make_service(game_repository)

    data = service.get_dashboard(game_repository.user_id)

    weekly = {w.week: w.game_count for w in data.weekly_stats}
    # 2026-06-10 (Wed) -> week of 2026-06-08
    # 2026-07-05 (Sun) -> week of 2026-06-29
    # 2026-07-06 (Mon) / 2026-07-07 (Tue) -> week of 2026-07-06
    assert weekly == {"2026-06-08": 1, "2026-06-29": 1, "2026-07-06": 2}
    assert [w.week for w in data.weekly_stats] == ["2026-06-08", "2026-06-29", "2026-07-06"]


def test_get_dashboard_groups_daily_stats_within_last_30_days():
    game_repository = FakeGameRepository()
    game_repository.rows.append(
        {
            "result": "win",
            "platform_id": 1,
            "my_opening_id": 6,
            "side": "sente",
            "played_at": "2025-01-01T10:00:00+00:00",
        }
    )
    service = make_service(game_repository)
    now = datetime(2026, 7, 7, tzinfo=UTC)

    data = service.get_dashboard(game_repository.user_id, now=now)

    assert len(data.daily_stats) == 30
    assert data.daily_stats[0].date == "2026-06-08"
    assert data.daily_stats[-1].date == "2026-07-07"

    daily = {d.date: d.game_count for d in data.daily_stats}
    assert daily["2026-06-10"] == 1
    assert daily["2026-07-05"] == 1
    assert daily["2026-07-06"] == 1
    assert daily["2026-07-07"] == 1
    # 2025-01-01 falls outside the 30-day window and should not be counted.
    assert sum(daily.values()) == 4
    # Days without games are zero-filled rather than omitted.
    assert daily["2026-06-09"] == 0


def test_get_dashboard_includes_recent_games():
    game_repository = FakeGameRepository()
    service = make_service(game_repository)

    data = service.get_dashboard(game_repository.user_id)

    assert len(data.recent_games) == 1


def test_get_dashboard_handles_no_games():
    game_repository = FakeGameRepository()
    game_repository.rows = []
    game_repository.recent = []
    rating_repository = FakeRatingRepository(game_repository.user_id)
    rating_repository.rows = []
    service = make_service(game_repository, rating_repository)

    data = service.get_dashboard(game_repository.user_id)

    assert data.total_games == 0
    assert data.win_rate == 0.0
    assert data.platform_stats == []
    assert data.opening_stats == []
    assert data.side_stats == []
    assert data.weekly_stats == []
    assert data.monthly_stats == []
    assert data.yearly_stats == []
    assert len(data.daily_stats) == 30
    assert all(d.game_count == 0 for d in data.daily_stats)
    assert data.recent_games == []
    assert data.rating_history == []


def test_get_dashboard_includes_rating_history():
    game_repository = FakeGameRepository()
    service = make_service(game_repository)

    data = service.get_dashboard(game_repository.user_id)

    assert len(data.rating_history) == 3
    assert [point.platform_id for point in data.rating_history] == [1, 1, 2]
    assert [point.rating for point in data.rating_history] == [1200, 1215, 1500]
    assert [point.rank for point in data.rating_history] == [None, "初段", None]


def test_get_dashboard_limits_rating_history_to_last_100_per_platform():
    game_repository = FakeGameRepository()
    rating_repository = FakeRatingRepository(game_repository.user_id)
    base_time = datetime(2026, 1, 1, tzinfo=UTC)
    rating_repository.rows = [
        {
            "platform_id": 1,
            "rating": 1000 + i,
            "rank": None,
            "recorded_at": (base_time + timedelta(minutes=i)).isoformat(),
        }
        for i in range(150)
    ] + [
        {"platform_id": 2, "rating": 1500, "rank": None, "recorded_at": "2026-07-06T10:00:00+00:00"},
    ]
    service = make_service(game_repository, rating_repository)

    data = service.get_dashboard(game_repository.user_id)

    platform_1_points = [p for p in data.rating_history if p.platform_id == 1]
    platform_2_points = [p for p in data.rating_history if p.platform_id == 2]

    assert len(platform_1_points) == 100
    assert [p.rating for p in platform_1_points] == [1000 + i for i in range(50, 150)]
    assert len(platform_2_points) == 1
