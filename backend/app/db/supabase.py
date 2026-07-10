from supabase import Client, create_client

from app.core.config import get_settings


_supabase: Client | None = None


def initialize_supabase(client: Client | None = None) -> Client:
    """
    Initialize and return the Supabase client.

    This function should be called once during application startup.
    Tests may pass a client double to avoid network access.
    """
    global _supabase

    if client is not None:
        _supabase = client

    if _supabase is None:
        settings = get_settings()

        if (
            settings.supabase_url is None
            or settings.supabase_service_role_key is None
        ):
            raise RuntimeError(
                "Supabase settings are not configured. "
                "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
            )

        _supabase = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )

    return _supabase


def get_supabase() -> Client:
    """
    Return the initialized Supabase client.
    """
    if _supabase is None:
        return initialize_supabase()

    return _supabase


def reset_supabase() -> None:
    """
    Reset the cached Supabase client.

    This is primarily useful in tests.
    """
    global _supabase

    _supabase = None
