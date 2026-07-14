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

        return response.data
