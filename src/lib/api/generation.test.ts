import { describe, expect, it } from "vitest";
import { defaultResumeData } from "@/lib/types/resume";
import {
  buildGeneratePayload,
  isTerminalJobStatus,
  jobPollIntervalMs,
  mergeTailoredResume,
} from "./generation";

describe("buildGeneratePayload", () => {
  it("maps wizard ResumeData to the FastAPI generate body", () => {
    const data = defaultResumeData();
    data.name = "Jane Doe";
    data.title = "Engineer";
    data.targetJobDescription = "Backend Python role";

    const payload = buildGeneratePayload(data);

    expect(payload.job_description).toBe("Backend Python role");
    expect(payload.resume_data.name).toBe("Jane Doe");
    expect(payload.requested).toEqual({ ats_score: false, cover_letter: false });
    expect(payload.resume_data).not.toHaveProperty("profilePic");
    expect(payload.resume_data).not.toHaveProperty("targetJobDescription");
  });

  it("sends null job_description when the wizard field is blank", () => {
    const data = defaultResumeData();
    data.targetJobDescription = "   ";

    expect(buildGeneratePayload(data).job_description).toBeNull();
  });
});

describe("mergeTailoredResume", () => {
  it("preserves frontend-only fields from the current wizard state", () => {
    const current = defaultResumeData();
    current.targetJobDescription = "Keep this JD";
    current.contact.email = "before@example.com";

    const tailored = {
      ...defaultResumeData(),
      name: "Tailored Name",
      contact: { ...defaultResumeData().contact, email: "after@example.com" },
    };

    const merged = mergeTailoredResume(current, tailored);

    expect(merged.name).toBe("Tailored Name");
    expect(merged.targetJobDescription).toBe("Keep this JD");
    expect(merged.contact.email).toBe("after@example.com");
    expect(merged.profilePic).toBeNull();
  });
});

describe("isTerminalJobStatus", () => {
  it("treats done and failed as terminal", () => {
    expect(isTerminalJobStatus("done")).toBe(true);
    expect(isTerminalJobStatus("failed")).toBe(true);
    expect(isTerminalJobStatus("pending")).toBe(false);
    expect(isTerminalJobStatus("running")).toBe(false);
  });
});

describe("jobPollIntervalMs", () => {
  it("stops polling when the job reaches a terminal status", () => {
    expect(jobPollIntervalMs("done")).toBe(false);
    expect(jobPollIntervalMs("failed")).toBe(false);
  });

  it("polls every 1.5s while pending or running", () => {
    expect(jobPollIntervalMs("pending")).toBe(1500);
    expect(jobPollIntervalMs("running")).toBe(1500);
    expect(jobPollIntervalMs(undefined)).toBe(false);
  });
});
