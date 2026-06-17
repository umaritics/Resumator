"""Merge partial state patches produced by parallel agent tasks."""

from __future__ import annotations

from typing import Any


def merge_state_patches(*patches: dict[str, Any]) -> dict[str, Any]:
    """Deep-merge meta latencies/providers when fan-out agents return in parallel."""
    merged: dict[str, Any] = {}
    for patch in patches:
        if not patch:
            continue
        for key, value in patch.items():
            if key == "meta" and "meta" in merged:
                merged["meta"] = _merge_meta(merged["meta"], value)
            else:
                merged[key] = value
    return merged


def _merge_meta(left: dict[str, Any], right: dict[str, Any]) -> dict[str, Any]:
    latencies = {**(left.get("latencies") or {}), **(right.get("latencies") or {})}
    providers = {**(left.get("providers") or {}), **(right.get("providers") or {})}
    cache_hits = {**(left.get("cache_hits") or {}), **(right.get("cache_hits") or {})}
    return {
        **left,
        **right,
        "latencies": latencies,
        "providers": providers,
        "cache_hits": cache_hits,
    }
