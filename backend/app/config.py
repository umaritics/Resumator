"""Application configuration loaded from environment variables."""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings for FastAPI, Supabase JWT verification, and Upstash Redis.

    Uses pydantic-settings so Cloud Run/Vercel env injection is validated at startup.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = Field(
        ...,
        description="Supabase project URL, e.g. https://<ref>.supabase.co",
    )
    supabase_jwt_secret: str | None = Field(
        default=None,
        description="Optional HS256 secret for local/pytest tokens only — not used in production JWKS mode",
    )
    upstash_redis_rest_url: str = Field(..., description="Upstash Redis REST endpoint")
    upstash_redis_rest_token: str = Field(..., description="Upstash Redis REST token")
    cors_origins: str = Field(
        default="http://localhost:3000",
        description="Comma-separated browser origins allowed by CORS middleware",
    )

    @property
    def jwks_url(self) -> str:
        return f"{self.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton — safe to inject via FastAPI Depends."""
    return Settings()
