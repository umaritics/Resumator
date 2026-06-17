"use client";

import { useState, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import type { ListField, ResumeData } from "@/lib/types/resume";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ResumeScaler } from "@/components/ResumeScaler";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import {
  TemplateClassic,
  TemplateElegant,
  TemplateCorporate,
  TemplateCreative,
} from "@/components/resumeTemplates";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false },
);
const ResumeMakerForm = () => {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedResumeFile, setUploadedResumeFile] = useState<File | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const step = useResumeStore((state) => state.step);
  const selectedTemplate = useResumeStore((state) => state.selectedTemplate);
  const resumeData = useResumeStore((state) => state.resumeData);
  const setStep = useResumeStore((state) => state.setStep);
  const setTemplate = useResumeStore((state) => state.setTemplate);
  const updateResumeData = useResumeStore((state) => state.updateResumeData);
  const setResumeData = useResumeStore((state) => state.setResumeData);
  const updateContact = useResumeStore((state) => state.updateContact);
  const updateListItem = useResumeStore((state) => state.updateListItem);
  const updateObjectListItem = useResumeStore(
    (state) => state.updateObjectListItem,
  );
  const addListItem = useResumeStore((state) => state.addListItem);
  const removeListItem = useResumeStore((state) => state.removeListItem);

  const handleChange = (field: string, value: string) => {
    updateResumeData({ [field]: value } as Partial<ResumeData>);
  };

  const handleContactChange = (field: string, value: string) => {
    updateContact(field as keyof ResumeData["contact"], value);
  };

  const handleListChange = (field: ListField, index: number, value: string) => {
    updateListItem(field, index, value);
  };

  const handleObjectListChange = (
    field: "experiences" | "projects" | "education",
    index: number,
    key: "title" | "subtitle" | "date" | "description",
    value: string,
  ) => {
    updateObjectListItem(field, index, key, value);
  };

  // Ref for the print component
  const printRef = useRef<HTMLDivElement>(null);

  // Hook for printing
  const handlePrint = useReactToPrint({
    contentRef: printRef, // Updated hook syntax for v3+
    documentTitle: `${resumeData.name || "Resume"}`,
  });
  useEffect(() => {
    const finishHydration = useResumeStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    if (useResumeStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    const legacyData = localStorage.getItem("resumeData");
    const legacyStep = localStorage.getItem("step");
    if (legacyData) {
      try {
        const parsed = JSON.parse(legacyData);
        setResumeData({
          ...useResumeStore.getState().resumeData,
          ...parsed,
          profilePic: null,
        });
        localStorage.removeItem("resumeData");
      } catch {
        localStorage.removeItem("resumeData");
      }
    }
    if (legacyStep) {
      setStep(
        legacyStep as "ask" | "upload" | "template" | "form" | "preview",
      );
      localStorage.removeItem("step");
    }

    return finishHydration;
  }, [setResumeData, setStep]);

  const handleFileUpload = async () => {
    if (!uploadedResumeFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedResumeFile);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.data) {
        const aiData = result.data;

        const prev = useResumeStore.getState().resumeData;
        setResumeData({
          ...prev,
          name: aiData.name || prev.name,
          title: aiData.title || prev.title,
          summary: aiData.summary || prev.summary,
          targetJobDescription: prev.targetJobDescription,

          contact: {
            ...prev.contact,
            phone: aiData.contact?.phone || prev.contact.phone,
            address: aiData.contact?.address || prev.contact.address,
            email: aiData.contact?.email || prev.contact.email,
            linkedin: aiData.contact?.linkedin || prev.contact.linkedin,
            github: aiData.contact?.github || prev.contact.github,
            website: aiData.contact?.website || prev.contact.website,
          },

          experiences:
            Array.isArray(aiData.experiences) && aiData.experiences.length > 0
              ? aiData.experiences
              : prev.experiences,
          education:
            Array.isArray(aiData.education) && aiData.education.length > 0
              ? aiData.education
              : prev.education,
          skills:
            Array.isArray(aiData.skills) && aiData.skills.length > 0
              ? aiData.skills
              : prev.skills,
          projects: prev.projects,
          languages: prev.languages,

          additional: {
            ...prev.additional,
            certifications: Array.isArray(aiData.additional?.certifications)
              ? aiData.additional.certifications
              : prev.additional.certifications,
            awards: Array.isArray(aiData.additional?.awards)
              ? aiData.additional.awards
              : prev.additional.awards,
            otherSkills: Array.isArray(aiData.additional?.otherSkills)
              ? aiData.additional.otherSkills
              : prev.additional.otherSkills,
          },
          profilePic: prev.profilePic,
        });

        setStep("template");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to read resume data. Please fill manually.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    try {
      // 1. Send data to AI for polishing
      const response = await fetch("/api/enhance-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData }),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        // 2. Update state with the polished version
        setResumeData(result.data);
        // 3. Move to Preview Step
        setStep("preview");
      } else {
        throw new Error("Failed to enhance");
      }
    } catch (error) {
      console.error(error);
      alert("AI enhancement failed. Using your original data.");
      setStep("preview"); // Fallback to preview anyway
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasHydrated)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (isGenerating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Player
          autoplay
          loop
          src="/animations/resume-maker-animation.json"
          className="w-60 h-60"
        />
        <h2 className="text-2xl font-bold text-blue-600 mt-4 animate-pulse">
          Polishing your resume...
        </h2>
        <p className="text-gray-500 mt-2">
          Optimizing grammar, action verbs, and formatting.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-6 mx-auto">
      <Navbar />
      <div className="min-h-screen flex-grow flex flex-col items-center justify-center p-6 w-full max-w-5xl mx-auto">
        <div className="flex-grow flex flex-col items-center justify-center">
          {/* ASK STEP */}
          {step === "ask" && (
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-xl font-semibold text-center">
                Do you already have a resume?
              </h2>
              <div className="flex gap-4">
                <Button onClick={() => setStep("upload")}>Yes</Button>
                <Button onClick={() => setStep("template")}>No</Button>
              </div>
            </div>
          )}

          {/* UPLOAD STEP */}
          {step === "upload" && (
            <div className="flex flex-col items-center gap-4 min-h-[300px] justify-center">
              {isUploading ? (
                /* --- LOADING STATE --- */
                <div className="flex flex-col items-center justify-center fade-in-animation">
                  <Player
                    autoplay
                    loop
                    src="/animations/resume-maker-animation.json"
                    className="w-60 h-60"
                  />
                  <h2 className="text-xl font-semibold text-blue-600 mt-6 flex items-center gap-1">
                    Analyzing
                    {/* Fading dots effect */}
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse delay-75">.</span>
                    <span className="animate-pulse delay-150">.</span>
                  </h2>
                </div>
              ) : (
                /* --- INPUT STATE --- */
                <>
                  <h2 className="text-lg font-medium">Upload Your Resume</h2>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      setUploadedResumeFile(e.target.files?.[0] || null)
                    }
                  />
                  <div className="flex gap-4">
                    <Button
                      disabled={!uploadedResumeFile}
                      onClick={handleFileUpload}
                    >
                      Continue
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setStep("ask")}
                    >
                      Back
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TEMPLATE STEP */}
          {step === "template" && (
            <div className="w-full max-w-5xl flex flex-col items-center gap-8 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">
                  Choose your look
                </h2>
                <p className="text-gray-500">
                  Select a template to visualize your resume
                </p>
              </div>

              {/* Grid: 2 Columns for Large, Clear Previews */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full px-4">
                {/* --- CLASSIC --- */}
                <div
                  className={`group relative aspect-[210/297] w-full rounded-xl border-2 cursor-pointer overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02] ${
                    selectedTemplate === "classic"
                      ? "border-blue-600 ring-4 ring-blue-100"
                      : "border-gray-200"
                  }`}
                  onClick={() => {
                    setTemplate("classic");
                    setStep("form");
                  }}
                >
                  <Image
                    src="/template-classic.png"
                    alt="Classic Template"
                    width={300}
                    height={400}
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Label Overlay */}
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 pt-10 flex justify-center">
                    <span className="text-white font-semibold tracking-wide">
                      Classic
                    </span>
                  </div>
                </div>

                {/* --- ELEGANT --- */}
                <div
                  className={`group relative aspect-[210/297] w-full rounded-xl border-2 cursor-pointer overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02] ${
                    selectedTemplate === "elegant"
                      ? "border-blue-600 ring-4 ring-blue-100"
                      : "border-gray-200"
                  }`}
                  onClick={() => {
                    setTemplate("elegant");
                    setStep("form");
                  }}
                >
                  <Image
                    src="/template-elegant.png"
                    alt="Elegant Template"
                    width={300}
                    height={400}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 pt-10 flex justify-center">
                    <span className="text-white font-semibold tracking-wide">
                      Elegant
                    </span>
                  </div>
                </div>

                {/* --- CORPORATE --- */}
                <div
                  className={`group relative aspect-[210/297] w-full rounded-xl border-2 cursor-pointer overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02] ${
                    selectedTemplate === "corporate"
                      ? "border-blue-600 ring-4 ring-blue-100"
                      : "border-gray-200"
                  }`}
                  onClick={() => {
                    setTemplate("corporate");
                    setStep("form");
                  }}
                >
                  <Image
                    src="/template-corporate.png"
                    alt="Corporate Template"
                    width={300}
                    height={400}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 pt-10 flex justify-center">
                    <span className="text-white font-semibold tracking-wide">
                      Corporate
                    </span>
                  </div>
                </div>

                {/* --- CREATIVE --- */}
                <div
                  className={`group relative aspect-[210/297] w-full rounded-xl border-2 cursor-pointer overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02] ${
                    selectedTemplate === "creative"
                      ? "border-blue-600 ring-4 ring-blue-100"
                      : "border-gray-200"
                  }`}
                  onClick={() => {
                    setTemplate("creative");
                    setStep("form");
                  }}
                >
                  <Image
                    src="/template-creative.png"
                    alt="Creative Template"
                    width={300}
                    height={400}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 pt-10 flex justify-center">
                    <span className="text-white font-semibold tracking-wide">
                      Creative
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setStep("ask")}
                className="mt-4"
              >
                Back
              </Button>
            </div>
          )}
        </div>

        {/* FORM STEP */}
        {step === "form" && (
          <>
            <h1 className="mt-10 text-3xl text-blue-600 font-bold mb-6 flex justify-center text-center">
              Resume Maker
            </h1>
            <Card className="w-full max-w-4xl">
              <CardContent className="space-y-4 p-6">
                {/* --- PERSONAL INFO --- */}
                <h2 className="text-xl text-blue-600 font-semibold">
                  Personal Info
                </h2>
                <div className="flex flex-col items-center mb-4">
                  <h3 className="text-md text-blue-600 font-semibold">
                    Upload Profile Picture (optional)
                  </h3>
                  <Input
                    type="file"
                    accept="image/*"
                    className="w-full"
                    onChange={(e) =>
                      updateResumeData({
                        profilePic: e.target.files?.[0] || null,
                      })
                    }
                  />
                  {resumeData.profilePic && (
                    <Image
                      src={URL.createObjectURL(resumeData.profilePic)}
                      alt="Profile Preview"
                      width={32}
                      height={32}
                      className="mt-4 w-32 h-32 object-cover rounded-full border"
                    />
                  )}
                </div>

                <Input
                  placeholder="Full Name*"
                  value={resumeData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />

                {/* --- JOB TITLE & DESCRIPTION --- */}
                <Input
                  placeholder="Target Job Title*"
                  value={resumeData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
                {/* ✅ NEW: Job Description Field */}
                <Textarea
                  placeholder="Paste the Job Description here. We will use this to tailor your 'About Me' and skills to match the job."
                  value={resumeData.targetJobDescription}
                  onChange={(e) =>
                    handleChange("targetJobDescription", e.target.value)
                  }
                  className="h-32 border-blue-200"
                />

                <Textarea
                  placeholder="Summary - write a brief summary about yourself, or leave empty to let AI generate it based on the Job Description above."
                  value={resumeData.summary}
                  onChange={(e) => handleChange("summary", e.target.value)}
                />

                {/* --- CONTACT INFO --- */}
                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Phone*"
                    value={resumeData.contact.phone}
                    onChange={(e) =>
                      handleContactChange("phone", e.target.value)
                    }
                    required
                  />
                  <Input
                    placeholder="Address*"
                    value={resumeData.contact.address}
                    onChange={(e) =>
                      handleContactChange("address", e.target.value)
                    }
                    required
                  />
                  <Input
                    placeholder="Email*"
                    value={resumeData.contact.email}
                    onChange={(e) =>
                      handleContactChange("email", e.target.value)
                    }
                    required
                  />
                  <Input
                    placeholder="LinkedIn"
                    value={resumeData.contact.linkedin}
                    onChange={(e) =>
                      handleContactChange("linkedin", e.target.value)
                    }
                  />
                  <Input
                    placeholder="GitHub"
                    value={resumeData.contact.github}
                    onChange={(e) =>
                      handleContactChange("github", e.target.value)
                    }
                  />
                  {/* ✅ NEW: Website */}
                  <Input
                    placeholder="Portfolio / Website"
                    value={resumeData.contact.website}
                    onChange={(e) =>
                      handleContactChange("website", e.target.value)
                    }
                  />
                </div>

                {/* --- EXPERIENCES --- */}
                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Experiences
                </h2>
                {resumeData.experiences.map((exp, index) => (
                  <div
                    key={index}
                    className="relative p-4 border rounded-md bg-gray-50 mt-2 space-y-3"
                  >
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full"
                      onClick={() => removeListItem("experiences", index)}
                    >
                      ×
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <Input
                        placeholder="Job Title (e.g. Data Entry Operator)"
                        value={exp.title}
                        onChange={(e) =>
                          handleObjectListChange(
                            "experiences",
                            index,
                            "title",
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        placeholder="Company"
                        value={exp.subtitle}
                        onChange={(e) =>
                          handleObjectListChange(
                            "experiences",
                            index,
                            "subtitle",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <Input
                      placeholder="Date (e.g. Nov 2025 - Present)"
                      value={exp.date}
                      onChange={(e) =>
                        handleObjectListChange(
                          "experiences",
                          index,
                          "date",
                          e.target.value,
                        )
                      }
                    />
                    <Textarea
                      placeholder="Job Details (Don't worry about perfect grammar, the AI will polish this!)"
                      value={exp.description}
                      onChange={(e) =>
                        handleObjectListChange(
                          "experiences",
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      className="h-24"
                    />
                  </div>
                ))}
                <Button
                  className="bg-blue-600 hover:bg-blue-800 mt-2"
                  onClick={() => addListItem("experiences")}
                >
                  + Add Experience
                </Button>

                {/* --- PROJECTS --- */}
                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Projects
                </h2>
                {resumeData.projects.map((proj, index) => (
                  <div
                    key={index}
                    className="relative p-4 border rounded-md bg-gray-50 mt-2 space-y-3"
                  >
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full"
                      onClick={() => removeListItem("projects", index)}
                    >
                      ×
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <Input
                        placeholder="Project Name"
                        value={proj.title}
                        onChange={(e) =>
                          handleObjectListChange(
                            "projects",
                            index,
                            "title",
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        placeholder="Tech Stack / Role"
                        value={proj.subtitle}
                        onChange={(e) =>
                          handleObjectListChange(
                            "projects",
                            index,
                            "subtitle",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <Input
                      placeholder="Date"
                      value={proj.date}
                      onChange={(e) =>
                        handleObjectListChange(
                          "projects",
                          index,
                          "date",
                          e.target.value,
                        )
                      }
                    />
                    <Textarea
                      placeholder="Project Description"
                      value={proj.description}
                      onChange={(e) =>
                        handleObjectListChange(
                          "projects",
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      className="h-20"
                    />
                  </div>
                ))}
                <Button
                  className="bg-blue-600 hover:bg-blue-800 mt-2"
                  onClick={() => addListItem("projects")}
                >
                  + Add Project
                </Button>

                {/* --- EDUCATION --- */}
                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Education
                </h2>
                {resumeData.education.map((edu, index) => (
                  <div
                    key={index}
                    className="relative p-4 border rounded-md bg-gray-50 mt-2 space-y-3"
                  >
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full"
                      onClick={() => removeListItem("education", index)}
                    >
                      ×
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <Input
                        placeholder="Degree (e.g. BS Computer Science)"
                        value={edu.title}
                        onChange={(e) =>
                          handleObjectListChange(
                            "education",
                            index,
                            "title",
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        placeholder="Institution"
                        value={edu.subtitle}
                        onChange={(e) =>
                          handleObjectListChange(
                            "education",
                            index,
                            "subtitle",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <Input
                      placeholder="Graduation Year"
                      value={edu.date}
                      onChange={(e) =>
                        handleObjectListChange(
                          "education",
                          index,
                          "date",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                ))}
                <Button
                  className="bg-blue-600 hover:bg-blue-800 mt-2"
                  onClick={() => addListItem("education")}
                >
                  + Add Education
                </Button>

                {/* --- SKILLS --- */}
                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Technical Skills
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {resumeData.skills.map((skill, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Skill ${index + 1}`}
                        value={skill}
                        onChange={(e) =>
                          handleListChange("skills", index, e.target.value)
                        }
                      />
                      <Button
                        variant="destructive"
                        onClick={() => removeListItem("skills", index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-800 mt-2"
                  onClick={() => addListItem("skills")}
                >
                  + Add Skill
                </Button>

                {/* --- LANGUAGES (NEW) --- */}
                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Languages
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {resumeData.languages.map((lang, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Language ${
                          index + 1
                        } (e.g. English - Native)`}
                        value={lang}
                        onChange={(e) =>
                          handleListChange("languages", index, e.target.value)
                        }
                      />
                      <Button
                        variant="destructive"
                        onClick={() => removeListItem("languages", index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-800 mt-2"
                  onClick={() => addListItem("languages")}
                >
                  + Add Language
                </Button>

                {/* --- ADDITIONAL SECTIONS --- */}
                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Certifications
                </h2>
                {resumeData.additional.certifications.map((cert, index) => (
                  <div key={index} className="flex gap-2 items-center mt-2">
                    <Input
                      placeholder={`Certification ${index + 1}`}
                      value={cert}
                      onChange={(e) =>
                        handleListChange(
                          "certifications",
                          index,
                          e.target.value,
                        )
                      }
                    />
                    <Button
                      variant="destructive"
                      onClick={() => removeListItem("certifications", index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  className="bg-blue-600 hover:bg-blue-800 mt-2"
                  onClick={() => addListItem("certifications")}
                >
                  + Add Certification
                </Button>

                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Awards & Activities
                </h2>
                {resumeData.additional.awards.map((award, index) => (
                  <div key={index} className="flex gap-2 items-center mt-2">
                    <Input
                      placeholder={`Award/Activity ${index + 1}`}
                      value={award}
                      onChange={(e) =>
                        handleListChange("awards", index, e.target.value)
                      }
                    />
                    <Button
                      variant="destructive"
                      onClick={() => removeListItem("awards", index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  className="bg-blue-600 hover:bg-blue-800 mt-2"
                  onClick={() => addListItem("awards")}
                >
                  + Add Award
                </Button>

                {/* Removed "Other Skills" (redundant with Technical Skills + Languages usually, but you can keep it if you really want) */}
              </CardContent>
              <div className="p-6 flex justify-center">
                <Button
                  className="w-full max-w-lg bg-green-600 hover:bg-green-800 text-lg py-6"
                  onClick={handleSubmit}
                >
                  Generate Resume
                </Button>
              </div>
            </Card>
          </>
        )}

        {/* PREVIEW & DOWNLOAD STEP */}
        {step === "preview" && (
          <div className="w-full flex flex-col items-center gap-6 pb-10 mt-10">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                Your Resume is Ready!
              </h1>
              <p className="text-gray-500">
                Review the AI-polished version below.
              </p>
            </div>

            <div className="flex gap-4 sticky top-4 z-50 bg-white/80 backdrop-blur p-2 rounded-md shadow-lg border">
              <Button
                onClick={() => handlePrint()}
                className="bg-green-600 hover:bg-green-700 font-bold px-8 shadow-md"
              >
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => setStep("form")}>
                Edit Data
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep("template")}
              >
                Change Template
              </Button>
            </div>

            {/* THE RESUME PREVIEW (Hidden wrapper for Print) */}
            <div className="overflow-auto w-full flex justify-center bg-gray-100 p-8 rounded-lg border border-gray-200">
              {/* This div is what gets printed */}
              <div ref={printRef} className="bg-white shadow-2xl">
                <ResumeScaler>
                  {selectedTemplate === "classic" && (
                    <TemplateClassic data={resumeData} />
                  )}
                  {selectedTemplate === "elegant" && (
                    <TemplateElegant data={resumeData} />
                  )}
                  {selectedTemplate === "corporate" && (
                    <TemplateCorporate data={resumeData} />
                  )}
                  {selectedTemplate === "creative" && (
                    <TemplateCreative data={resumeData} />
                  )}
                </ResumeScaler>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 w-full">
        <Footer />
      </div>
    </div>
  );
};

export default ResumeMakerForm;
