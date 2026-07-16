from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.services.openings import OpeningService


class FakeOpeningRepository:
    def __init__(self) -> None:
        self.opening_id = 1
        self.openings = {
            self.opening_id: {
                "id": self.opening_id,
                "name": "四間飛車",
                "slug": "shikenbisha",
                "category": "ranging_rook",
                "description": "代表的な振り飛車",
                "is_active": True,
                "created_at": "2026-07-06T04:16:25+00:00",
            }
        }
        self.user_id = uuid4()
        self.favorites: set[tuple] = set()

    def list_all(self) -> list[dict]:
        return list(self.openings.values())

    def get_by_id(self, opening_id: int) -> dict | None:
        return self.openings.get(opening_id)

    def list_favorite_ids(self, user_id) -> list[int]:
        return [
            opening_id
            for (uid, opening_id) in self.favorites
            if uid == user_id
        ]

    def favorite_exists(self, user_id, opening_id: int) -> bool:
        return (user_id, opening_id) in self.favorites

    def create_favorite(self, user_id, opening_id: int) -> None:
        self.favorites.add((user_id, opening_id))

    def delete_favorite(self, user_id, opening_id: int) -> bool:
        if (user_id, opening_id) not in self.favorites:
            return False

        self.favorites.discard((user_id, opening_id))
        return True


def test_list_openings_returns_all_openings():
    repository = FakeOpeningRepository()
    service = OpeningService(repository=repository)

    openings = service.list_openings()

    assert len(openings) == 1
    assert openings[0]["id"] == repository.opening_id


def test_get_opening_returns_opening():
    repository = FakeOpeningRepository()
    service = OpeningService(repository=repository)

    opening = service.get_opening(repository.opening_id)

    assert opening["name"] == "四間飛車"


def test_get_opening_raises_404_for_missing_opening():
    repository = FakeOpeningRepository()
    service = OpeningService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.get_opening(999)

    assert exc.value.status_code == 404


def test_list_favorite_ids_returns_users_favorites():
    repository = FakeOpeningRepository()
    repository.favorites.add((repository.user_id, repository.opening_id))
    service = OpeningService(repository=repository)

    ids = service.list_favorite_ids(repository.user_id)

    assert ids == [repository.opening_id]


def test_add_favorite_creates_favorite():
    repository = FakeOpeningRepository()
    service = OpeningService(repository=repository)

    service.add_favorite(repository.user_id, repository.opening_id)

    assert repository.favorite_exists(repository.user_id, repository.opening_id)


def test_add_favorite_raises_404_for_missing_opening():
    repository = FakeOpeningRepository()
    service = OpeningService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.add_favorite(repository.user_id, 999)

    assert exc.value.status_code == 404


def test_add_favorite_raises_409_when_already_favorited():
    repository = FakeOpeningRepository()
    service = OpeningService(repository=repository)
    service.add_favorite(repository.user_id, repository.opening_id)

    with pytest.raises(HTTPException) as exc:
        service.add_favorite(repository.user_id, repository.opening_id)

    assert exc.value.status_code == 409


def test_remove_favorite_deletes_favorite():
    repository = FakeOpeningRepository()
    service = OpeningService(repository=repository)
    service.add_favorite(repository.user_id, repository.opening_id)

    service.remove_favorite(repository.user_id, repository.opening_id)

    assert not repository.favorite_exists(repository.user_id, repository.opening_id)


def test_remove_favorite_raises_404_for_missing_opening():
    repository = FakeOpeningRepository()
    service = OpeningService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.remove_favorite(repository.user_id, 999)

    assert exc.value.status_code == 404


def test_remove_favorite_raises_404_when_not_favorited():
    repository = FakeOpeningRepository()
    service = OpeningService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.remove_favorite(repository.user_id, repository.opening_id)

    assert exc.value.status_code == 404
