from uuid import UUID

from supabase import Client

from app.repositories.base import SupabaseRepository


class RatingRepository(SupabaseRepository):
    """
    Repository for the ratings table.
    """

    table_name = "ratings"

    def __init__(self, client: Client | None = None) -> None:
        super().__init__(client=client)

    def list_by_user(self, user_id: UUID) -> list[dict]:
        response = (
            self.table(self.table_name)
            .select("*")
            .eq("user_id", str(user_id))
            .order("recorded_at", desc=False)
            .execute()
        )

        return response.data or []

    def create(self, user_id: UUID, data: dict) -> dict:
        response = (
            self.table(self.table_name)
            .insert({**data, "user_id": str(user_id)})
            .execute()
        )

        return response.data[0]

    def game_exists_for_user(self, user_id: UUID, game_id: UUID) -> bool:
        response = (
            self.table("games")
            .select("id")
            .eq("id", str(game_id))
            .eq("user_id", str(user_id))
            .maybe_single()
            .execute()
        )

        return response.data is not None
