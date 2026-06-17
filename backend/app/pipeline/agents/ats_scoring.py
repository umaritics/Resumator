"""Score tailored resume against JD for ATS compatibility."""

from __future__ import annotations

from app.pipeline.agents.base import run_timed_llm_call
from app.pipeline.routing import wants_ats_score
from app.pipeline.state import PipelineState
from app.providers.router import ProviderRouter
from app.schemas import ATSScore, ResumeData

NODE_NAME = "ats_scoring_agent"


def build_ats_prompt(resume: ResumeData, state: PipelineState) -> str:
    jd = state.get("jd_analysis")
    jd_block = jd.model_dump_json() if jd else "null"
    return (
        "Score the resume for ATS fit. Return JSON with keys: overall, keyword_match, "
        "formatting, semantic_relevance, suggestions (array of strings). "
        "All scores 0-100. Return JSON only.\n\n"
        f"RESUME:\n{resume.model_dump_json()}\n\n"
        f"JD ANALYSIS:\n{jd_block}"
    )


async def ats_scoring_agent(state: PipelineState, router: ProviderRouter) -> dict:
    """Populate ``ats_score`` when requested in ``state['requested']``."""
    if not wants_ats_score(state):
        return {}

    resume = state.get("tailored_resume")
    if resume is None:
        raise ValueError("ats_scoring_agent requires tailored_resume")

    score, patch = await run_timed_llm_call(
        state,
        router,
        NODE_NAME,
        build_ats_prompt(resume, state),
        ATSScore,
    )
    return {**patch, "ats_score": score}
