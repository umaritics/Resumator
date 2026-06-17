"""Google Gemini 2.5 Flash HTTP adapter."""

from __future__ import annotations

import httpx

from app.providers.exceptions import ProviderRateLimitError, ProviderTimeoutError

GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


class GeminiProvider:
    """Production Gemini client — raises router-visible errors on 429/timeout."""

    name = "gemini"

    def __init__(self, api_key: str, *, timeout: float = 30.0) -> None:
        self._api_key = api_key
        self._timeout = timeout

    async def generate(self, prompt: str, **kwargs: object) -> str:
        model = str(kwargs.get("model", GEMINI_MODEL))
        url = f"{GEMINI_BASE}/{model}:generateContent"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
        }
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.post(
                    url,
                    params={"key": self._api_key},
                    json=payload,
                )
        except httpx.TimeoutException as exc:
            raise ProviderTimeoutError("Gemini request timed out") from exc

        if response.status_code == 429:
            raise ProviderRateLimitError("Gemini rate limit")
        response.raise_for_status()

        data = response.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError, TypeError) as exc:
            raise RuntimeError("Unexpected Gemini response shape") from exc
