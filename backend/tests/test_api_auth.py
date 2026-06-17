"""API security boundary tests — auth enforcement and request validation."""

from __future__ import annotations

from tests.conftest import minimal_resume_payload


def test_list_resumes_without_token_returns_401(client) -> None:
    response = client.get("/api/v1/resumes")
    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


def test_create_resume_without_token_returns_401(client) -> None:
    response = client.post("/api/v1/resumes", json=minimal_resume_payload())
    assert response.status_code == 401


def test_list_generations_without_token_returns_401(client) -> None:
    response = client.get("/api/v1/generations")
    assert response.status_code == 401


def test_generate_empty_body_returns_422(client) -> None:
    response = client.post("/api/v1/generate", json={})
    assert response.status_code == 422


def test_generate_missing_resume_data_returns_422(client) -> None:
    response = client.post(
        "/api/v1/generate",
        json={"requested": {"ats_score": True, "cover_letter": False}},
    )
    assert response.status_code == 422


def test_generate_invalid_resume_data_returns_422(client) -> None:
    response = client.post(
        "/api/v1/generate",
        json={
            "resume_data": {"name": "only-name"},
            "requested": {"ats_score": True, "cover_letter": True},
        },
    )
    assert response.status_code == 422


def test_get_job_unknown_returns_404(client) -> None:
    response = client.get("/api/v1/jobs/00000000-0000-0000-0000-000000000099")
    assert response.status_code == 404


def test_list_resumes_with_valid_token_returns_not_implemented(authenticated_client, auth_headers) -> None:
    response = authenticated_client.get("/api/v1/resumes", headers=auth_headers)
    assert response.status_code == 501
