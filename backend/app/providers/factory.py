"""Factory helpers to assemble a production ProviderRouter from Settings."""

from __future__ import annotations

from app.config import Settings, get_settings
from app.providers.gemini import GeminiProvider
from app.providers.groq import GroqProvider
from app.providers.router import ProviderCandidate, ProviderRouter
from app.services.redis import get_redis_client

DEFAULT_GEMINI_RPM = 15
DEFAULT_GROQ_RPM = 30


def build_provider_router(settings: Settings | None = None) -> ProviderRouter:
    """Construct router with Gemini primary and Groq secondary when keys are configured."""
    cfg = settings or get_settings()
    redis = get_redis_client()
    candidates: list[ProviderCandidate] = []

    if cfg.gemini_api_key:
        candidates.append(
            ProviderCandidate(
                name="gemini",
                key_id="primary",
                provider=GeminiProvider(cfg.gemini_api_key),
                limit_per_minute=cfg.gemini_rpm_limit,
            )
        )
    if cfg.groq_api_key:
        candidates.append(
            ProviderCandidate(
                name="groq",
                key_id="primary",
                provider=GroqProvider(cfg.groq_api_key),
                limit_per_minute=cfg.groq_rpm_limit,
            )
        )

    if not candidates:
        raise RuntimeError("At least one LLM API key (GEMINI_API_KEY or GROQ_API_KEY) is required")

    return ProviderRouter(candidates=candidates, redis=redis)
