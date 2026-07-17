from uuid import UUID

from supabase import Client

from app.repositories.base import SupabaseRepository


class OpeningRepository(SupabaseRepository):
    """
    Repository for the openings table.
    """

    table_name = "openings"

    def __init__(self, client: Client | None = None) -> None:
        super().__init__(client=client)

    def list_all(self) -> list[dict]:
        response = (
            self.table(self.table_name)
            .select("*")
            .order("id")
            .execute()
        )

        return response.data or []

    def get_by_id(self, opening_id: int) -> dict | None:
        response = (
            self.table(self.table_name)
            .select("*")
            .eq("id", opening_id)
            .maybe_single()
            .execute()
        )

        # maybe_single().execute() は該当行が無い場合、data=None のレスポンスではなく
        # None そのものを返す(postgrest-py の仕様)。
        return response.data if response is not None else None

    def list_favorite_ids(self, user_id: UUID) -> list[int]:
        response = (
            self.table("favorite_openings")
            .select("opening_id")
            .eq("user_id", str(user_id))
            .execute()
        )

        return [row["opening_id"] for row in response.data or []]

    def favorite_exists(self, user_id: UUID, opening_id: int) -> bool:
        response = (
            self.table("favorite_openings")
            .select("opening_id")
            .eq("user_id", str(user_id))
            .eq("opening_id", opening_id)
            .maybe_single()
            .execute()
        )

        return response is not None

    def create_favorite(self, user_id: UUID, opening_id: int) -> None:
        (
            self.table("favorite_openings")
            .insert({"user_id": str(user_id), "opening_id": opening_id})
            .execute()
        )

    def delete_favorite(self, user_id: UUID, opening_id: int) -> bool:
        response = (
            self.table("favorite_openings")
            .delete()
            .eq("user_id", str(user_id))
            .eq("opening_id", opening_id)
            .execute()
        )

        return bool(response.data)
