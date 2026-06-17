"""Deterministic resume file text extraction — pdfplumber for PDF, python-docx for DOCX."""

from __future__ import annotations

import io

import pdfplumber
from docx import Document


class UnsupportedDocumentError(ValueError):
    """Raised when the uploaded extension is not PDF or DOCX."""


def extract_text_from_bytes(content: bytes, filename: str) -> str:
    """Extract plain text from resume bytes based on filename extension.

    Args:
        content: Raw file bytes from multipart upload.
        filename: Original filename — used only for extension detection.

    Returns:
        Normalized plain text with blank lines collapsed.

    Raises:
        UnsupportedDocumentError: Unknown or missing extension.
        ValueError: File parses but yields no extractable text.
    """
    extension = _extension(filename)
    if extension == ".pdf":
        text = _extract_pdf(content)
    elif extension == ".docx":
        text = _extract_docx(content)
    else:
        raise UnsupportedDocumentError(f"Unsupported file type: {filename or '<unknown>'}")

    normalized = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    if not normalized:
        raise ValueError("No text could be extracted from the document")
    return normalized


def _extension(filename: str) -> str:
    if not filename or "." not in filename:
        raise UnsupportedDocumentError("Filename must include an extension")
    return filename[filename.rfind(".") :].lower()


def _extract_pdf(content: bytes) -> str:
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        pages = [page.extract_text() or "" for page in pdf.pages]
    return "\n".join(pages)


def _extract_docx(content: bytes) -> str:
    document = Document(io.BytesIO(content))
    return "\n".join(paragraph.text for paragraph in document.paragraphs)
