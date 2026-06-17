"""Job status polling endpoint placeholder — backed by Redis in Phase 5."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.dependencies.auth import optional_user_id
from app.schemas.jobs import JobResponse

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
            "description": "Current job status (placeholder until Phase 5)",
            "model": JobResponse,
        },
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Bearer token invalid when Authorization header supplied",
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "description": "job_id is not a valid UUID",
        },
        status.HTTP_501_NOT_IMPLEMENTED: {
            "description": "Job store not yet implemented (Phase 5)",
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
    """Read job status from Redis — implemented in Phase 5."""
    _ = user_id
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Job polling not implemented",
    )
