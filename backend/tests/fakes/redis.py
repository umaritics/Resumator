"""In-memory Redis stand-in for provider router unit tests."""

from __future__ import annotations


class FakeRedis:
    """Minimal subset of Upstash Redis commands used by ProviderRouter.

    Not thread-safe — sufficient for single-threaded pytest runs.
    """

    def __init__(self) -> None:
        self._store: dict[str, str] = {}

    def get(self, key: str) -> str | None:
        return self._store.get(key)

    def set(self, key: str, value: str, ex: int | None = None) -> bool:
        _ = ex  # TTL not simulated — tests use explicit keys per bucket
        self._store[key] = value
        return True

    def incr(self, key: str) -> int:
        current = int(self._store.get(key, "0"))
        current += 1
        self._store[key] = str(current)
        return current

    def expire(self, key: str, seconds: int) -> bool:
        _ = seconds
        return key in self._store
