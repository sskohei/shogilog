from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_DIR = BACKEND_DIR.parent


class Settings(BaseSettings):
    """
    Application Settings
    """

    model_config = SettingsConfigDict(
        env_file=(
            PROJECT_DIR / ".env",
            BACKEND_DIR / ".env",
        ),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Project
    project_name: str = "ShogiLog"
    api_version: str = "1.0.0"

    # Supabase
    supabase_url: str | None = Field(default=None, alias="SUPABASE_URL")
    supabase_anon_key: str | None = Field(
        default=None,
        alias="SUPABASE_ANON_KEY",
    )
    supabase_service_role_key: str | None = Field(
        default=None,
        alias="SUPABASE_SERVICE_ROLE_KEY",
    )
    jwt_secret: str | None = Field(default=None, alias="SUPABASE_JWT_SECRET")


@lru_cache
def get_settings() -> Settings:
    """
    Return cached application settings.
    """
    return Settings()
