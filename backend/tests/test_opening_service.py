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

    def list_all(self) -> list[dict]:
        return list(self.openings.values())

    def get_by_id(self, opening_id: int) -> dict | None:
        return self.openings.get(opening_id)


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
