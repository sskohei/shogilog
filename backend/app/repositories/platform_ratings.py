from uuid import UUID

from supabase import Client

from app.repositories.base import SupabaseRepository


class PlatformRatingRepository(SupabaseRepository):
    """
    Repository for the profile_platform_ratings table.
    """

    table_name = "profile_platform_ratings"

    def __init__(self, client: Client | None = None) -> None:
        super().__init__(client=client)

    def list_by_user(self, user_id: UUID) -> list[dict]:
        response = (
            self.table(self.table_name)
            .select("*")
            .eq("user_id", str(user_id))
            .execute()
        )

        return response.data or []

    def upsert(self, user_id: UUID, platform_id: int, data: dict) -> dict:
        response = (
            self.table(self.table_name)
            .upsert(
                {**data, "user_id": str(user_id), "platform_id": platform_id},
                on_conflict="user_id,platform_id",
            )
            .execute()
        )

        return response.data[0]
