from uuid import UUID

from supabase import Client

from app.repositories.base import SupabaseRepository


class ProfileRepository(SupabaseRepository):
    """
    Repository for the profiles table.
    """

    table_name = "profiles"

    def __init__(self, client: Client | None = None) -> None:
        super().__init__(client=client)

    def get_by_id(self, user_id: UUID) -> dict | None:
        response = (
            self.table(self.table_name)
            .select("*")
            .eq("id", str(user_id))
            .maybe_single()
            .execute()
        )

        # maybe_single().execute() は該当行が無い場合、data=None のレスポンスではなく
        # None そのものを返す(postgrest-py の仕様)。
        return response.data if response is not None else None

    def update(self, user_id: UUID, data: dict) -> dict | None:
        response = (
            self.table(self.table_name)
            .update(data)
            .eq("id", str(user_id))
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]
