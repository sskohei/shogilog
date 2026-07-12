import importlib
from types import SimpleNamespace

import pytest


class DummySupabaseClient:
    def table(self, table_name: str) -> dict[str, str]:
        return {"table": table_name}


def test_initialize_supabase_accepts_client_double():
    supabase_module = importlib.import_module("app.db.supabase")
    supabase_module.reset_supabase()

    client = DummySupabaseClient()

    assert supabase_module.initialize_supabase(client) is client
    assert supabase_module.get_supabase() is client

    supabase_module.reset_supabase()


def test_repository_uses_injected_client():
    repository_module = importlib.import_module("app.repositories.base")
    client = DummySupabaseClient()

    repository = repository_module.SupabaseRepository(client=client)

    assert repository.client is client
    assert repository.table("profiles") == {"table": "profiles"}


def test_get_supabase_requires_configuration(monkeypatch):
    supabase_module = importlib.import_module("app.db.supabase")

    monkeypatch.setattr(
        supabase_module,
        "get_settings",
        lambda: SimpleNamespace(
            supabase_url=None,
            supabase_service_role_key=None,
        ),
    )
    supabase_module.reset_supabase()

    with pytest.raises(RuntimeError, match="Supabase settings"):
        supabase_module.get_supabase()

    supabase_module.reset_supabase()
