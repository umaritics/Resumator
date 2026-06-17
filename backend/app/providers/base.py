"""LLM provider protocol — all agents call through ProviderRouter, not providers directly."""

from __future__ import annotations

from typing import Protocol, runtime_checkable


@runtime_checkable
class LLMProvider(Protocol):
    """Minimal async interface for text generation backends."""

    name: str

    async def generate(self, prompt: str, **kwargs: object) -> str:
        """Send prompt to the provider and return raw text (often JSON)."""
