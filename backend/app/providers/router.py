"""Multi-provider LLM router with Redis sliding-window limits and 429 failover."""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

from app.providers.base import LLMProvider
from app.providers.exceptions import (
    AllProvidersExhaustedError,
    ProviderError,
    ProviderRateLimitError,
    ProviderTimeoutError,
)

COOLDOWN_SECONDS = 60
USAGE_TTL_SECONDS = 60


@dataclass(frozen=True)
class ProviderCandidate:
    """One routable API key slot with an independent per-minute quota."""

    name: str
    key_id: str
    provider: LLMProvider
    limit_per_minute: int


class ProviderRouter:
    """Selects an LLM provider, tracks usage in Redis, and fails over on 429/timeout.

    Selection order among eligible candidates rotates round-robin so free-tier keys
    receive even load. Ineligible candidates are skipped when cooling down or at quota.
    """

    def __init__(self, candidates: list[ProviderCandidate], redis: Any) -> None:
        if not candidates:
            raise ValueError("ProviderRouter requires at least one candidate")
        self._candidates = candidates
        self._redis = redis
        self._round_robin_index = 0

    async def generate(self, prompt: str, **kwargs: object) -> tuple[str, str]:
        """Call the next eligible provider; return ``(text, provider_name)``."""
        eligible = self._eligible_candidates()
        if not eligible:
            raise AllProvidersExhaustedError("No LLM providers available")

        ordered = self._rotate(eligible)
        errors: list[str] = []

        for candidate in ordered:
            if not self._has_quota(candidate):
                continue

            self._increment_usage(candidate)
            try:
                text = await candidate.provider.generate(prompt, **kwargs)
                self._advance_round_robin(candidate)
                return text, candidate.name
            except ProviderRateLimitError as exc:
                self._set_cooldown(candidate)
                errors.append(f"{candidate.name}: {exc}")
            except ProviderTimeoutError:
                self._set_cooldown(candidate)
                errors.append(f"{candidate.name}: timeout")
            except ProviderError as exc:
                errors.append(f"{candidate.name}: {exc}")

        raise AllProvidersExhaustedError("; ".join(errors) or "All providers failed")

    def _eligible_candidates(self) -> list[ProviderCandidate]:
        return [c for c in self._candidates if not self._in_cooldown(c)]

    def _rotate(self, candidates: list[ProviderCandidate]) -> list[ProviderCandidate]:
        if not candidates:
            return []
        start = self._round_robin_index % len(candidates)
        return candidates[start:] + candidates[:start]

    def _advance_round_robin(self, selected: ProviderCandidate) -> None:
        names = [c.name for c in self._candidates]
        try:
            idx = next(i for i, c in enumerate(self._candidates) if c is selected)
            self._round_robin_index = (idx + 1) % len(self._candidates)
        except StopIteration:
            self._round_robin_index = (self._round_robin_index + 1) % max(len(names), 1)

    def _minute_bucket(self) -> int:
        return int(time.time()) // 60

    def _usage_key(self, candidate: ProviderCandidate) -> str:
        return f"provider_usage:{candidate.name}:{candidate.key_id}:{self._minute_bucket()}"

    def _cooldown_key(self, candidate: ProviderCandidate) -> str:
        return f"provider_cooldown:{candidate.name}:{candidate.key_id}"

    def _current_usage(self, candidate: ProviderCandidate) -> int:
        raw = self._redis.get(self._usage_key(candidate))
        return int(raw) if raw is not None else 0

    def _has_quota(self, candidate: ProviderCandidate) -> bool:
        return self._current_usage(candidate) < candidate.limit_per_minute

    def _increment_usage(self, candidate: ProviderCandidate) -> int:
        key = self._usage_key(candidate)
        count = self._redis.incr(key)
        if count == 1:
            self._redis.expire(key, USAGE_TTL_SECONDS)
        return count

    def _in_cooldown(self, candidate: ProviderCandidate) -> bool:
        return self._redis.get(self._cooldown_key(candidate)) is not None

    def _set_cooldown(self, candidate: ProviderCandidate) -> None:
        self._redis.set(self._cooldown_key(candidate), "1", ex=COOLDOWN_SECONDS)
