from supabase import Client

from app.db.supabase import get_supabase


class SupabaseRepository:
    """
    Base class for repositories that access Supabase.
    """

    def __init__(self, client: Client | None = None) -> None:
        self.client = client or get_supabase()

    def table(self, table_name: str):
        """
        Return a Supabase table query builder.
        """
        return self.client.table(table_name)
