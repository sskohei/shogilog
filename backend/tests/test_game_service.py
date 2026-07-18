from datetime import UTC, datetime
from uuid import UUID, uuid4

import pydantic
import pytest
from fastapi import HTTPException
from storage3.exceptions import StorageApiError

from app.schemas.game import (
    GameCreate,
    GameListFilters,
    GameResult,
    GameUpdate,
    PlayerSide,
)
from app.services.games import GameService


class FakeGameRepository:
    def __init__(self) -> None:
        self.user_id = uuid4()
        self.game_id = uuid4()
        self.game = {
            "id": str(self.game_id),
            "user_id": str(self.user_id),
            "platform_id": 1,
            "played_at": "2026-07-05T10:00:00+00:00",
            "result": "win",
            "side": "sente",
            "my_opening_id": None,
            "opponent_opening_id": None,
            "rating_before": 60,
            "rating_after": 75,
            "opponent_name": "player123",
            "opponent_rating": 55,
            "rank_before": None,
            "rank_after": None,
            "opponent_rank": None,
            "memo": "test",
            "kifu_path": None,
            "created_at": "2026-07-05T10:10:00+00:00",
            "updated_at": "2026-07-05T10:10:00+00:00",
        }
        self.updated_payload: dict | None = None
        self.signed_url = "https://example.supabase.co/storage/v1/object/sign/kifu/test.kif"
        self.uploaded_kifu: tuple[str, str] | None = None
        self.raise_on_upload = False
        self.signed_url_download: str | bool | None = None

    def list_by_user(self, user_id: UUID, filters: GameListFilters):
        return [self.game], 1

    def get_by_id(self, user_id: UUID, game_id: UUID):
        if game_id == self.game_id:
            return self.game

        return None

    def create(self, user_id: UUID, data: dict):
        return {**self.game, **data, "user_id": str(user_id)}

    def update(self, user_id: UUID, game_id: UUID, data: dict):
        if game_id != self.game_id:
            return None

        self.updated_payload = data
        return {**self.game, **data}

    def delete(self, user_id: UUID, game_id: UUID):
        return game_id == self.game_id

    def create_signed_kifu_url(
        self, path: str, expires_in: int = 300, download: str | bool = True
    ):
        self.signed_url_download = download
        return self.signed_url

    def upload_kifu_text(self, path: str, content: str) -> None:
        if self.raise_on_upload:
            raise StorageApiError("upload failed", "upload_failed", 500)

        self.uploaded_kifu = (path, content)


class FakeRatingRepository:
    def __init__(self) -> None:
        self.created: list[dict] = []

    def create(self, user_id: UUID, data: dict) -> dict:
        record = {**data, "user_id": str(user_id)}
        self.created.append(record)
        return record


class FakePlatformRepository:
    def __init__(self) -> None:
        self.platforms = {
            1: {"id": 1, "name": "将棋ウォーズ"},
            2: {"id": 2, "name": "将棋クエスト"},
            3: {"id": 3, "name": "棋桜"},
            4: {"id": 4, "name": "81道場"},
        }

    def get_by_id(self, platform_id: int) -> dict | None:
        return self.platforms.get(platform_id)


class FakeOpeningRepository:
    def __init__(self) -> None:
        self.openings = {
            6: {"id": 6, "name": "四間飛車"},
            7: {"id": 7, "name": "三間飛車"},
        }

    def get_by_id(self, opening_id: int) -> dict | None:
        return self.openings.get(opening_id)


def make_service(
    repository: FakeGameRepository,
    rating_repository: FakeRatingRepository | None = None,
    platform_repository: FakePlatformRepository | None = None,
    opening_repository: FakeOpeningRepository | None = None,
) -> GameService:
    return GameService(
        repository=repository,
        rating_repository=rating_repository or FakeRatingRepository(),
        platform_repository=platform_repository or FakePlatformRepository(),
        opening_repository=opening_repository or FakeOpeningRepository(),
    )


def make_create_payload() -> GameCreate:
    return GameCreate(
        platform_id=1,
        played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
        result=GameResult.WIN,
        side=PlayerSide.SENTE,
        rating_before=60,
        rating_after=75,
        opponent_name="player123",
        opponent_rating=55,
        memo="test",
    )


def test_list_games_returns_pagination():
    repository = FakeGameRepository()
    service = make_service(repository)

    games, pagination = service.list_games(
        repository.user_id,
        GameListFilters(),
    )

    assert len(games) == 1
    assert pagination.total == 1
    assert pagination.total_pages == 1


def test_create_game_adds_user_scoped_payload():
    repository = FakeGameRepository()
    service = make_service(repository)

    game = service.create_game(repository.user_id, make_create_payload())

    assert game["user_id"] == str(repository.user_id)
    assert game["platform_id"] == 1
    assert game["result"] == "win"


def test_create_game_records_rating_history():
    repository = FakeGameRepository()
    rating_repository = FakeRatingRepository()
    service = make_service(repository, rating_repository)

    game = service.create_game(repository.user_id, make_create_payload())

    assert len(rating_repository.created) == 1
    record = rating_repository.created[0]
    assert record["platform_id"] == 1
    assert record["rating"] == 75
    assert record["game_id"] == game["id"]
    assert record["recorded_at"] == "2026-07-05T10:00:00Z"
    assert record["user_id"] == str(repository.user_id)
    assert record["rank"] is None


def test_create_game_records_rank_alongside_rating():
    repository = FakeGameRepository()
    rating_repository = FakeRatingRepository()
    service = make_service(repository, rating_repository)
    payload = GameCreate(
        platform_id=1,
        played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
        result=GameResult.WIN,
        side=PlayerSide.SENTE,
        rating_before=25,
        rating_after=30,
        rank_before="初段",
        rank_after="二段",
    )

    service.create_game(repository.user_id, payload)

    assert rating_repository.created[0]["rank"] == "二段"


def test_create_game_skips_rating_history_when_rating_after_missing():
    repository = FakeGameRepository()
    rating_repository = FakeRatingRepository()
    service = make_service(repository, rating_repository)
    payload = GameCreate(
        platform_id=1,
        played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
        result=GameResult.WIN,
        side=PlayerSide.SENTE,
    )

    service.create_game(repository.user_id, payload)

    assert rating_repository.created == []


def test_create_game_passes_through_rank_fields():
    repository = FakeGameRepository()
    service = make_service(repository)
    payload = GameCreate(
        platform_id=1,
        played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
        result=GameResult.WIN,
        side=PlayerSide.SENTE,
        rating_before=65,
        rating_after=80,
        rank_before="二段",
        rank_after="三段",
        opponent_rank="初段",
    )

    game = service.create_game(repository.user_id, payload)

    assert game["rank_before"] == "二段"
    assert game["rank_after"] == "三段"
    assert game["opponent_rank"] == "初段"


def test_update_game_passes_through_rank_fields():
    repository = FakeGameRepository()
    service = make_service(repository)

    game = service.update_game(
        repository.user_id,
        repository.game_id,
        GameUpdate(rank_before="5級", opponent_rank="3級"),
    )

    assert game["rank_before"] == "5級"
    assert game["opponent_rank"] == "3級"


def test_update_game_rejects_empty_payload():
    repository = FakeGameRepository()
    service = make_service(repository)

    with pytest.raises(HTTPException) as exc:
        service.update_game(
            repository.user_id,
            repository.game_id,
            GameUpdate(),
        )

    assert exc.value.status_code == 400


def test_get_game_raises_404_for_missing_game():
    repository = FakeGameRepository()
    service = make_service(repository)

    with pytest.raises(HTTPException) as exc:
        service.get_game(repository.user_id, uuid4())

    assert exc.value.status_code == 404


def test_get_kifu_url_returns_none_when_kifu_path_missing():
    repository = FakeGameRepository()
    service = make_service(repository)

    url = service.get_kifu_url(repository.user_id, repository.game_id)

    assert url is None


def test_get_kifu_url_returns_signed_url_when_kifu_path_set():
    repository = FakeGameRepository()
    repository.game["kifu_path"] = "user-123/game-456.kif"
    service = make_service(repository)

    url = service.get_kifu_url(repository.user_id, repository.game_id)

    assert url == repository.signed_url
    assert repository.signed_url_download == "kifu_2026-07-05.kif"


def test_get_kifu_url_raises_404_for_missing_game():
    repository = FakeGameRepository()
    service = make_service(repository)

    with pytest.raises(HTTPException) as exc:
        service.get_kifu_url(repository.user_id, uuid4())

    assert exc.value.status_code == 404


def test_delete_game_raises_404_for_missing_game():
    repository = FakeGameRepository()
    service = make_service(repository)

    with pytest.raises(HTTPException) as exc:
        service.delete_game(repository.user_id, uuid4())

    assert exc.value.status_code == 404


def test_game_create_rejects_percentage_rating_over_100():
    with pytest.raises(pydantic.ValidationError):
        GameCreate(
            platform_id=1,
            played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
            result=GameResult.WIN,
            side=PlayerSide.SENTE,
            rating_after=101,
        )


def test_game_create_rejects_negative_rating():
    with pytest.raises(pydantic.ValidationError):
        GameCreate(
            platform_id=2,
            played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
            result=GameResult.WIN,
            side=PlayerSide.SENTE,
            rating_after=-1,
        )


def test_game_create_rejects_rank_outside_ladder():
    with pytest.raises(pydantic.ValidationError):
        GameCreate(
            platform_id=1,
            played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
            result=GameResult.WIN,
            side=PlayerSide.SENTE,
            rank_after="十段",
        )


def test_game_create_rejects_rank_for_rating_only_platform():
    with pytest.raises(pydantic.ValidationError):
        GameCreate(
            platform_id=2,
            played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
            result=GameResult.WIN,
            side=PlayerSide.SENTE,
            rank_after="初段",
        )


def test_game_create_rejects_memo_over_max_length():
    with pytest.raises(pydantic.ValidationError):
        GameCreate(
            platform_id=1,
            played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
            result=GameResult.WIN,
            side=PlayerSide.SENTE,
            memo="a" * 2001,
        )


def test_create_game_raises_404_for_missing_platform():
    repository = FakeGameRepository()
    service = make_service(repository, platform_repository=FakePlatformRepository())
    payload = GameCreate(
        platform_id=99,
        played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
        result=GameResult.WIN,
        side=PlayerSide.SENTE,
    )

    with pytest.raises(HTTPException) as exc:
        service.create_game(repository.user_id, payload)

    assert exc.value.status_code == 404


def test_create_game_raises_404_for_missing_opening():
    repository = FakeGameRepository()
    service = make_service(repository)
    payload = GameCreate(
        platform_id=1,
        played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
        result=GameResult.WIN,
        side=PlayerSide.SENTE,
        my_opening_id=999,
    )

    with pytest.raises(HTTPException) as exc:
        service.create_game(repository.user_id, payload)

    assert exc.value.status_code == 404


def test_create_game_rejects_kifu_path_outside_own_scope():
    repository = FakeGameRepository()
    service = make_service(repository)
    payload = GameCreate(
        platform_id=1,
        played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
        result=GameResult.WIN,
        side=PlayerSide.SENTE,
        kifu_path="someone-else/game.kif",
    )

    with pytest.raises(HTTPException) as exc:
        service.create_game(repository.user_id, payload)

    assert exc.value.status_code == 400


def test_create_game_accepts_kifu_path_within_own_scope():
    repository = FakeGameRepository()
    service = make_service(repository)
    payload = GameCreate(
        platform_id=1,
        played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
        result=GameResult.WIN,
        side=PlayerSide.SENTE,
        kifu_path=f"{repository.user_id}/game.kif",
    )

    game = service.create_game(repository.user_id, payload)

    assert game["kifu_path"] == f"{repository.user_id}/game.kif"


def test_update_game_rejects_rating_out_of_range_when_merged_with_existing_platform():
    repository = FakeGameRepository()
    service = make_service(repository)

    with pytest.raises(HTTPException) as exc:
        service.update_game(
            repository.user_id,
            repository.game_id,
            GameUpdate(rating_after=150),
        )

    assert exc.value.status_code == 400


def test_update_game_raises_404_for_missing_platform():
    repository = FakeGameRepository()
    service = make_service(repository)

    with pytest.raises(HTTPException) as exc:
        service.update_game(
            repository.user_id,
            repository.game_id,
            GameUpdate(platform_id=99),
        )

    assert exc.value.status_code == 404


def test_update_game_rejects_kifu_path_outside_own_scope():
    repository = FakeGameRepository()
    service = make_service(repository)

    with pytest.raises(HTTPException) as exc:
        service.update_game(
            repository.user_id,
            repository.game_id,
            GameUpdate(kifu_path="someone-else/game.kif"),
        )

    assert exc.value.status_code == 400


def test_upload_kifu_stores_content_under_user_scoped_path():
    repository = FakeGameRepository()
    service = make_service(repository)

    path = service.upload_kifu(repository.user_id, "開始日時：2026/07/05 10:00:00")

    assert path.startswith(f"{repository.user_id}/")
    assert path.endswith(".kif")
    assert repository.uploaded_kifu == (path, "開始日時：2026/07/05 10:00:00")


def test_upload_kifu_raises_502_on_storage_failure():
    repository = FakeGameRepository()
    repository.raise_on_upload = True
    service = make_service(repository)

    with pytest.raises(HTTPException) as exc:
        service.upload_kifu(repository.user_id, "test")

    assert exc.value.status_code == 502
