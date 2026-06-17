"""End-to-end LangGraph pipeline tests using FakeLLMProvider — no live LLM calls."""

from __future__ import annotations

import json

import pytest

from app.pipeline.graph import build_pipeline_graph
from app.providers.fake import FakeLLMProvider
from app.providers.router import ProviderCandidate, ProviderRouter
from app.schemas import JDAnalysis, ResumeData
from tests.fakes.redis import FakeRedis
from tests.fixtures.pipeline_responses import (
    SAMPLE_ATS_SCORE,
    SAMPLE_COVER_LETTER,
    SAMPLE_JD_ANALYSIS,
    SAMPLE_PARSED_RESUME,
    SAMPLE_TAILORED_RESUME,
)


def _router_with_responses(responses: list[str], fake_redis: FakeRedis) -> ProviderRouter:
    fake = FakeLLMProvider(responses, name="fake")
    return ProviderRouter(
        candidates=[ProviderCandidate("fake", "test", fake, limit_per_minute=100)],
        redis=fake_redis,
    )


def _base_state(**overrides: object) -> dict:
    state = {
        "raw_resume_text": "Jane Doe\nSoftware Engineer\nPython, FastAPI",
        "parsed_resume": None,
        "job_description": "We need a Backend Engineer with Python and FastAPI experience.",
        "jd_analysis": None,
        "tailored_resume": None,
        "ats_score": None,
        "cover_letter": None,
        "requested": {"ats_score": True, "cover_letter": True},
        "meta": {
            "latencies": {},
            "providers": {},
            "cache_hits": {"resume_parse": False, "jd_analysis": False},
        },
    }
    state.update(overrides)
    return state


@pytest.fixture
def fake_redis() -> FakeRedis:
    return FakeRedis()


@pytest.mark.asyncio
async def test_full_pipeline_runs_all_agents_and_records_latencies(
    fake_redis: FakeRedis,
) -> None:
    """Fan-out preprocess, tailoring, and optional post nodes populate meta metrics."""
    responses = [
        json.dumps(SAMPLE_PARSED_RESUME),
        json.dumps(SAMPLE_JD_ANALYSIS),
        json.dumps(SAMPLE_TAILORED_RESUME),
        json.dumps(SAMPLE_ATS_SCORE),
        SAMPLE_COVER_LETTER,
    ]
    router = _router_with_responses(responses, fake_redis)
    graph = build_pipeline_graph(router)

    result = await graph.ainvoke(_base_state())

    assert result["parsed_resume"] is not None
    assert result["jd_analysis"] is not None
    assert result["tailored_resume"] is not None
    assert result["ats_score"] is not None
    assert result["cover_letter"] == SAMPLE_COVER_LETTER

    latencies = result["meta"]["latencies"]
    assert "parser_agent" in latencies
    assert "jd_analyzer_agent" in latencies
    assert "tailoring_agent" in latencies
    assert "ats_scoring_agent" in latencies
    assert "cover_letter_agent" in latencies
    assert all(ms >= 0 for ms in latencies.values())

    providers = result["meta"]["providers"]
    assert providers.get("parser_agent") == "fake"
    assert providers.get("tailoring_agent") == "fake"


@pytest.mark.asyncio
async def test_pipeline_skips_parser_when_resume_already_parsed(fake_redis: FakeRedis) -> None:
    parsed = ResumeData.model_validate(SAMPLE_PARSED_RESUME)
    responses = [
        json.dumps(SAMPLE_JD_ANALYSIS),
        json.dumps(SAMPLE_TAILORED_RESUME),
    ]
    router = _router_with_responses(responses, fake_redis)
    graph = build_pipeline_graph(router)

    result = await graph.ainvoke(
        _base_state(
            parsed_resume=parsed,
            requested={"ats_score": False, "cover_letter": False},
            raw_resume_text=None,
        )
    )

    assert "parser_agent" not in result["meta"]["latencies"]
    assert result["tailored_resume"] is not None


@pytest.mark.asyncio
async def test_pipeline_skips_jd_analyzer_on_cache_hit(fake_redis: FakeRedis) -> None:
    jd = JDAnalysis.model_validate(SAMPLE_JD_ANALYSIS)
    responses = [
        json.dumps(SAMPLE_PARSED_RESUME),
        json.dumps(SAMPLE_TAILORED_RESUME),
    ]
    router = _router_with_responses(responses, fake_redis)
    graph = build_pipeline_graph(router)

    result = await graph.ainvoke(
        _base_state(
            jd_analysis=jd,
            meta={
                "latencies": {},
                "providers": {},
                "cache_hits": {"resume_parse": False, "jd_analysis": True},
            },
            requested={"ats_score": False, "cover_letter": False},
        )
    )

    assert "jd_analyzer_agent" not in result["meta"]["latencies"]
    assert result["jd_analysis"].role_title == "Backend Engineer"


@pytest.mark.asyncio
async def test_pipeline_omits_optional_agents_when_not_requested(
    fake_redis: FakeRedis,
) -> None:
    responses = [
        json.dumps(SAMPLE_PARSED_RESUME),
        json.dumps(SAMPLE_JD_ANALYSIS),
        json.dumps(SAMPLE_TAILORED_RESUME),
    ]
    router = _router_with_responses(responses, fake_redis)
    graph = build_pipeline_graph(router)

    result = await graph.ainvoke(
        _base_state(requested={"ats_score": False, "cover_letter": False})
    )

    assert result["ats_score"] is None
    assert result["cover_letter"] is None
    assert "ats_scoring_agent" not in result["meta"]["latencies"]
    assert "cover_letter_agent" not in result["meta"]["latencies"]
