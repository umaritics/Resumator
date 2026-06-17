"""Groq Llama HTTP adapter — secondary failover target."""

from __future__ import annotations

import httpx

from app.providers.exceptions import ProviderRateLimitError, ProviderTimeoutError

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"


class GroqProvider:
    """Production Groq client using OpenAI-compatible chat completions API."""

    name = "groq"

    def __init__(
        self,
        api_key: str,
        *,
        model: str = DEFAULT_GROQ_MODEL,
        timeout: float = 30.0,
    ) -> None:
        self._api_key = api_key
        self._model = model
        self._timeout = timeout

    async def generate(self, prompt: str, **kwargs: object) -> str:
        model = str(kwargs.get("model", self._model))
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
        }
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.post(
                    GROQ_CHAT_URL,
                    headers=headers,
                    json=payload,
                )
        except httpx.TimeoutException as exc:
            raise ProviderTimeoutError("Groq request timed out") from exc

        if response.status_code == 429:
            raise ProviderRateLimitError("Groq rate limit")
        response.raise_for_status()

        data = response.json()
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise RuntimeError("Unexpected Groq response shape") from exc
