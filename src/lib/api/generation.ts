/**
 * FastAPI generation client and pure helpers for async job polling (Phase 5).
 *
 * `buildGeneratePayload` strips frontend-only fields before POST /api/v1/generate.
 * `mergeTailoredResume` re-applies wizard-only state after the pipeline returns.
 */
import type { ResumeData } from "@/lib/types/resume";
import { GENERATION_FAILED_MESSAGE, logClientError } from "@/lib/userMessages";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export type JobStatus = "pending" | "running" | "done" | "failed";

export interface GenerateOptions {
  ats_score: boolean;
  cover_letter: boolean;
}

export interface ATSScore {
  overall: number;
  keyword_match: number;
  formatting: number;
  semantic_relevance: number;
  suggestions: string[];
}

export interface GenerationResult {
  tailored_resume: ResumeData;
  jd_analysis?: unknown;
  ats_score?: ATSScore | null;
  cover_letter?: string | null;
  meta?: Record<string, unknown>;
}

export interface JobResponse {
  status: JobStatus;
  stage?: string | null;
  progress_message?: string | null;
  result?: GenerationResult | null;
  error?: string | null;
}

export interface GenerateStartResponse {
  job_id: string;
}

export interface GenerateRequestBody {
  resume_data: Omit<ResumeData, "profilePic" | "targetJobDescription">;
  job_description: string | null;
  requested: GenerateOptions;
}

/** Map wizard state to POST /api/v1/generate JSON — omits File and JD duplicate field. */
export function buildGeneratePayload(
  resumeData: ResumeData,
  requested: GenerateOptions = { ats_score: false, cover_letter: false },
): GenerateRequestBody {
  const { profilePic, targetJobDescription, ...resume_payload } = resumeData;
  void profilePic;
  const trimmedJd = targetJobDescription.trim();

  return {
    resume_data: resume_payload,
    job_description: trimmedJd.length > 0 ? trimmedJd : null,
    requested,
  };
}

/** Apply pipeline output without dropping wizard-only fields. */
export function mergeTailoredResume(
  current: ResumeData,
  tailored: ResumeData,
): ResumeData {
  return {
    ...current,
    ...tailored,
    contact: { ...current.contact, ...tailored.contact },
    additional: { ...current.additional, ...tailored.additional },
    profilePic: current.profilePic,
    targetJobDescription: current.targetJobDescription,
  };
}

export function isTerminalJobStatus(status: JobStatus): boolean {
  return status === "done" || status === "failed";
}

/** TanStack Query refetchInterval callback input — false stops polling. */
export function jobPollIntervalMs(status: JobStatus | undefined): number | false {
  if (!status || isTerminalJobStatus(status)) {
    return false;
  }
  return 1500;
}

async function apiFetch<T>(
  path: string,
  init: RequestInit | undefined,
  accessToken: string | null | undefined,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!response.ok) {
    const detail = await response.text();
    logClientError(`API ${path}`, { status: response.status, detail });
    throw new Error(GENERATION_FAILED_MESSAGE);
  }

  return response.json() as Promise<T>;
}

export async function startGeneration(
  resumeData: ResumeData,
  accessToken?: string | null,
  requested?: GenerateOptions,
): Promise<GenerateStartResponse> {
  return apiFetch<GenerateStartResponse>(
    "/api/v1/generate",
    {
      method: "POST",
      body: JSON.stringify(buildGeneratePayload(resumeData, requested)),
    },
    accessToken,
  );
}

export async function fetchJobStatus(
  jobId: string,
  accessToken?: string | null,
): Promise<JobResponse> {
  return apiFetch<JobResponse>(
    `/api/v1/jobs/${jobId}`,
    { method: "GET" },
    accessToken,
  );
}
