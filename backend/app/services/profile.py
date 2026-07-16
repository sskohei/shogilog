from uuid import UUID

from fastapi import HTTPException, status

from app.repositories.platform_ratings import PlatformRatingRepository
from app.repositories.platforms import PlatformRepository
from app.repositories.profile import ProfileRepository
from app.schemas.profile import ProfileUpdate, PlatformRatingUpsert


class ProfileService:
    def __init__(
        self,
        profile_repository: ProfileRepository | None = None,
        platform_rating_repository: PlatformRatingRepository | None = None,
        platform_repository: PlatformRepository | None = None,
    ) -> None:
        self.profile_repository = profile_repository or ProfileRepository()
        self.platform_rating_repository = (
            platform_rating_repository or PlatformRatingRepository()
        )
        self.platform_repository = platform_repository or PlatformRepository()

    def get_profile(self, user_id: UUID) -> dict:
        profile = self.profile_repository.get_by_id(user_id)

        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found.",
            )

        return profile

    def update_profile(self, user_id: UUID, payload: ProfileUpdate) -> dict:
        data = payload.model_dump(exclude_unset=True, mode="json")

        if not data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields were provided for update.",
            )

        updated = self.profile_repository.update(user_id, data)

        if updated is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found.",
            )

        return updated

    def list_platform_ratings(self, user_id: UUID) -> list[dict]:
        platforms = self.platform_repository.list_all()
        saved = {
            row["platform_id"]: row
            for row in self.platform_rating_repository.list_by_user(user_id)
        }

        return [
            saved.get(platform["id"])
            or {
                "platform_id": platform["id"],
                "has_played": False,
                "rating": None,
                "rank": None,
                "updated_at": None,
            }
            for platform in platforms
        ]

    def upsert_platform_rating(
        self,
        user_id: UUID,
        platform_id: int,
        payload: PlatformRatingUpsert,
    ) -> dict:
        if self.platform_repository.get_by_id(platform_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Platform not found.",
            )

        data = payload.model_dump(mode="json")

        if not data["has_played"]:
            data["rating"] = None
            data["rank"] = None

        return self.platform_rating_repository.upsert(user_id, platform_id, data)
