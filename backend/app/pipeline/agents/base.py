"""Shared helpers for timed LLM agent nodes."""

from __future__ import annotations

import time
from typing import TypeVar

from pydantic import BaseModel

from app.pipeline.json_utils import extract_json_text
from app.pipeline.state import PipelineState, merge_meta_update
from app.providers.router import ProviderRouter

T = TypeVar("T", bound=BaseModel)


async def run_timed_llm_call(
    state: PipelineState,
    router: ProviderRouter,
    node_name: str,
    prompt: str,
    model: type[T],
) -> tuple[T, dict]:
    """Invoke ProviderRouter, parse JSON into ``model``, return state patch + meta."""
    started = time.perf_counter()
    raw, provider_name = await router.generate(prompt)
    elapsed_ms = int((time.perf_counter() - started) * 1000)
    parsed = model.model_validate_json(extract_json_text(raw))
    meta = merge_meta_update(state, node_name, elapsed_ms, provider_name)
    return parsed, {"meta": meta}
