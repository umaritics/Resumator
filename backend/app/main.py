"""FastAPI application factory — API boundary for LangGraph pipeline and Supabase data."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers.v1 import generate, generations, jobs, resumes

API_DESCRIPTION = """
Resumator V2 backend — multi-agent resume tailoring, ATS scoring, and cover letters.

**Security:** Protected routes require `Authorization: Bearer <supabase_access_token>`.
Optional-auth routes accept anonymous traffic for the try-before-sign-up wizard flow.

**Status:** Production API — async generation jobs via Redis + LangGraph pipeline.
"""


def create_app() -> FastAPI:
    """Build FastAPI app with CORS, routers, and OpenAPI metadata."""
    settings = get_settings()
    app = FastAPI(
        title="Resumator API",
        version="0.2.0",
        description=API_DESCRIPTION,
        openapi_tags=[
            {
                "name": "generation",
                "description": "Async LangGraph pipeline entrypoint",
            },
            {"name": "jobs", "description": "Poll async job status/result"},
            {
                "name": "resumes",
                "description": "Authenticated CRUD for saved resumes",
            },
            {
                "name": "generations",
                "description": "Authenticated generation history (dashboard)",
            },
        ],
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(generate.router, prefix="/api/v1")
    app.include_router(jobs.router, prefix="/api/v1")
    app.include_router(resumes.router, prefix="/api/v1")
    app.include_router(generations.router, prefix="/api/v1")

    @app.get("/health", tags=["system"])
    async def healthcheck() -> dict[str, str]:
        """Liveness probe for any container host — no auth required."""
        return {"status": "ok"}

    return app


app = create_app()
