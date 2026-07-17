from supabase import Client

from app.repositories.base import SupabaseRepository


class PlatformRepository(SupabaseRepository):
    """
    Repository for the platforms table (read-only master data).
    """

    table_name = "platforms"

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

    def get_by_id(self, platform_id: int) -> dict | None:
        response = (
            self.table(self.table_name)
            .select("*")
            .eq("id", platform_id)
            .maybe_single()
            .execute()
        )

        return response.data if response is not None else None
