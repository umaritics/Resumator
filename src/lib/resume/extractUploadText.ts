/**
 * Extract plain text from uploaded resume files for Gemini structuring.
 * Supports PDF, DOCX, legacy DOC, and plain text.
 */
import mammoth from "mammoth";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const WordExtractor = require("word-extractor");

const MAX_BYTES = 5 * 1024 * 1024;

export class UnsupportedResumeFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedResumeFileError";
  }
}

function extensionOf(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export async function extractUploadText(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  if (buffer.byteLength === 0) {
    throw new UnsupportedResumeFileError("The uploaded file is empty.");
  }
  if (buffer.byteLength > MAX_BYTES) {
    throw new UnsupportedResumeFileError(
      "File is too large. Please upload a file under 5MB.",
    );
  }

  const ext = extensionOf(filename);

  if (ext === "pdf") {
    const pdfData = await pdfParse(buffer);
    return String(pdfData.text || "").trim();
  }

  if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return String(result.value || "").trim();
  }

  if (ext === "doc") {
    const extractor = new WordExtractor();
    const doc = await extractor.extract(buffer);
    return String(doc.getBody() || "").trim();
  }

  if (ext === "txt" || ext === "text" || ext === "md") {
    return buffer.toString("utf-8").trim();
  }

  throw new UnsupportedResumeFileError(
    "Unsupported file type. Please upload a PDF, Word (.doc/.docx), or text (.txt) file.",
  );
}
