from uuid import UUID, uuid4

from app.schemas.game import GameListFilters
from app.services.dashboard import DashboardService


class FakeGameRepository:
    def __init__(self) -> None:
        self.user_id = uuid4()
        self.rows: list[dict] = [
            {"result": "win", "platform_id": 1, "my_opening_id": 6},
            {"result": "win", "platform_id": 1, "my_opening_id": 6},
            {"result": "lose", "platform_id": 1, "my_opening_id": 7},
            {"result": "draw", "platform_id": 2, "my_opening_id": None},
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


def make_service(game_repository: FakeGameRepository) -> DashboardService:
    return DashboardService(
        game_repository=game_repository,
        opening_repository=FakeOpeningRepository(),
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


def test_get_dashboard_includes_recent_games():
    game_repository = FakeGameRepository()
    service = make_service(game_repository)

    data = service.get_dashboard(game_repository.user_id)

    assert len(data.recent_games) == 1


def test_get_dashboard_handles_no_games():
    game_repository = FakeGameRepository()
    game_repository.rows = []
    game_repository.recent = []
    service = make_service(game_repository)

    data = service.get_dashboard(game_repository.user_id)

    assert data.total_games == 0
    assert data.win_rate == 0.0
    assert data.platform_stats == []
    assert data.opening_stats == []
    assert data.recent_games == []
