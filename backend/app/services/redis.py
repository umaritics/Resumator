"""Upstash Redis HTTP client wrapper for cache, rate limits, and job status."""

from __future__ import annotations

from functools import lru_cache

from upstash_redis import Redis

from app.config import Settings, get_settings


@lru_cache
def get_redis_client(settings: Settings | None = None) -> Redis:
    """Return a process-singleton Upstash Redis client.

    Side effects: none on import — connection is lazy HTTP. Callers in Phase 3+
    perform GET/SET with documented key prefixes (see docs/phase-2 ledger).

    Raises at runtime if Upstash env vars are missing (Settings validation).
    """
    cfg = settings or get_settings()
    return Redis(url=cfg.upstash_redis_rest_url, token=cfg.upstash_redis_rest_token)
