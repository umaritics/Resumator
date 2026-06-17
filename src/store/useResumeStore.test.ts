import { beforeEach, describe, expect, it } from "vitest";
import {
  defaultResumeData,
  type ResumeData,
} from "@/lib/types/resume";
import { useResumeStore } from "./useResumeStore";

const getState = () => useResumeStore.getState();

describe("useResumeStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useResumeStore.setState({
      step: "ask",
      selectedTemplate: "classic",
      resumeData: defaultResumeData(),
    });
  });

  it("updates top-level resume fields via updateResumeData", () => {
    getState().updateResumeData({ name: "Jane Doe", title: "Engineer" });

    expect(getState().resumeData.name).toBe("Jane Doe");
    expect(getState().resumeData.title).toBe("Engineer");
  });

  it("merges partial resume patches without dropping unrelated fields", () => {
    getState().updateResumeData({ name: "Jane Doe" });
    getState().updateResumeData({ summary: "Experienced builder." });

    const { resumeData } = getState();
    expect(resumeData.name).toBe("Jane Doe");
    expect(resumeData.summary).toBe("Experienced builder.");
    expect(resumeData.contact.email).toBe("");
  });

  it("updates wizard step and template selection", () => {
    getState().setStep("form");
    getState().setTemplate("elegant");

    expect(getState().step).toBe("form");
    expect(getState().selectedTemplate).toBe("elegant");
  });

  it("updates nested contact fields", () => {
    getState().updateContact("email", "jane@example.com");
    getState().updateContact("github", "github.com/jane");

    expect(getState().resumeData.contact.email).toBe("jane@example.com");
    expect(getState().resumeData.contact.github).toBe("github.com/jane");
  });

  it("updates string list fields", () => {
    getState().updateListItem("skills", 0, "TypeScript");

    expect(getState().resumeData.skills[0]).toBe("TypeScript");
  });

  it("updates additional list fields stored under resumeData.additional", () => {
    getState().updateListItem("certifications", 0, "AWS Solutions Architect");

    expect(getState().resumeData.additional.certifications[0]).toBe(
      "AWS Solutions Architect",
    );
  });

  it("updates object list entries for experiences", () => {
    getState().updateObjectListItem("experiences", 0, "title", "Staff Engineer");

    expect(getState().resumeData.experiences[0].title).toBe("Staff Engineer");
  });

  it("adds and removes list items", () => {
    getState().addListItem("skills");
    getState().updateListItem("skills", 1, "React");

    expect(getState().resumeData.skills).toEqual(["", "React"]);

    getState().removeListItem("skills", 1);
    expect(getState().resumeData.skills).toEqual([""]);
  });

  it("replaces resume data wholesale with setResumeData", () => {
    const nextData: ResumeData = {
      ...defaultResumeData(),
      name: "Full Replace",
      title: "Designer",
    };

    getState().setResumeData(nextData);

    expect(getState().resumeData.name).toBe("Full Replace");
    expect(getState().resumeData.title).toBe("Designer");
  });

  it("persists resumeData and step to localStorage", async () => {
    getState().setStep("preview");
    getState().updateResumeData({ name: "Persist Me" });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const stored = localStorage.getItem("resumator-resume-store");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.step).toBe("preview");
    expect(parsed.state.resumeData.name).toBe("Persist Me");
  });
});
