from uuid import UUID, uuid4

import pytest
from fastapi import HTTPException

from app.schemas.profile import PlatformRatingUpsert, ProfileUpdate
from app.services.profile import ProfileService


class FakeProfileRepository:
    def __init__(self) -> None:
        self.user_id = uuid4()
        self.profiles = {
            self.user_id: {
                "id": str(self.user_id),
                "display_name": "しょうぎたろう",
                "bio": None,
                "avatar_url": None,
                "created_at": "2026-07-05T10:00:00+00:00",
                "updated_at": "2026-07-05T10:00:00+00:00",
            }
        }

    def get_by_id(self, user_id: UUID) -> dict | None:
        return self.profiles.get(user_id)

    def update(self, user_id: UUID, data: dict) -> dict | None:
        profile = self.profiles.get(user_id)

        if profile is None:
            return None

        profile.update(data)
        return profile


class FakePlatformRepository:
    def __init__(self) -> None:
        self.platforms = {
            1: {"id": 1, "name": "将棋ウォーズ"},
            2: {"id": 2, "name": "将棋クエスト"},
        }

    def list_all(self) -> list[dict]:
        return list(self.platforms.values())

    def get_by_id(self, platform_id: int) -> dict | None:
        return self.platforms.get(platform_id)


class FakePlatformRatingRepository:
    def __init__(self) -> None:
        self.rows: dict[tuple[UUID, int], dict] = {}

    def list_by_user(self, user_id: UUID) -> list[dict]:
        return [
            row for (uid, _), row in self.rows.items() if uid == user_id
        ]

    def upsert(self, user_id: UUID, platform_id: int, data: dict) -> dict:
        row = {**data, "platform_id": platform_id}
        self.rows[(user_id, platform_id)] = row
        return row


def make_service(
    profile_repository: FakeProfileRepository,
    platform_rating_repository: FakePlatformRatingRepository,
    platform_repository: FakePlatformRepository,
) -> ProfileService:
    return ProfileService(
        profile_repository=profile_repository,
        platform_rating_repository=platform_rating_repository,
        platform_repository=platform_repository,
    )


def test_get_profile_returns_profile():
    profile_repository = FakeProfileRepository()
    service = make_service(
        profile_repository, FakePlatformRatingRepository(), FakePlatformRepository()
    )

    profile = service.get_profile(profile_repository.user_id)

    assert profile["display_name"] == "しょうぎたろう"


def test_get_profile_raises_404_for_missing_profile():
    profile_repository = FakeProfileRepository()
    service = make_service(
        profile_repository, FakePlatformRatingRepository(), FakePlatformRepository()
    )

    with pytest.raises(HTTPException) as exc:
        service.get_profile(uuid4())

    assert exc.value.status_code == 404


def test_update_profile_updates_fields():
    profile_repository = FakeProfileRepository()
    service = make_service(
        profile_repository, FakePlatformRatingRepository(), FakePlatformRepository()
    )

    updated = service.update_profile(
        profile_repository.user_id,
        ProfileUpdate(display_name="新しい名前", bio="四間飛車党です"),
    )

    assert updated["display_name"] == "新しい名前"
    assert updated["bio"] == "四間飛車党です"


def test_update_profile_raises_400_for_empty_payload():
    profile_repository = FakeProfileRepository()
    service = make_service(
        profile_repository, FakePlatformRatingRepository(), FakePlatformRepository()
    )

    with pytest.raises(HTTPException) as exc:
        service.update_profile(profile_repository.user_id, ProfileUpdate())

    assert exc.value.status_code == 400


def test_update_profile_raises_404_for_missing_profile():
    profile_repository = FakeProfileRepository()
    service = make_service(
        profile_repository, FakePlatformRatingRepository(), FakePlatformRepository()
    )

    with pytest.raises(HTTPException) as exc:
        service.update_profile(uuid4(), ProfileUpdate(display_name="X"))

    assert exc.value.status_code == 404


def test_list_platform_ratings_defaults_unplayed_platforms():
    profile_repository = FakeProfileRepository()
    platform_rating_repository = FakePlatformRatingRepository()
    platform_repository = FakePlatformRepository()
    service = make_service(
        profile_repository, platform_rating_repository, platform_repository
    )

    ratings = service.list_platform_ratings(profile_repository.user_id)

    assert len(ratings) == 2
    assert all(r["has_played"] is False for r in ratings)
    assert all(r["rating"] is None and r["rank"] is None for r in ratings)


def test_list_platform_ratings_merges_saved_rows():
    profile_repository = FakeProfileRepository()
    platform_rating_repository = FakePlatformRatingRepository()
    platform_repository = FakePlatformRepository()
    service = make_service(
        profile_repository, platform_rating_repository, platform_repository
    )

    service.upsert_platform_rating(
        profile_repository.user_id,
        1,
        PlatformRatingUpsert(has_played=True, rating=1500),
    )

    ratings = service.list_platform_ratings(profile_repository.user_id)
    platform_1 = next(r for r in ratings if r["platform_id"] == 1)
    platform_2 = next(r for r in ratings if r["platform_id"] == 2)

    assert platform_1["has_played"] is True
    assert platform_1["rating"] == 1500
    assert platform_2["has_played"] is False


def test_upsert_platform_rating_raises_404_for_missing_platform():
    profile_repository = FakeProfileRepository()
    service = make_service(
        profile_repository, FakePlatformRatingRepository(), FakePlatformRepository()
    )

    with pytest.raises(HTTPException) as exc:
        service.upsert_platform_rating(
            profile_repository.user_id,
            999,
            PlatformRatingUpsert(has_played=True, rating=1500),
        )

    assert exc.value.status_code == 404


def test_upsert_platform_rating_nulls_values_when_not_played():
    profile_repository = FakeProfileRepository()
    service = make_service(
        profile_repository, FakePlatformRatingRepository(), FakePlatformRepository()
    )

    result = service.upsert_platform_rating(
        profile_repository.user_id,
        1,
        PlatformRatingUpsert(has_played=False, rating=1500, rank="初段"),
    )

    assert result["rating"] is None
    assert result["rank"] is None
