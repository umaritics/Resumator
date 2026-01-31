"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import dynamic from "next/dynamic";
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
const dummyData = {
  name: "John Doe",
  title: "Software Engineer",
  summary: "Experienced developer...",
  contact: {
    phone: "123-456-7890",
    address: "New York, NY",
    email: "john@example.com",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
  },
  experiences: [
    "Software Engineer | Tech Co | 2020-Present | Built amazing things",
  ],
  education: ["BS Computer Science | University of Tech | 2019"],
  projects: ["Portfolio Website | React, Next.js | A cool website"],
  skills: ["React", "TypeScript", "Node.js"],
  languages: ["English", "Spanish"],
  additional: {
    certifications: [],
    awards: [],
    otherSkills: [],
  },
};
const ResumeMakerForm = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedResumeFile, setUploadedResumeFile] = useState<File | null>(
    null,
  );
  const [selectedTemplate, setSelectedTemplate] = useState<
    "classic" | "elegant" | "corporate" | "creative"
  >("classic");
  const [currentStep, setCurrentStep] = useState<
    "ask" | "upload" | "template" | "form" | "preview"
  >("ask");

  // --- UPDATED STATE MODEL ---
  const [resumeData, setResumeData] = useState({
    name: "",
    title: "",
    targetJobDescription: "", // For AI tailoring
    summary: "",
    contact: {
      phone: "",
      address: "",
      email: "",
      linkedin: "",
      github: "",
      website: "", // Portfolio URL is common
    },
    experiences: [""],
    education: [""],
    projects: [""], // Crucial for devs
    skills: [""],
    languages: [""], // Spoken languages
    additional: {
      otherSkills: [""],
      certifications: [""],
      awards: [""],
    },
    profilePic: null as File | null,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Ref for the print component
  const printRef = useRef<HTMLDivElement>(null);

  // Hook for printing
  const handlePrint = useReactToPrint({
    contentRef: printRef, // Updated hook syntax for v3+
    documentTitle: `${resumeData.name || "Resume"}`,
  });
  // 1. Load data
  useEffect(() => {
    const savedData = localStorage.getItem("resumeData");
    const savedStep = localStorage.getItem("currentStep");

    if (savedData) {
      // Merge saved data with default state to ensure new fields (like projects) exist if loading old data
      const parsed = JSON.parse(savedData);
      setResumeData((prev) => ({ ...prev, ...parsed }));
    }
    if (savedStep) {
      setCurrentStep(savedStep as "ask" | "upload" | "template" | "form");
    }
    setIsLoaded(true);
  }, []);

  // 2. Save data
  useEffect(() => {
    localStorage.setItem("resumeData", JSON.stringify(resumeData));
    localStorage.setItem("currentStep", currentStep);
  }, [resumeData, currentStep]);

  const handleChange = (field: string, value: string) => {
    setResumeData({ ...resumeData, [field]: value });
  };

  const handleContactChange = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      contact: { ...resumeData.contact, [field]: value },
    });
  };

  // --- GENERIC LIST HANDLERS ---
  // Updated to handle 'projects' and 'languages'
  type ListField =
    | "experiences"
    | "education"
    | "skills"
    | "projects"
    | "languages"
    | "certifications"
    | "awards"
    | "otherSkills";

  const handleListChange = (field: ListField, index: number, value: string) => {
    if (["certifications", "awards", "otherSkills"].includes(field)) {
      const updated = [
        ...resumeData.additional[field as keyof typeof resumeData.additional],
      ];
      updated[index] = value;
      setResumeData({
        ...resumeData,
        additional: { ...resumeData.additional, [field]: updated },
      });
    } else {
      // Handles experiences, education, skills, projects, languages
      const updated = [
        ...(resumeData[field as keyof typeof resumeData] as string[]),
      ];
      updated[index] = value;
      setResumeData({ ...resumeData, [field]: updated });
    }
  };

  const addListItem = (field: ListField) => {
    if (["certifications", "awards", "otherSkills"].includes(field)) {
      setResumeData({
        ...resumeData,
        additional: {
          ...resumeData.additional,
          [field]: [
            ...resumeData.additional[
              field as keyof typeof resumeData.additional
            ],
            "",
          ],
        },
      });
    } else {
      setResumeData({
        ...resumeData,
        [field]: [
          ...(resumeData[field as keyof typeof resumeData] as string[]),
          "",
        ],
      });
    }
  };

  const removeListItem = (field: ListField, index: number) => {
    if (["certifications", "awards", "otherSkills"].includes(field)) {
      const updated = [
        ...resumeData.additional[field as keyof typeof resumeData.additional],
      ];
      updated.splice(index, 1);
      setResumeData({
        ...resumeData,
        additional: { ...resumeData.additional, [field]: updated },
      });
    } else {
      const updated = [
        ...(resumeData[field as keyof typeof resumeData] as string[]),
      ];
      updated.splice(index, 1);
      setResumeData({ ...resumeData, [field]: updated });
    }
  };

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

        setResumeData((prev) => ({
          ...prev,
          name: aiData.name || prev.name,
          title: aiData.title || prev.title,
          summary: aiData.summary || prev.summary,
          targetJobDescription: prev.targetJobDescription, // Keep existing

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
          // If AI detects projects/languages later, we can map them here. For now, keep previous.
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
        }));

        setCurrentStep("template");
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
        setCurrentStep("preview");
      } else {
        throw new Error("Failed to enhance");
      }
    } catch (error) {
      console.error(error);
      alert("AI enhancement failed. Using your original data.");
      setCurrentStep("preview"); // Fallback to preview anyway
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isLoaded)
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
          {currentStep === "ask" && (
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-xl font-semibold text-center">
                Do you already have a resume?
              </h2>
              <div className="flex gap-4">
                <Button onClick={() => setCurrentStep("upload")}>Yes</Button>
                <Button onClick={() => setCurrentStep("template")}>No</Button>
              </div>
            </div>
          )}

          {/* UPLOAD STEP */}
          {currentStep === "upload" && (
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
                      onClick={() => setCurrentStep("ask")}
                    >
                      Back
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TEMPLATE STEP */}
          {currentStep === "template" && (
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
                    setSelectedTemplate("classic");
                    setCurrentStep("form");
                  }}
                >
                  <img
                    src="/template-classic.png"
                    alt="Classic Template"
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
                    setSelectedTemplate("elegant");
                    setCurrentStep("form");
                  }}
                >
                  <img
                    src="/template-elegant.png"
                    alt="Elegant Template"
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
                    setSelectedTemplate("corporate");
                    setCurrentStep("form");
                  }}
                >
                  <img
                    src="/template-corporate.png"
                    alt="Corporate Template"
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
                    setSelectedTemplate("creative");
                    setCurrentStep("form");
                  }}
                >
                  <img
                    src="/template-creative.png"
                    alt="Creative Template"
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
                onClick={() => setCurrentStep("ask")}
                className="mt-4"
              >
                Back
              </Button>
            </div>
          )}
        </div>

        {/* FORM STEP */}
        {currentStep === "form" && (
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
                      setResumeData({
                        ...resumeData,
                        profilePic: e.target.files?.[0] || null,
                      })
                    }
                  />
                  {resumeData.profilePic && (
                    <img
                      src={URL.createObjectURL(resumeData.profilePic)}
                      alt="Profile Preview"
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
                  <div key={index} className="flex gap-2 items-start mt-2">
                    <Textarea
                      placeholder={`Experience ${
                        index + 1
                      } - (Role | Company | Date | Details)`}
                      value={exp}
                      onChange={(e) =>
                        handleListChange("experiences", index, e.target.value)
                      }
                    />
                    {/* ✅ REMOVE BUTTON ALWAYS VISIBLE */}
                    <Button
                      variant="destructive"
                      onClick={() => removeListItem("experiences", index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  className="bg-blue-600 hover:bg-blue-800 mt-2"
                  onClick={() => addListItem("experiences")}
                >
                  + Add Experience
                </Button>

                {/* --- PROJECTS (NEW) --- */}
                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Projects
                </h2>
                {resumeData.projects.map((proj, index) => (
                  <div key={index} className="flex gap-2 items-start mt-2">
                    <Textarea
                      placeholder={`Project ${
                        index + 1
                      } - (Name | Tech Stack | Link | Description)`}
                      value={proj}
                      onChange={(e) =>
                        handleListChange("projects", index, e.target.value)
                      }
                    />
                    <Button
                      variant="destructive"
                      onClick={() => removeListItem("projects", index)}
                    >
                      ×
                    </Button>
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
                  <div key={index} className="flex gap-2 items-start mt-2">
                    <Textarea
                      placeholder={`Education ${
                        index + 1
                      } - (Degree | Institution | Year)`}
                      value={edu}
                      onChange={(e) =>
                        handleListChange("education", index, e.target.value)
                      }
                    />
                    <Button
                      variant="destructive"
                      onClick={() => removeListItem("education", index)}
                    >
                      ×
                    </Button>
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
        {currentStep === "preview" && (
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
              <Button variant="outline" onClick={() => setCurrentStep("form")}>
                Edit Data
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCurrentStep("template")}
              >
                Change Template
              </Button>
            </div>

            {/* THE RESUME PREVIEW (Hidden wrapper for Print) */}
            <div className="overflow-auto w-full flex justify-center bg-gray-100 p-8 rounded-lg border border-gray-200">
              {/* This div is what gets printed */}
              <div ref={printRef} className="bg-white shadow-2xl">
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
