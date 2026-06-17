"""Request and response models for async generation and job polling."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas import ATSScore, ResumeData


class GenerateOptions(BaseModel):
    """Feature flags selecting optional LangGraph terminal nodes."""

    model_config = ConfigDict(extra="forbid")

    ats_score: bool = Field(default=False, description="Run ats_scoring_agent")
    cover_letter: bool = Field(default=False, description="Run cover_letter_agent")


class GenerateRequest(BaseModel):
    """POST /api/v1/generate body — kicks off background LangGraph pipeline (Phase 4)."""

    model_config = ConfigDict(extra="forbid")

    resume_data: ResumeData = Field(..., description="Current wizard resume payload")
    job_description: str | None = Field(
        default=None,
        description="Optional JD text for tailoring and ATS scoring",
    )
    requested: GenerateOptions = Field(default_factory=GenerateOptions)


class GenerateResponse(BaseModel):
    """Immediate response — client polls /jobs/{job_id} for completion."""

    job_id: str = Field(..., description="UUID referencing Redis job:{id} key")


JobStatus = Literal["pending", "running", "done", "failed"]


class JobResponse(BaseModel):
    """GET /api/v1/jobs/{job_id} polling payload."""

    status: JobStatus
    result: dict[str, Any] | None = Field(
        default=None,
        description="Populated when status=done — tailored resume, ATS, cover letter, meta",
    )
