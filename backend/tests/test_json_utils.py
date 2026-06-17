"""LLM JSON response normalization."""

from __future__ import annotations

from app.pipeline.json_utils import extract_json_text


def test_extract_json_text_strips_json_code_fence() -> None:
    raw = """```json
{
  "required_skills": ["Python"],
  "seniority": "mid"
}
```"""
    assert extract_json_text(raw).startswith("{")
    assert "required_skills" in extract_json_text(raw)
    assert "```" not in extract_json_text(raw)


def test_extract_json_text_strips_plain_code_fence() -> None:
    raw = '```\n{"role_title": "Engineer"}\n```'
    assert extract_json_text(raw) == '{"role_title": "Engineer"}'


def test_extract_json_text_leaves_bare_json_unchanged() -> None:
    raw = '{"required_skills": []}'
    assert extract_json_text(raw) == raw
