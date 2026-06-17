"use client";

/**
 * Poll GET /api/v1/jobs/{id} while a background LangGraph job runs.
 *
 * Uses TanStack Query refetchInterval — stops automatically on done/failed.
 */
import { useQuery } from "@tanstack/react-query";
import {
  fetchJobStatus,
  jobPollIntervalMs,
  type JobResponse,
} from "@/lib/api/generation";

export function useGenerationJob(
  jobId: string | null,
  accessToken?: string | null,
) {
  return useQuery<JobResponse>({
    queryKey: ["generation-job", jobId, accessToken ?? "anonymous"],
    queryFn: () => fetchJobStatus(jobId!, accessToken),
    enabled: Boolean(jobId),
    refetchInterval: (query) => jobPollIntervalMs(query.state.data?.status),
  });
}
