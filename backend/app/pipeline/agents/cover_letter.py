"""Generate cover letter prose from tailored resume and JD analysis."""

from __future__ import annotations

import time

from app.pipeline.routing import wants_cover_letter
from app.pipeline.state import PipelineState, merge_meta_update
from app.providers.router import ProviderRouter
from app.schemas import ResumeData

NODE_NAME = "cover_letter_agent"


def build_cover_letter_prompt(resume: ResumeData, state: PipelineState) -> str:
    jd = state.get("jd_analysis")
    jd_block = jd.model_dump_json() if jd else "null"
    return (
        "Write a concise 2-3 paragraph cover letter. Return plain text only, no JSON.\n\n"
        f"RESUME:\n{resume.model_dump_json()}\n\n"
        f"JD ANALYSIS:\n{jd_block}"
    )


async def cover_letter_agent(state: PipelineState, router: ProviderRouter) -> dict:
    """Populate ``cover_letter`` when requested in ``state['requested']``."""
    if not wants_cover_letter(state):
        return {}

    resume = state.get("tailored_resume")
    if resume is None:
        raise ValueError("cover_letter_agent requires tailored_resume")

    started = time.perf_counter()
    text, provider_name = await router.generate(build_cover_letter_prompt(resume, state))
    elapsed_ms = int((time.perf_counter() - started) * 1000)
    meta = merge_meta_update(state, NODE_NAME, elapsed_ms, provider_name)
    return {"cover_letter": text.strip(), "meta": meta}
