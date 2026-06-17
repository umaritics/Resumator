"""Extract structured ResumeData from raw resume text via LLM."""

from __future__ import annotations

from app.pipeline.agents.base import run_timed_llm_call
from app.pipeline.routing import should_run_parser
from app.pipeline.state import PipelineState
from app.providers.router import ProviderRouter
from app.schemas import ResumeData

NODE_NAME = "parser_agent"


def build_parser_prompt(raw_text: str) -> str:
    return (
        "Extract resume fields as JSON matching this schema keys: "
        "name, title, summary, contact, experiences, education, projects, skills, "
        "languages, additional. Return JSON only.\n\n"
        f"RESUME TEXT:\n{raw_text}"
    )


async def parser_agent(state: PipelineState, router: ProviderRouter) -> dict:
    """Populate ``parsed_resume`` unless skipped due to cache or preloaded form data."""
    if not should_run_parser(state):
        return {}

    raw_text = state.get("raw_resume_text") or ""
    parsed, patch = await run_timed_llm_call(
        state,
        router,
        NODE_NAME,
        build_parser_prompt(raw_text),
        ResumeData,
    )
    return {**patch, "parsed_resume": parsed}
