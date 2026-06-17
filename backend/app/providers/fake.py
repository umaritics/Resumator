"""Deterministic LLM double for CI — no network, scripted responses and failures."""

from __future__ import annotations

from collections import deque

from app.providers.exceptions import ProviderError


class FakeLLMProvider:
    """Queue-driven provider used by pytest and LangGraph integration tests (Phase 4).

    Each ``generate`` call pops the next queued item. Strings are returned as-is;
    exceptions are re-raised to exercise router failover paths.
    """

    name: str

    def __init__(
        self,
        responses: list[str | ProviderError | Exception],
        name: str = "fake",
    ) -> None:
        self.name = name
        self._responses: deque[str | Exception] = deque(responses)
        self.call_count = 0
        self.last_prompt: str | None = None

    async def generate(self, prompt: str, **kwargs: object) -> str:
        self.call_count += 1
        self.last_prompt = prompt
        if not self._responses:
            raise RuntimeError(f"FakeLLMProvider({self.name}) has no queued responses")
        item = self._responses.popleft()
        if isinstance(item, Exception):
            raise item
        return item
