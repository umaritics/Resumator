/**
 * Persisted wizard state store for the resume maker flow.
 *
 * Replaces monolithic `useState` + manual `localStorage` effects. Chosen over Context
 * because nested list mutations (experiences, skills, additional.*) need granular
 * updates without prop drilling; chosen over TanStack Query because draft data is
 * device-local until explicitly saved to Supabase (Phase 5).
 *
 * Persistence: `localStorage` key `resumator-resume-store` via Zustand `persist`.
 * Side effect: `profilePic` (File) is stripped on serialize — re-upload required after refresh.
 *
 * Server I/O: none. AI parse/enhance handlers in the page call `setResumeData` on success.
 *
 * @see docs/phase-1/architectural-context-ledger.md §4
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  defaultResumeData,
  type ListField,
  type ObjectListItem,
  type ResumeData,
  type TemplateId,
  type WizardStep,
} from "@/lib/types/resume";
import type { ATSScore } from "@/lib/api/generation";

interface GenerationResultState {
  atsScore: ATSScore | null;
  coverLetter: string | null;
  generationMeta: Record<string, unknown> | null;
}

interface ResumeStore extends GenerationResultState {
  step: WizardStep;
  selectedTemplate: TemplateId;
  resumeData: ResumeData;
  setStep: (step: WizardStep) => void;
  setTemplate: (template: TemplateId) => void;
  updateResumeData: (patch: Partial<ResumeData>) => void;
  setResumeData: (data: ResumeData) => void;
  updateContact: (field: keyof ResumeData["contact"], value: string) => void;
  updateListItem: (field: ListField, index: number, value: string) => void;
  updateObjectListItem: (
    field: "experiences" | "projects" | "education",
    index: number,
    key: keyof ObjectListItem,
    value: string,
  ) => void;
  addListItem: (field: ListField) => void;
  removeListItem: (field: ListField, index: number) => void;
  setGenerationResult: (result: Partial<GenerationResultState>) => void;
  clearGenerationResult: () => void;
  resetStore: () => void;
}

const initialState = {
  step: "ask" as WizardStep,
  selectedTemplate: "classic" as TemplateId,
  resumeData: defaultResumeData(),
  atsScore: null as ATSScore | null,
  coverLetter: null as string | null,
  generationMeta: null as Record<string, unknown> | null,
};

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      setTemplate: (selectedTemplate) => set({ selectedTemplate }),
      updateResumeData: (patch) =>
        set((state) => ({
          resumeData: { ...state.resumeData, ...patch },
        })),
      setResumeData: (resumeData) => set({ resumeData }),
      updateContact: (field, value) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            contact: { ...state.resumeData.contact, [field]: value },
          },
        })),
      updateListItem: (field, index, value) =>
        set((state) => {
          if (["certifications", "awards", "otherSkills"].includes(field)) {
            const key = field as keyof ResumeData["additional"];
            const updated = [...state.resumeData.additional[key]];
            updated[index] = value;
            return {
              resumeData: {
                ...state.resumeData,
                additional: {
                  ...state.resumeData.additional,
                  [key]: updated,
                },
              },
            };
          }

          const key = field as keyof Pick<
            ResumeData,
            "experiences" | "education" | "skills" | "projects" | "languages"
          >;
          const updated = [...state.resumeData[key]] as string[];
          updated[index] = value;
          return {
            resumeData: { ...state.resumeData, [key]: updated },
          };
        }),
      updateObjectListItem: (field, index, key, value) =>
        set((state) => {
          const updated = [...state.resumeData[field]];
          updated[index] = { ...updated[index], [key]: value };
          return {
            resumeData: { ...state.resumeData, [field]: updated },
          };
        }),
      addListItem: (field) =>
        set((state) => {
          if (["certifications", "awards", "otherSkills"].includes(field)) {
            const key = field as keyof ResumeData["additional"];
            return {
              resumeData: {
                ...state.resumeData,
                additional: {
                  ...state.resumeData.additional,
                  [key]: [...state.resumeData.additional[key], ""],
                },
              },
            };
          }

          if (field === "experiences" || field === "projects") {
            return {
              resumeData: {
                ...state.resumeData,
                [field]: [
                  ...state.resumeData[field],
                  { title: "", subtitle: "", date: "", description: "" },
                ],
              },
            };
          }

          if (field === "education") {
            return {
              resumeData: {
                ...state.resumeData,
                education: [
                  ...state.resumeData.education,
                  { title: "", subtitle: "", date: "" },
                ],
              },
            };
          }

          const key = field as "skills" | "languages";
          return {
            resumeData: {
              ...state.resumeData,
              [key]: [...state.resumeData[key], ""],
            },
          };
        }),
      removeListItem: (field, index) =>
        set((state) => {
          if (["certifications", "awards", "otherSkills"].includes(field)) {
            const key = field as keyof ResumeData["additional"];
            const updated = [...state.resumeData.additional[key]];
            updated.splice(index, 1);
            return {
              resumeData: {
                ...state.resumeData,
                additional: {
                  ...state.resumeData.additional,
                  [key]: updated,
                },
              },
            };
          }

          if (field === "experiences" || field === "projects") {
            const updated = [...state.resumeData[field]];
            updated.splice(index, 1);
            return {
              resumeData: { ...state.resumeData, [field]: updated },
            };
          }

          if (field === "education") {
            const updated = [...state.resumeData.education];
            updated.splice(index, 1);
            return {
              resumeData: { ...state.resumeData, education: updated },
            };
          }

          const key = field as "skills" | "languages";
          const updated = [...state.resumeData[key]];
          updated.splice(index, 1);
          return {
            resumeData: { ...state.resumeData, [key]: updated },
          };
        }),
      setGenerationResult: (result) =>
        set((state) => ({
          atsScore: result.atsScore ?? state.atsScore,
          coverLetter: result.coverLetter ?? state.coverLetter,
          generationMeta: result.generationMeta ?? state.generationMeta,
        })),
      clearGenerationResult: () =>
        set({
          atsScore: null,
          coverLetter: null,
          generationMeta: null,
        }),
      resetStore: () => set(initialState),
    }),
    {
      name: "resumator-resume-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        step: state.step === "preview" ? "ask" : state.step,
        selectedTemplate: state.selectedTemplate,
        resumeData: {
          ...state.resumeData,
          profilePic: null,
        },
      }),
      onRehydrateStorage: () => (state) => {
        // Preview is a terminal view — never trap users there after refresh.
        if (state?.step === "preview") {
          state.step = "ask";
        }
      },
    },
  ),
);

/** True when the persisted draft has something worth continuing. */
export function hasDraftResume(data: ResumeData): boolean {
  return Boolean(
    data.name.trim() ||
      data.title.trim() ||
      data.summary.trim() ||
      data.contact.email.trim() ||
      data.experiences.some((item) => item.title.trim() || item.subtitle.trim()),
  );
}
