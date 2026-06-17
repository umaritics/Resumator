"""LangGraph assembly for the resume tailoring multi-agent pipeline."""

from __future__ import annotations

import asyncio
from typing import Any

from langgraph.graph import END, START, StateGraph

from app.pipeline.agents.ats_scoring import ats_scoring_agent
from app.pipeline.agents.cover_letter import cover_letter_agent
from app.pipeline.agents.jd_analyzer import jd_analyzer_agent
from app.pipeline.agents.parser import parser_agent
from app.pipeline.agents.tailoring import tailoring_agent
from app.pipeline.merge import merge_state_patches
from app.pipeline.routing import should_run_jd_analyzer, should_run_parser
from app.pipeline.state import PipelineState
from app.providers.router import ProviderRouter


async def preprocess_parallel(state: PipelineState, router: ProviderRouter) -> dict[str, Any]:
    """Run parser and JD analyzer concurrently when inputs and cache flags allow."""
    tasks: list[Any] = []
    if should_run_parser(state):
        tasks.append(parser_agent(state, router))
    if should_run_jd_analyzer(state):
        tasks.append(jd_analyzer_agent(state, router))

    if not tasks:
        return {}

    results = await asyncio.gather(*tasks)
    return merge_state_patches(*results)


async def postprocess_parallel(state: PipelineState, router: ProviderRouter) -> dict[str, Any]:
    """Run ATS scoring and cover letter agents concurrently when requested."""
    tasks = [
        ats_scoring_agent(state, router),
        cover_letter_agent(state, router),
    ]
    results = await asyncio.gather(*tasks)
    return merge_state_patches(*results)


def build_pipeline_graph(router: ProviderRouter):
    """Compile the LangGraph pipeline bound to a shared ProviderRouter instance.

    Graph shape (parallel batches implemented via asyncio.gather orchestration nodes):

    START → preprocess_parallel → tailoring_agent → postprocess_parallel → END

    Independent agent functions live under ``app.pipeline.agents.*`` and record
    ``meta['latencies']`` / ``meta['providers']`` per node.
    """

    async def preprocess_node(state: PipelineState) -> dict[str, Any]:
        return await preprocess_parallel(state, router)

    async def tailoring_node(state: PipelineState) -> dict[str, Any]:
        return await tailoring_agent(state, router)

    async def postprocess_node(state: PipelineState) -> dict[str, Any]:
        return await postprocess_parallel(state, router)

    workflow: StateGraph = StateGraph(PipelineState)
    workflow.add_node("preprocess_parallel", preprocess_node)
    workflow.add_node("tailoring_agent", tailoring_node)
    workflow.add_node("postprocess_parallel", postprocess_node)

    workflow.add_edge(START, "preprocess_parallel")
    workflow.add_edge("preprocess_parallel", "tailoring_agent")
    workflow.add_edge("tailoring_agent", "postprocess_parallel")
    workflow.add_edge("postprocess_parallel", END)

    return workflow.compile()
