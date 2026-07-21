"""Application configuration loaded from environment variables."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_REPO_ROOT = _BACKEND_DIR.parent


class Settings(BaseSettings):
    """Runtime settings for FastAPI, Supabase JWT verification, and Upstash Redis.

    Uses pydantic-settings so host env injection (HF Spaces, Render, Azure, local) is
    validated at startup.
    Local dev loads ``backend/.env*`` and repo-root ``.env*`` (shared with Next.js).
    """

    model_config = SettingsConfigDict(
        env_file=(
            _BACKEND_DIR / ".env",
            _BACKEND_DIR / ".env.local",
            _REPO_ROOT / ".env",
            _REPO_ROOT / ".env.local",
        ),
        extra="ignore",
    )

    supabase_url: str = Field(
        ...,
        validation_alias=AliasChoices(
            "supabase_url",
            "SUPABASE_URL",
            "NEXT_PUBLIC_SUPABASE_URL",
        ),
        description="Supabase project URL, e.g. https://<ref>.supabase.co",
    )
    supabase_jwt_secret: str | None = Field(
        default=None,
        description="Optional HS256 secret for local/pytest tokens only — not used in production JWKS mode",
    )
    upstash_redis_rest_url: str = Field(..., description="Upstash Redis REST endpoint")
    upstash_redis_rest_token: str = Field(..., description="Upstash Redis REST token")
    gemini_api_key: str | None = Field(default=None, description="Google Gemini API key")
    groq_api_key: str | None = Field(default=None, description="Groq API key")
    gemini_rpm_limit: int = Field(default=15, description="Gemini requests per minute per key")
    groq_rpm_limit: int = Field(default=30, description="Groq requests per minute per key")
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
