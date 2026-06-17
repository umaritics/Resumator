"""Predicates for skipping cache-hit or already-populated pipeline stages."""

from __future__ import annotations

from app.pipeline.state import PipelineState


def should_run_parser(state: PipelineState) -> bool:
    """True when raw text exists and structured resume is not already available."""
    if state.get("parsed_resume") is not None:
        return False
    cache_hits = (state.get("meta") or {}).get("cache_hits") or {}
    if cache_hits.get("resume_parse"):
        return False
    return bool(state.get("raw_resume_text"))


def should_run_jd_analyzer(state: PipelineState) -> bool:
    """True when JD text exists and analysis is not cached or preloaded."""
    if state.get("jd_analysis") is not None:
        return False
    cache_hits = (state.get("meta") or {}).get("cache_hits") or {}
    if cache_hits.get("jd_analysis"):
        return False
    return bool(state.get("job_description"))


def wants_ats_score(state: PipelineState) -> bool:
    requested = state.get("requested") or {}
    return bool(requested.get("ats_score"))


def wants_cover_letter(state: PipelineState) -> bool:
    requested = state.get("requested") or {}
    return bool(requested.get("cover_letter"))
