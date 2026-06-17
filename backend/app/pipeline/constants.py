"""User-facing progress copy keyed by LangGraph node id."""

STAGE_MESSAGES = {
    "starting": "Starting generation…",
    "preprocess_parallel": "Analyzing resume and job description…",
    "tailoring_agent": "Tailoring your resume…",
    "postprocess_parallel": "Scoring ATS fit and drafting cover letter…",
    "complete": "Generation complete",
    "failed": "Generation failed",
}
