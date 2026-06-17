"""Background execution of the LangGraph pipeline for async /generate jobs."""

from __future__ import annotations

from typing import Any

from app.pipeline.constants import STAGE_MESSAGES
from app.pipeline.graph import build_pipeline_graph
from app.pipeline.state import PipelineState, default_meta
from app.providers.factory import build_provider_router
from app.providers.router import ProviderRouter
from app.schemas.jobs import GenerateRequest
from app.services.job_store import JobStore


def create_router_for_pipeline() -> ProviderRouter:
    """Factory hook — patched in pytest to inject FakeLLMProvider."""
    return build_provider_router()


def build_initial_pipeline_state(request: GenerateRequest) -> PipelineState:
    """Map API request to graph state — wizard form data skips parser_agent."""
    return {
        "raw_resume_text": None,
        "parsed_resume": request.resume_data,
        "job_description": request.job_description,
        "jd_analysis": None,
        "tailored_resume": None,
        "ats_score": None,
        "cover_letter": None,
        "requested": request.requested.model_dump(),
        "meta": default_meta(),
    }


def serialize_pipeline_result(state: dict[str, Any]) -> dict[str, Any]:
    """Convert graph output to JSON-serializable job result for Redis + frontend."""

    def _dump(value: Any) -> Any:
        if hasattr(value, "model_dump"):
            return value.model_dump(by_alias=True)
        return value

    return {
        "tailored_resume": _dump(state.get("tailored_resume")),
        "jd_analysis": _dump(state.get("jd_analysis")),
        "ats_score": _dump(state.get("ats_score")),
        "cover_letter": state.get("cover_letter"),
        "meta": state.get("meta") or {},
    }


async def execute_generation_job(
    job_id: str,
    request: GenerateRequest,
    user_id: str | None = None,
) -> None:
    """Run the compiled LangGraph pipeline and persist status transitions in Redis."""
    store = JobStore()

    def on_progress(stage: str, message: str) -> None:
        store.update_progress(
            job_id,
            status="running",
            stage=stage,
            progress_message=message,
        )

    try:
        store.update_progress(
            job_id,
            status="running",
            stage="starting",
            progress_message="Starting generation…",
        )
        router = create_router_for_pipeline()
        graph = build_pipeline_graph(router, on_progress=on_progress)
        final_state = await graph.ainvoke(build_initial_pipeline_state(request))
        store.mark_done(job_id, serialize_pipeline_result(final_state))
    except Exception as exc:
        store.mark_failed(job_id, str(exc))
