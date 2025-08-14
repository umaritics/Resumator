"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { div } from "framer-motion/client";
import dynamic from "next/dynamic";
import image from "next/image";
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);

const ResumeMakerForm = () => {
  const [resumeData, setResumeData] = useState({
    name: "",
    title: "",
    summary: "",
    contact: {
      phone: "",
      address: "",
      email: "",
      linkedin: "",
      github: "",
    },
    experiences: [""],
    education: [""],
    skills: [""],
    additional: {
      otherSkills: [""],
      certifications: [""],
      awards: [""],
    },
    profilePic: null as File | null,
  });

  const handleChange = (field: string, value: string) => {
    setResumeData({ ...resumeData, [field]: value });
  };

  const handleContactChange = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      contact: { ...resumeData.contact, [field]: value },
    });
  };
  const handleSubmit = () => {
    // Handle resume generation logic here
    console.log("Resume Data Submitted:", resumeData);
  };
  const [currentStep, setCurrentStep] = useState<
    "ask" | "upload" | "template" | "form"
  >("ask");
  const [uploadedResumeFile, setUploadedResumeFile] = useState<File | null>(
    null
  );

  const handleListChange = (
    field:
      | "experiences"
      | "education"
      | "skills"
      | "certifications"
      | "awards"
      | "otherSkills",
    index: number,
    value: string
  ) => {
    if (["certifications", "awards", "otherSkills"].includes(field)) {
      const updated = [
        ...resumeData.additional[field as keyof typeof resumeData.additional],
      ];
      updated[index] = value;
      setResumeData({
        ...resumeData,
        additional: { ...resumeData.additional, [field]: updated },
      });
    } else if (field === "skills") {
      const updated = [...resumeData.skills];
      updated[index] = value;
      setResumeData({ ...resumeData, skills: updated });
    } else {
      const updated = [...resumeData[field as "experiences" | "education"]];
      updated[index] = value;
      setResumeData({ ...resumeData, [field]: updated });
    }
  };

  const addListItem = (
    field:
      | "experiences"
      | "education"
      | "skills"
      | "certifications"
      | "awards"
      | "otherSkills"
  ) => {
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
    } else if (field === "skills") {
      setResumeData({ ...resumeData, skills: [...resumeData.skills, ""] });
    } else {
      setResumeData({
        ...resumeData,
        [field]: [...resumeData[field as "experiences" | "education"], ""],
      });
    }
  };
  const removeListItem = (
    field:
      | "experiences"
      | "education"
      | "skills"
      | "certifications"
      | "awards"
      | "otherSkills",
    index: number
  ) => {
    if (index === 0) return; // First one stays forever

    if (["certifications", "awards", "otherSkills"].includes(field)) {
      const updated = [
        ...resumeData.additional[field as keyof typeof resumeData.additional],
      ];
      updated.splice(index, 1);
      setResumeData({
        ...resumeData,
        additional: { ...resumeData.additional, [field]: updated },
      });
    } else if (field === "skills") {
      const updated = [...resumeData.skills];
      updated.splice(index, 1);
      setResumeData({ ...resumeData, skills: updated });
    } else {
      const updated = [...resumeData[field as "experiences" | "education"]];
      updated.splice(index, 1);
      setResumeData({ ...resumeData, [field]: updated });
    }
  };

  return (
    <div className="pt-6 mx-auto">
      <Navbar />
      <div className="min-h-screen flex-grow flex flex-col items-center justify-center p-6 w-full max-w-5xl mx-auto">
        <div className="flex-grow flex flex-col items-center justify-center">
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

          {/* Upload & Template Steps */}
          {currentStep === "upload" && (
            <div className="flex flex-col items-center gap-4">
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
                  onClick={() => setCurrentStep("template")}
                >
                  Continue
                </Button>
                <Button variant="ghost" onClick={() => setCurrentStep("ask")}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {currentStep === "template" && (
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-lg font-medium">Select a Resume Template</h2>
              <div className="flex gap-4">
                <Button onClick={() => setCurrentStep("form")}>
                  Template 1
                </Button>
                <Button onClick={() => setCurrentStep("form")}>
                  Template 2
                </Button>
              </div>
              <Button variant="ghost" onClick={() => setCurrentStep("ask")}>
                Back
              </Button>
            </div>
          )}
        </div>
        {currentStep === "form" && (
          <>
            <div className="mt-10">
              <Player
                autoplay
                loop
                src="/animations/resume-maker-animation.json"
                className=" w-60 h-60"
              />
            </div>
            <h1 className="mt-10 text-3xl text-blue-600 font-bold mb-6 flex justify-center text-center">
              Resume Maker
            </h1>
            <Card className="w-full max-w-4xl">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-xl text-blue-600 font-semibold">
                  Personal Info
                </h2>
                <h2 className="text-md text-center text-blue-600 font-semibold mt-6">
                  Profile Picture
                </h2>
                <Input
                  type="file"
                  accept="image/*"
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
                    className="mt-4 w-32 h-32 object-cover rounded-full border flex self-center"
                  />
                )}

                <Input
                  placeholder="Full Name*"
                  value={resumeData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
                <Input
                  placeholder="Job Title*"
                  value={resumeData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
                <Textarea
                  placeholder="Summary - write a brief summary about yourself, AI will do the rest"
                  value={resumeData.summary}
                  onChange={(e) => handleChange("summary", e.target.value)}
                />

                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Contact Information
                </h2>
                <Input
                  placeholder="Phone*"
                  value={resumeData.contact.phone}
                  onChange={(e) => handleContactChange("phone", e.target.value)}
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
                  onChange={(e) => handleContactChange("email", e.target.value)}
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

                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Experiences
                </h2>
                {resumeData.experiences.map((exp, index) => (
                  <div key={index} className="flex gap-2 items-start mt-2">
                    <Textarea
                      placeholder={`Experience ${index + 1}`}
                      value={exp}
                      onChange={(e) =>
                        handleListChange("experiences", index, e.target.value)
                      }
                      //required // required for first instance
                    />
                    {index > 0 && (
                      <Button
                        variant="destructive"
                        onClick={() => removeListItem("experiences", index)}
                      >
                        ⨯
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  className="bg-blue-600 hover:bg-blue-800"
                  onClick={() => addListItem("experiences")}
                >
                  + Add Experience
                </Button>

                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Education
                </h2>
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="flex gap-2 items-start mt-2">
                    <Textarea
                      className="mt-2"
                      placeholder={`Education ${index + 1}`}
                      value={edu}
                      onChange={(e) =>
                        handleListChange("education", index, e.target.value)
                      }
                    />
                    {index > 0 && (
                      <Button
                        variant="destructive"
                        onClick={() => removeListItem("education", index)}
                      >
                        ⨯
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  className="bg-blue-600 hover:bg-blue-800"
                  onClick={() => addListItem("education")}
                >
                  + Add Education
                </Button>

                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Skills
                </h2>
                {resumeData.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2 items-start mt-2">
                    <Input
                      className="mt-2"
                      placeholder={`Skill ${index + 1}`}
                      value={skill}
                      onChange={(e) =>
                        handleListChange("skills", index, e.target.value)
                      }
                    />
                    {index > 0 && (
                      <Button
                        variant="destructive"
                        onClick={() => removeListItem("skills", index)}
                      >
                        ⨯
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  className="bg-blue-600 hover:bg-blue-800"
                  onClick={() => addListItem("skills")}
                >
                  + Add Skill
                </Button>

                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Other Skills
                </h2>
                {resumeData.additional.otherSkills.map((skill, index) => (
                  <div key={index} className="flex gap-2 items-start mt-2">
                    <Input
                      className="mt-2"
                      placeholder={`Other Skill ${
                        index + 1
                      } e.g "Tools", "Google Suite", "Microsoft Office"`}
                      value={skill}
                      onChange={(e) =>
                        handleListChange("otherSkills", index, e.target.value)
                      }
                    />
                    {index > 0 && (
                      <Button
                        variant="destructive"
                        onClick={() => removeListItem("otherSkills", index)}
                      >
                        ⨯
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  className="bg-blue-600 hover:bg-blue-800"
                  onClick={() => addListItem("otherSkills")}
                >
                  + Add Other Skill
                </Button>

                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Certifications
                </h2>
                {resumeData.additional.certifications.map((cert, index) => (
                  <div key={index} className="flex gap-2 items-start mt-2">
                    <Input
                      className="mt-2"
                      placeholder={`Certification ${index + 1}`}
                      value={cert}
                      onChange={(e) =>
                        handleListChange(
                          "certifications",
                          index,
                          e.target.value
                        )
                      }
                    />
                    {index > 0 && (
                      <Button
                        variant="destructive"
                        onClick={() => removeListItem("certifications", index)}
                      >
                        ⨯
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  className="bg-blue-600 hover:bg-blue-800"
                  onClick={() => addListItem("certifications")}
                >
                  + Add Certification
                </Button>

                <h2 className="text-xl text-blue-600 font-semibold mt-6">
                  Awards & Activities
                </h2>
                {resumeData.additional.awards.map((award, index) => (
                  <div key={index} className="flex gap-2 items-start mt-2">
                    <Input
                      className="mt-2"
                      placeholder={`Award/Activity ${index + 1}`}
                      value={award}
                      onChange={(e) =>
                        handleListChange("awards", index, e.target.value)
                      }
                    />
                    {index > 0 && (
                      <Button
                        variant="destructive"
                        onClick={() => removeListItem("awards", index)}
                      >
                        ⨯
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  className="bg-blue-600 hover:bg-blue-800"
                  onClick={() => addListItem("awards")}
                >
                  + Add Award / Activity
                </Button>
              </CardContent>
              <Button
                className=" w-md max-w-lg self-center bg-green-600 hover:bg-green-800"
                onClick={handleSubmit}
              >
                Generate Resume
              </Button>
            </Card>
          </>
        )}
      </div>
      <div className="mt-6 w-full">
        <Footer />
      </div>
    </div>
  );
};

export default ResumeMakerForm;
