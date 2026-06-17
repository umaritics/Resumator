"""Job status polling — reads Redis ``job:{id}`` written by background pipeline."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.dependencies.auth import optional_user_id
from app.schemas.jobs import JobResponse
from app.services.job_store import JobStore

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get(
    "/{job_id}",
    response_model=JobResponse,
    summary="Poll async generation job status",
    description=(
        "Returns pending/running/done/failed status and optional result payload "
        "from Redis key job:{job_id}. Optional auth for per-user job isolation."
    ),
    responses={
        status.HTTP_200_OK: {
            "description": "Current job status and progressive stage message",
            "model": JobResponse,
        },
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Bearer token invalid when Authorization header supplied",
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "Unknown or expired job id",
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "description": "job_id is not a valid UUID",
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "description": "Unexpected server failure",
        },
    },
)
async def get_job_status(
    job_id: Annotated[UUID, Path(description="Job UUID returned by POST /generate")],
    user_id: Annotated[str | None, Depends(optional_user_id)] = None,
) -> JobResponse:
    """Read job status from Redis for TanStack Query polling."""
    store = JobStore()
    record = store.get(str(job_id))
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if user_id and record.user_id and record.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    return JobResponse(
        status=record.status,  # type: ignore[arg-type]
        stage=record.stage,
        progress_message=record.progress_message,
        result=record.result,
        error=record.error,
    )
