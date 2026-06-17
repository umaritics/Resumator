/**
 * Shared resume domain types for the wizard UI and Zustand store.
 *
 * Mirrors the FastAPI `ResumeData` Pydantic model (Phase 2) with frontend-only fields
 * (`targetJobDescription`, `profilePic`). Keeping types centralized prevents schema
 * drift between parse/enhance API routes and persisted store state.
 *
 * `defaultResumeData()` returns a fresh empty wizard skeleton — used by store init and
 * Vitest fixtures. Not persisted directly; the store clones via Zustand actions.
 */
export type WizardStep = "ask" | "upload" | "template" | "form" | "preview";

export type TemplateId = "classic" | "elegant" | "corporate" | "creative";

export interface ContactInfo {
  phone: string;
  address: string;
  email: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface ObjectListItem {
  title: string;
  subtitle: string;
  date: string;
  description?: string;
}

export interface ResumeAdditional {
  otherSkills: string[];
  certifications: string[];
  awards: string[];
}

export interface ResumeData {
  name: string;
  title: string;
  targetJobDescription: string;
  summary: string;
  contact: ContactInfo;
  experiences: ObjectListItem[];
  education: ObjectListItem[];
  projects: ObjectListItem[];
  skills: string[];
  languages: string[];
  additional: ResumeAdditional;
  profilePic: File | null;
}

export type ListField =
  | "experiences"
  | "education"
  | "skills"
  | "projects"
  | "languages"
  | "certifications"
  | "awards"
  | "otherSkills";

/** Factory for empty wizard state — safe to call on every test reset. */
export const defaultResumeData = (): ResumeData => ({
  name: "",
  title: "",
  targetJobDescription: "",
  summary: "",
  contact: {
    phone: "",
    address: "",
    email: "",
    linkedin: "",
    github: "",
    website: "",
  },
  experiences: [{ title: "", subtitle: "", date: "", description: "" }],
  education: [{ title: "", subtitle: "", date: "" }],
  projects: [{ title: "", subtitle: "", date: "", description: "" }],
  skills: [""],
  languages: [""],
  additional: {
    otherSkills: [""],
    certifications: [""],
    awards: [""],
  },
  profilePic: null,
});
