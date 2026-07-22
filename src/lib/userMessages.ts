/** User-safe copy — never surface raw API or validation errors in the UI. */

export const GENERATION_FAILED_MESSAGE =
  "We couldn't generate your resume right now. Please try again in a moment.";

export const API_UNREACHABLE_MESSAGE =
  "We can't reach the resume server right now. Please try again in a few minutes.";

export const UPLOAD_FAILED_MESSAGE =
  "We couldn't read your file. Please fill in your details manually.";

/** Log technical detail to the console only (devtools / monitoring). */
export function logClientError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
}

/** Prefer a network-unreachable message when fetch itself fails. */
export function messageForGenerationError(error: unknown): string {
  if (error instanceof TypeError) {
    return API_UNREACHABLE_MESSAGE;
  }
  if (error instanceof Error && error.message === API_UNREACHABLE_MESSAGE) {
    return API_UNREACHABLE_MESSAGE;
  }
  return GENERATION_FAILED_MESSAGE;
}
