"""Async generation endpoint placeholder — LangGraph pipeline wires in Phase 4."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import optional_user_id
from app.schemas.jobs import GenerateRequest

router = APIRouter(prefix="/generate", tags=["generation"])


@router.post(
    "",
    summary="Start resume tailoring pipeline",
    description=(
        "Accepts resume JSON and optional job description, enqueues a background "
        "LangGraph job, and returns a job id for polling. Anonymous access allowed "
        "with stricter rate limits (Phase 3)."
    ),
    responses={
        status.HTTP_501_NOT_IMPLEMENTED: {
            "description": "Pipeline not yet implemented (Phase 4)",
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
    user_id: Annotated[str | None, Depends(optional_user_id)] = None,
) -> None:
    """Validate input and enqueue pipeline — business logic arrives in Phase 4."""
    _ = user_id  # rate-limit bucket key in Phase 3
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Generation pipeline not implemented",
    )
