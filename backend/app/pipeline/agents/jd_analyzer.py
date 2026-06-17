"""Analyze job description text into structured JDAnalysis."""

from __future__ import annotations

from app.pipeline.agents.base import run_timed_llm_call
from app.pipeline.routing import should_run_jd_analyzer
from app.pipeline.state import PipelineState
from app.providers.router import ProviderRouter
from app.schemas import JDAnalysis

NODE_NAME = "jd_analyzer_agent"


def build_jd_prompt(job_description: str) -> str:
    return (
        "Analyze the job description. Return JSON with keys: required_skills, "
        "nice_to_have_skills, seniority, role_title, company_name, tone_keywords. "
        "Return JSON only.\n\n"
        f"JOB DESCRIPTION:\n{job_description}"
    )


async def jd_analyzer_agent(state: PipelineState, router: ProviderRouter) -> dict:
    """Populate ``jd_analysis`` unless skipped due to Redis/Postgres cache hit."""
    if not should_run_jd_analyzer(state):
        return {}

    job_description = state.get("job_description") or ""
    analysis, patch = await run_timed_llm_call(
        state,
        router,
        NODE_NAME,
        build_jd_prompt(job_description),
        JDAnalysis,
    )
    return {**patch, "jd_analysis": analysis}
