"""Shared Pydantic models aligned with ARCHITECTURE.md §7.1 and frontend ResumeData."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ContactInfo(BaseModel):
    """Parseable contact block used by ATS formatting checks."""

    model_config = ConfigDict(extra="forbid")

    phone: str = Field(default="", description="Primary phone number")
    address: str = Field(default="", description="Postal or city-level address")
    email: str = Field(default="", description="Professional email")
    linkedin: str = Field(default="", description="LinkedIn profile URL or handle")
    github: str = Field(default="", description="GitHub profile URL or handle")
    website: str = Field(default="", description="Portfolio or personal site")


class ResumeAdditional(BaseModel):
    """Nested lists stored under resume_data.additional in Postgres JSONB."""

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    other_skills: list[str] = Field(
        default_factory=list,
        alias="otherSkills",
        description="Supplementary skills not in the primary skills list",
    )
    certifications: list[str] = Field(default_factory=list)
    awards: list[str] = Field(default_factory=list)


class ResumeData(BaseModel):
    """Structured resume payload exchanged between frontend, agents, and Postgres."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(..., min_length=1, description="Candidate full name")
    title: str = Field(..., min_length=1, description="Professional headline")
    summary: str = Field(default="", description="Professional summary paragraph")
    contact: ContactInfo = Field(default_factory=ContactInfo)
    experiences: list[dict[str, Any]] = Field(default_factory=list)
    education: list[dict[str, Any]] = Field(default_factory=list)
    projects: list[dict[str, Any]] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    additional: ResumeAdditional = Field(default_factory=ResumeAdditional)


class JDAnalysis(BaseModel):
    """Output of jd_analyzer_agent — cacheable by JD content hash."""

    model_config = ConfigDict(extra="forbid")

    required_skills: list[str] = Field(default_factory=list)
    nice_to_have_skills: list[str] = Field(default_factory=list)
    seniority: str = Field(default="mid", description="junior | mid | senior | staff")
    role_title: str = Field(default="")
    company_name: str | None = Field(default=None)
    tone_keywords: list[str] = Field(default_factory=list)


class ATSScore(BaseModel):
    """Hybrid ATS scoring output — sub-scores combine code + LLM checks."""

    model_config = ConfigDict(extra="forbid")

    overall: int = Field(..., ge=0, le=100)
    keyword_match: int = Field(..., ge=0, le=100)
    formatting: int = Field(..., ge=0, le=100)
    semantic_relevance: int = Field(..., ge=0, le=100)
    suggestions: list[str] = Field(default_factory=list)
