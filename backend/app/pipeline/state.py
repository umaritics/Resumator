"""LangGraph pipeline state schema — mirrors ARCHITECTURE.md §7.1."""

from __future__ import annotations

from typing import Any, TypedDict

from app.schemas import ATSScore, JDAnalysis, ResumeData


class PipelineMeta(TypedDict, total=False):
    """Metrics block persisted to generations.latencies_ms / providers_used / cache_hits."""

    latencies: dict[str, int]
    providers: dict[str, str]
    cache_hits: dict[str, bool]
    _preprocess_barrier: int


class RequestedFeatures(TypedDict, total=False):
    """Flags selecting optional terminal agents after tailoring."""

    ats_score: bool
    cover_letter: bool


class PipelineState(TypedDict, total=False):
    """Mutable graph state passed between agent nodes."""

    raw_resume_text: str | None
    parsed_resume: ResumeData | None
    job_description: str | None
    jd_analysis: JDAnalysis | None
    tailored_resume: ResumeData | None
    ats_score: ATSScore | None
    cover_letter: str | None
    requested: RequestedFeatures
    meta: PipelineMeta


def default_meta() -> PipelineMeta:
    """Empty metrics skeleton for new pipeline runs."""
    return {
        "latencies": {},
        "providers": {},
        "cache_hits": {"resume_parse": False, "jd_analysis": False},
    }


def merge_meta_update(
    state: PipelineState,
    node_name: str,
    elapsed_ms: int,
    provider_name: str,
) -> PipelineMeta:
    """Append timing/provider entries without mutating the incoming state dict."""
    meta: dict[str, Any] = dict(state.get("meta") or default_meta())
    latencies = dict(meta.get("latencies") or {})
    providers = dict(meta.get("providers") or {})
    latencies[node_name] = elapsed_ms
    providers[node_name] = provider_name
    meta["latencies"] = latencies
    meta["providers"] = providers
    return meta  # type: ignore[return-value]
