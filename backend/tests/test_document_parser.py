"""Document text extraction for PDF and DOCX uploads."""

from __future__ import annotations

import io

import pytest
from docx import Document

from app.services.document_parser import (
    UnsupportedDocumentError,
    extract_text_from_bytes,
)


def _make_docx(*paragraphs: str) -> bytes:
    document = Document()
    for paragraph in paragraphs:
        document.add_paragraph(paragraph)
    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


def test_extract_docx_returns_paragraph_text() -> None:
    content = _make_docx("Jane Doe", "Software Engineer", "Built APIs.")
    text = extract_text_from_bytes(content, "resume.docx")
    assert "Jane Doe" in text
    assert "Software Engineer" in text
    assert "Built APIs." in text


def test_extract_pdf_returns_text(minimal_pdf_bytes: bytes) -> None:
    text = extract_text_from_bytes(minimal_pdf_bytes, "resume.pdf")
    assert "Hello Resume" in text


def test_unsupported_extension_raises() -> None:
    with pytest.raises(UnsupportedDocumentError):
        extract_text_from_bytes(b"plain text", "notes.txt")


def test_empty_filename_raises() -> None:
    with pytest.raises(UnsupportedDocumentError):
        extract_text_from_bytes(b"%PDF", "")
