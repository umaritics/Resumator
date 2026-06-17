"""Tailor resume wording to JD analysis (or polish when JD absent)."""

from __future__ import annotations

from app.pipeline.agents.base import run_timed_llm_call
from app.pipeline.state import PipelineState
from app.providers.router import ProviderRouter
from app.schemas import ResumeData

NODE_NAME = "tailoring_agent"


def _resume_source(state: PipelineState) -> ResumeData:
    parsed = state.get("parsed_resume")
    if parsed is None:
        raise ValueError("tailoring_agent requires parsed_resume")
    return parsed


def build_tailoring_prompt(state: PipelineState) -> str:
    resume = _resume_source(state)
    jd = state.get("jd_analysis")
    jd_block = jd.model_dump_json() if jd else "null"
    return (
        "Rewrite the resume JSON to align with the job analysis while staying truthful. "
        "Return the full resume JSON only.\n\n"
        f"RESUME:\n{resume.model_dump_json()}\n\n"
        f"JD ANALYSIS:\n{jd_block}"
    )


async def tailoring_agent(state: PipelineState, router: ProviderRouter) -> dict:
    """Produce ``tailored_resume`` from parsed resume + optional JD analysis."""
    tailored, patch = await run_timed_llm_call(
        state,
        router,
        NODE_NAME,
        build_tailoring_prompt(state),
        ResumeData,
    )
    return {**patch, "tailored_resume": tailored}
