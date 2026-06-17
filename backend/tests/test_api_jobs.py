"""API integration tests for async generation jobs (Redis + background pipeline)."""

from __future__ import annotations

import json

import pytest
from fastapi.testclient import TestClient

from app.providers.fake import FakeLLMProvider
from app.providers.router import ProviderCandidate, ProviderRouter
from tests.conftest import minimal_resume_payload
from tests.fakes.redis import FakeRedis
from tests.fixtures.pipeline_responses import (
    SAMPLE_JD_ANALYSIS,
    SAMPLE_PARSED_RESUME,
    SAMPLE_TAILORED_RESUME,
)


def _fake_router(fake_redis: FakeRedis) -> ProviderRouter:
    # Form data preloads parsed_resume — parser_agent skipped; JD + tailoring only.
    responses = [
        json.dumps(SAMPLE_JD_ANALYSIS),
        json.dumps(SAMPLE_TAILORED_RESUME),
    ]
    fake = FakeLLMProvider(responses, name="fake")
    return ProviderRouter(
        candidates=[ProviderCandidate("fake", "test", fake, limit_per_minute=100)],
        redis=fake_redis,
    )


@pytest.fixture
def job_client(fake_redis: FakeRedis, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setattr(
        "app.services.generation_service.create_router_for_pipeline",
        lambda: _fake_router(fake_redis),
    )
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


def _generate_payload(**overrides: object) -> dict:
    body = {
        "resume_data": minimal_resume_payload(),
        "job_description": "Backend engineer with Python experience.",
        "requested": {"ats_score": False, "cover_letter": False},
    }
    body.update(overrides)
    return body


def test_start_generation_returns_job_id(job_client: TestClient) -> None:
    response = job_client.post("/api/v1/generate", json=_generate_payload())
    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
    assert len(data["job_id"]) == 36


def test_poll_job_until_done(job_client: TestClient) -> None:
    start = job_client.post("/api/v1/generate", json=_generate_payload())
    job_id = start.json()["job_id"]

    poll = job_client.get(f"/api/v1/jobs/{job_id}")
    assert poll.status_code == 200
    body = poll.json()
    assert body["status"] in {"pending", "running", "done", "failed"}
    if body["status"] == "done":
        assert body["result"] is not None
        assert body["result"]["tailored_resume"]["name"] == "Jane Doe"


def test_get_unknown_job_returns_404(job_client: TestClient) -> None:
    response = job_client.get("/api/v1/jobs/00000000-0000-0000-0000-000000000099")
    assert response.status_code == 404


def test_generate_valid_body_no_longer_returns_501(job_client: TestClient) -> None:
    response = job_client.post("/api/v1/generate", json=_generate_payload())
    assert response.status_code != 501
