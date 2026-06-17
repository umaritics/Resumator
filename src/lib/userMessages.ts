/** User-safe copy — never surface raw API or validation errors in the UI. */

export const GENERATION_FAILED_MESSAGE =
  "We couldn't generate your resume right now. Please try again in a moment.";

export const UPLOAD_FAILED_MESSAGE =
  "We couldn't read your file. Please fill in your details manually.";

/** Log technical detail to the console only (devtools / monitoring). */
export function logClientError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
}
