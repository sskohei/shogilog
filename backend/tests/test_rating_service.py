from uuid import UUID, uuid4

import pydantic
import pytest
from fastapi import HTTPException

from app.schemas.rating import RatingCreate
from app.services.ratings import RatingService


class FakeRatingRepository:
    def __init__(self) -> None:
        self.user_id = uuid4()
        self.game_id = uuid4()
        self.user_games = {self.game_id}
        self.ratings: list[dict] = [
            {
                "id": str(uuid4()),
                "user_id": str(self.user_id),
                "platform_id": 1,
                "game_id": None,
                "rating": 1200,
                "recorded_at": "2026-07-05T10:00:00+00:00",
                "created_at": "2026-07-05T10:00:00+00:00",
            }
        ]

    def list_by_user(self, user_id: UUID) -> list[dict]:
        return [
            rating
            for rating in self.ratings
            if rating["user_id"] == str(user_id)
        ]

    def create(self, user_id: UUID, data: dict) -> dict:
        rating = {
            "id": str(uuid4()),
            "user_id": str(user_id),
            **data,
            "recorded_at": "2026-07-05T10:10:00+00:00",
            "created_at": "2026-07-05T10:10:00+00:00",
        }
        self.ratings.append(rating)
        return rating

    def game_exists_for_user(self, user_id: UUID, game_id: UUID) -> bool:
        return user_id == self.user_id and game_id in self.user_games


class FakePlatformRepository:
    def __init__(self) -> None:
        self.platforms = {
            1: {"id": 1, "name": "将棋ウォーズ"},
            2: {"id": 2, "name": "将棋クエスト"},
        }

    def get_by_id(self, platform_id: int) -> dict | None:
        return self.platforms.get(platform_id)


def make_service(
    repository: FakeRatingRepository,
    platform_repository: FakePlatformRepository | None = None,
) -> RatingService:
    return RatingService(
        repository=repository,
        platform_repository=platform_repository or FakePlatformRepository(),
    )


def test_list_ratings_returns_user_scoped_ratings():
    repository = FakeRatingRepository()
    service = make_service(repository)

    ratings = service.list_ratings(repository.user_id)

    assert len(ratings) == 1
    assert ratings[0]["user_id"] == str(repository.user_id)


def test_create_rating_adds_user_scoped_payload():
    repository = FakeRatingRepository()
    service = make_service(repository)

    rating = service.create_rating(
        repository.user_id,
        RatingCreate(platform_id=2, rating=1250),
    )

    assert rating["user_id"] == str(repository.user_id)
    assert rating["platform_id"] == 2
    assert rating["rating"] == 1250


def test_create_rating_raises_404_for_missing_game():
    repository = FakeRatingRepository()
    service = make_service(repository)

    with pytest.raises(HTTPException) as exc:
        service.create_rating(
            repository.user_id,
            RatingCreate(platform_id=2, rating=1250, game_id=uuid4()),
        )

    assert exc.value.status_code == 404


def test_create_rating_accepts_own_game():
    repository = FakeRatingRepository()
    service = make_service(repository)

    rating = service.create_rating(
        repository.user_id,
        RatingCreate(platform_id=2, rating=1250, game_id=repository.game_id),
    )

    assert rating["game_id"] == str(repository.game_id)


def test_create_rating_raises_404_for_missing_platform():
    repository = FakeRatingRepository()
    service = make_service(repository)

    with pytest.raises(HTTPException) as exc:
        service.create_rating(
            repository.user_id,
            RatingCreate(platform_id=99, rating=10),
        )

    assert exc.value.status_code == 404


def test_rating_create_rejects_percentage_rating_over_100():
    with pytest.raises(pydantic.ValidationError):
        RatingCreate(platform_id=1, rating=101)


def test_rating_create_rejects_negative_rating():
    with pytest.raises(pydantic.ValidationError):
        RatingCreate(platform_id=2, rating=-1)


def test_rating_create_rejects_rank_for_rating_only_platform():
    with pytest.raises(pydantic.ValidationError):
        RatingCreate(platform_id=2, rating=1500, rank="初段")
