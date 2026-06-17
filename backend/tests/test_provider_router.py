"""ProviderRouter failover and Redis rate-limit behavior."""

from __future__ import annotations

from unittest.mock import patch

import pytest

from app.providers.exceptions import AllProvidersExhaustedError, ProviderRateLimitError
from app.providers.fake import FakeLLMProvider
from app.providers.router import ProviderCandidate, ProviderRouter
from tests.fakes.redis import FakeRedis


@pytest.fixture
def fake_redis() -> FakeRedis:
    return FakeRedis()


@pytest.mark.asyncio
async def test_router_fails_over_on_429(fake_redis: FakeRedis) -> None:
    """Primary provider 429 must trigger cooldown and succeed on secondary."""
    gemini = FakeLLMProvider([ProviderRateLimitError("gemini quota")], name="gemini")
    groq = FakeLLMProvider(["groq-success"], name="groq")
    router = ProviderRouter(
        candidates=[
            ProviderCandidate("gemini", "key1", gemini, limit_per_minute=60),
            ProviderCandidate("groq", "key1", groq, limit_per_minute=60),
        ],
        redis=fake_redis,
    )

    text, provider_name = await router.generate("prompt")

    assert text == "groq-success"
    assert provider_name == "groq"
    assert gemini.call_count == 1
    assert groq.call_count == 1
    assert fake_redis.get("provider_cooldown:gemini:key1") == "1"


@pytest.mark.asyncio
async def test_router_raises_when_all_providers_exhausted(fake_redis: FakeRedis) -> None:
    gemini = FakeLLMProvider([ProviderRateLimitError()], name="gemini")
    groq = FakeLLMProvider([ProviderRateLimitError()], name="groq")
    router = ProviderRouter(
        candidates=[
            ProviderCandidate("gemini", "key1", gemini, limit_per_minute=60),
            ProviderCandidate("groq", "key1", groq, limit_per_minute=60),
        ],
        redis=fake_redis,
    )

    with pytest.raises(AllProvidersExhaustedError):
        await router.generate("prompt")

    assert fake_redis.get("provider_cooldown:gemini:key1") == "1"
    assert fake_redis.get("provider_cooldown:groq:key1") == "1"


@pytest.mark.asyncio
async def test_router_skips_provider_in_cooldown(fake_redis: FakeRedis) -> None:
    fake_redis.set("provider_cooldown:gemini:key1", "1")
    gemini = FakeLLMProvider(["should-not-run"], name="gemini")
    groq = FakeLLMProvider(["fallback"], name="groq")
    router = ProviderRouter(
        candidates=[
            ProviderCandidate("gemini", "key1", gemini, limit_per_minute=60),
            ProviderCandidate("groq", "key1", groq, limit_per_minute=60),
        ],
        redis=fake_redis,
    )

    text, provider_name = await router.generate("prompt")

    assert text == "fallback"
    assert provider_name == "groq"
    assert gemini.call_count == 0


@pytest.mark.asyncio
async def test_router_skips_provider_at_sliding_window_limit(fake_redis: FakeRedis) -> None:
    frozen_ts = 1_700_000_000.0
    minute_bucket = int(frozen_ts) // 60
    fake_redis.set(f"provider_usage:gemini:key1:{minute_bucket}", "60")

    gemini = FakeLLMProvider(["should-not-run"], name="gemini")
    groq = FakeLLMProvider(["under-limit"], name="groq")

    router = ProviderRouter(
        candidates=[
            ProviderCandidate("gemini", "key1", gemini, limit_per_minute=60),
            ProviderCandidate("groq", "key1", groq, limit_per_minute=60),
        ],
        redis=fake_redis,
    )

    with patch("app.providers.router.time.time", return_value=frozen_ts):
        text, provider_name = await router.generate("prompt")

    assert text == "under-limit"
    assert provider_name == "groq"
    assert gemini.call_count == 0


@pytest.mark.asyncio
async def test_fake_llm_provider_returns_canned_response() -> None:
    provider = FakeLLMProvider(['{"ok": true}'])
    result = await provider.generate("any")
    assert result == '{"ok": true}'
    assert provider.call_count == 1
