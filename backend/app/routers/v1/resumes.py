"""Authenticated saved-resume routes — Postgres persistence in Phase 5."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import require_user_id
from app.schemas import ResumeData

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.get(
    "",
    response_model=list[ResumeData],
    summary="List saved resumes for the authenticated user",
    responses={
        status.HTTP_200_OK: {"description": "User-owned resume documents"},
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Missing or invalid Supabase JWT — security scope: authenticated"
        },
        status.HTTP_501_NOT_IMPLEMENTED: {"description": "Postgres read not yet wired"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Unexpected server failure"},
    },
)
async def list_resumes(
    user_id: Annotated[str, Depends(require_user_id)],
) -> list[ResumeData]:
    """Fetch resumes where user_id matches JWT sub — RLS enforced at Postgres layer."""
    _ = user_id
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Resume listing not implemented",
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Persist a resume for the authenticated user",
    responses={
        status.HTTP_201_CREATED: {"description": "Resume saved"},
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Missing or invalid Supabase JWT — security scope: authenticated"
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {"description": "Invalid ResumeData body"},
        status.HTTP_501_NOT_IMPLEMENTED: {"description": "Postgres write not yet wired"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Unexpected server failure"},
    },
)
async def create_resume(
    body: ResumeData,
    user_id: Annotated[str, Depends(require_user_id)],
) -> dict[str, str]:
    """Insert into public.resumes — business logic arrives in Phase 5."""
    _ = body, user_id
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Resume creation not implemented",
    )
