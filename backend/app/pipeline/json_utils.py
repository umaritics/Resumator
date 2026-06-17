"""Normalize raw LLM text into parseable JSON payloads."""

from __future__ import annotations

import re

_FENCE_PATTERN = re.compile(
    r"^\s*```(?:json|JSON)?\s*\n?(.*?)\n?```\s*$",
    re.DOTALL,
)


def extract_json_text(raw: str) -> str:
    """Strip markdown code fences and surrounding whitespace from LLM output."""
    text = raw.strip()
    match = _FENCE_PATTERN.match(text)
    if match:
        return match.group(1).strip()
    return text
