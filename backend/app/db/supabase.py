from supabase import Client, create_client

from app.core.config import settings


_supabase: Client | None = None


def initialize_supabase() -> None:
    """
    Initialize the Supabase client.

    This function should be called once during application startup.
    """
    global _supabase

    if _supabase is None:
        _supabase = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )


def get_supabase() -> Client:
    """
    Return the initialized Supabase client.
    """
    if _supabase is None:
        raise RuntimeError(
            "Supabase client has not been initialized."
        )

    return _supabase