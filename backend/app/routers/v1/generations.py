"""Generation history routes for dashboard — Postgres read in Phase 7."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import require_user_id

router = APIRouter(prefix="/generations", tags=["generations"])


@router.get(
    "",
    response_model=list[dict[str, Any]],
    summary="List past generation runs for the authenticated user",
    responses={
        status.HTTP_200_OK: {"description": "Generation history with latency metadata"},
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Missing or invalid Supabase JWT — security scope: authenticated"
        },
        status.HTTP_501_NOT_IMPLEMENTED: {"description": "Postgres read not yet wired"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Unexpected server failure"},
    },
)
async def list_generations(
    user_id: Annotated[str, Depends(require_user_id)],
) -> list[dict[str, Any]]:
    """Return rows from public.generations filtered by JWT sub."""
    _ = user_id
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Generation history not implemented",
    )
