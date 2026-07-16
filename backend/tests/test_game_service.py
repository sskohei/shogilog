from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest
from fastapi import HTTPException

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
            "rating_before": 1200,
            "rating_after": 1210,
            "opponent_name": "player123",
            "opponent_rating": 1190,
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

    def create_signed_kifu_url(self, path: str, expires_in: int = 300):
        return self.signed_url


def make_create_payload() -> GameCreate:
    return GameCreate(
        platform_id=1,
        played_at=datetime(2026, 7, 5, 10, 0, tzinfo=UTC),
        result=GameResult.WIN,
        side=PlayerSide.SENTE,
        rating_before=1200,
        rating_after=1210,
        opponent_name="player123",
        opponent_rating=1190,
        memo="test",
    )


def test_list_games_returns_pagination():
    repository = FakeGameRepository()
    service = GameService(repository=repository)

    games, pagination = service.list_games(
        repository.user_id,
        GameListFilters(),
    )

    assert len(games) == 1
    assert pagination.total == 1
    assert pagination.total_pages == 1


def test_create_game_adds_user_scoped_payload():
    repository = FakeGameRepository()
    service = GameService(repository=repository)

    game = service.create_game(repository.user_id, make_create_payload())

    assert game["user_id"] == str(repository.user_id)
    assert game["platform_id"] == 1
    assert game["result"] == "win"


def test_create_game_passes_through_rank_fields():
    repository = FakeGameRepository()
    service = GameService(repository=repository)
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
    service = GameService(repository=repository)

    game = service.update_game(
        repository.user_id,
        repository.game_id,
        GameUpdate(rank_before="五級", opponent_rank="三級"),
    )

    assert game["rank_before"] == "五級"
    assert game["opponent_rank"] == "三級"


def test_update_game_rejects_empty_payload():
    repository = FakeGameRepository()
    service = GameService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.update_game(
            repository.user_id,
            repository.game_id,
            GameUpdate(),
        )

    assert exc.value.status_code == 400


def test_get_game_raises_404_for_missing_game():
    repository = FakeGameRepository()
    service = GameService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.get_game(repository.user_id, uuid4())

    assert exc.value.status_code == 404


def test_get_kifu_url_returns_none_when_kifu_path_missing():
    repository = FakeGameRepository()
    service = GameService(repository=repository)

    url = service.get_kifu_url(repository.user_id, repository.game_id)

    assert url is None


def test_get_kifu_url_returns_signed_url_when_kifu_path_set():
    repository = FakeGameRepository()
    repository.game["kifu_path"] = "user-123/game-456.kif"
    service = GameService(repository=repository)

    url = service.get_kifu_url(repository.user_id, repository.game_id)

    assert url == repository.signed_url


def test_get_kifu_url_raises_404_for_missing_game():
    repository = FakeGameRepository()
    service = GameService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.get_kifu_url(repository.user_id, uuid4())

    assert exc.value.status_code == 404


def test_delete_game_raises_404_for_missing_game():
    repository = FakeGameRepository()
    service = GameService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.delete_game(repository.user_id, uuid4())

    assert exc.value.status_code == 404
