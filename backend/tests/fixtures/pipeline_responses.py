"""Sample JSON payloads returned by FakeLLMProvider in pipeline graph tests."""

from __future__ import annotations

SAMPLE_PARSED_RESUME = {
    "name": "Jane Doe",
    "title": "Software Engineer",
    "summary": "Backend developer with API experience.",
    "contact": {
        "phone": "",
        "address": "",
        "email": "jane@example.com",
        "linkedin": "",
        "github": "",
        "website": "",
    },
    "experiences": [{"title": "Engineer", "company": "Acme", "dates": "2020-2024"}],
    "education": [],
    "projects": [],
    "skills": ["Python", "FastAPI"],
    "languages": ["English"],
    "additional": {"otherSkills": [], "certifications": [], "awards": []},
}

SAMPLE_JD_ANALYSIS = {
    "required_skills": ["Python", "FastAPI"],
    "nice_to_have_skills": ["Redis"],
    "seniority": "mid",
    "role_title": "Backend Engineer",
    "company_name": "Acme Corp",
    "tone_keywords": ["collaborative", "pragmatic"],
}

SAMPLE_TAILORED_RESUME = {
    **SAMPLE_PARSED_RESUME,
    "summary": "Backend engineer specializing in Python APIs and resilient systems.",
    "skills": ["Python", "FastAPI", "Redis"],
}

SAMPLE_ATS_SCORE = {
    "overall": 82,
    "keyword_match": 85,
    "formatting": 90,
    "semantic_relevance": 72,
    "suggestions": ["Add a metric to the Acme bullet"],
}

SAMPLE_COVER_LETTER = (
    "Dear Hiring Manager,\n\n"
    "I am excited to apply for the Backend Engineer role at Acme Corp.\n\n"
    "Sincerely,\nJane Doe"
)
