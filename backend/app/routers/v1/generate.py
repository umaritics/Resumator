"""Async generation entrypoint — enqueues LangGraph pipeline as background work."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, status

from app.dependencies.auth import optional_user_id
from app.schemas.jobs import GenerateRequest, GenerateResponse
from app.services.generation_service import execute_generation_job
from app.services.job_store import JobStore

router = APIRouter(prefix="/generate", tags=["generation"])


@router.post(
    "",
    response_model=GenerateResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Start resume tailoring pipeline",
    description=(
        "Accepts resume JSON and optional job description, enqueues a background "
        "LangGraph job, and returns a job id for polling. Anonymous access allowed "
        "with stricter rate limits (Phase 3)."
    ),
    responses={
        status.HTTP_202_ACCEPTED: {
            "description": "Job accepted — poll GET /api/v1/jobs/{job_id}",
            "model": GenerateResponse,
        },
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Bearer token invalid when Authorization header supplied",
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "description": "Request body failed Pydantic validation",
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "description": "Unexpected server failure",
        },
    },
)
async def start_generation(
    body: GenerateRequest,
    background_tasks: BackgroundTasks,
    user_id: Annotated[str | None, Depends(optional_user_id)] = None,
) -> GenerateResponse:
    """Write pending job to Redis and execute pipeline in a FastAPI background task."""
    store = JobStore()
    job_id = store.create(user_id=user_id)
    background_tasks.add_task(execute_generation_job, job_id, body, user_id)
    return GenerateResponse(job_id=job_id)
