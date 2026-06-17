"""Pytest fixtures for FastAPI integration tests without live Supabase or Redis."""

from __future__ import annotations

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

# Set before app import so Settings validation succeeds in CI.
os.environ.setdefault("SUPABASE_URL", "https://test-project.supabase.co")
os.environ.setdefault("SUPABASE_JWT_SECRET", "test-jwt-secret-for-unit-tests-only")
os.environ.setdefault("UPSTASH_REDIS_REST_URL", "https://mock.upstash.io")
os.environ.setdefault("UPSTASH_REDIS_REST_TOKEN", "mock-upstash-token")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:3000")


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Unauthenticated TestClient — JWT verification uses test secret, no Bearer header."""
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def authenticated_client(client: TestClient) -> TestClient:
    """TestClient with auth dependency overridden to a fixed user id."""
    from app.dependencies.auth import require_user_id
    from app.main import app

    app.dependency_overrides[require_user_id] = lambda: "00000000-0000-0000-0000-000000000001"
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers() -> dict[str, str]:
    """Bearer header using HS256 test token accepted by the test JWT verifier."""
    from app.dependencies.auth import create_test_access_token

    token = create_test_access_token("00000000-0000-0000-0000-000000000001")
    return {"Authorization": f"Bearer {token}"}


def minimal_resume_payload() -> dict:
    """Valid ResumeData body fragment for generate/resume route tests."""
    return {
        "name": "Jane Doe",
        "title": "Software Engineer",
        "summary": "Builds reliable systems.",
        "contact": {
            "phone": "",
            "address": "",
            "email": "jane@example.com",
            "linkedin": "",
            "github": "",
            "website": "",
        },
        "experiences": [],
        "education": [],
        "projects": [],
        "skills": ["Python"],
        "languages": ["English"],
        "additional": {
            "certifications": [],
            "awards": [],
            "other_skills": [],
        },
    }
