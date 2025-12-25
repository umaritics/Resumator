import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Github,
  Globe,
  Award,
} from "lucide-react";

// --- TYPES ---
interface ResumeData {
  name: string;
  title: string;
  summary: string;
  contact: {
    phone: string;
    address: string;
    email: string;
    linkedin: string;
    github: string;
    website?: string;
  };
  experiences: string[];
  education: string[];
  projects: string[]; // Added Projects
  skills: string[];
  languages: string[]; // Added Languages
  additional: {
    certifications: string[];
    awards: string[];
    otherSkills: string[];
  };
  profilePic?: File | null;
}

interface TemplateProps {
  data: ResumeData;
  scale?: number; // For print scaling
}

// --- HELPER: Parse "Role | Company | Date | Desc" strings ---
const parseListString = (str: string) => {
  const parts = str.split("|").map((s) => s.trim());
  return {
    title: parts[0] || "",
    subtitle: parts[1] || "",
    date: parts[2] || "",
    description: parts[3] || "",
  };
};

// =================================================================================================
// 1. TEMPLATE: CLASSIC (Based on "Jobby") - Single Column, Dense
// =================================================================================================
export const TemplateClassic: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="font-serif text-black p-8 max-w-[210mm] min-h-[297mm] mx-auto bg-white">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-4">
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">
          {data.name}
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phone && <span>| {data.contact.phone}</span>}
          {data.contact.address && <span>| {data.contact.address}</span>}
          {data.contact.linkedin && <span>| LinkedIn</span>}
          {data.contact.github && <span>| GitHub</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experiences?.length > 0 && data.experiences[0] !== "" && (
        <section className="mb-4">
          <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">
            Experience
          </h2>
          <div className="space-y-3">
            {data.experiences.map((exp, i) => {
              const { title, subtitle, date, description } =
                parseListString(exp);
              return (
                <div key={i}>
                  <div className="flex justify-between font-bold text-sm">
                    <span>
                      {title}
                      {subtitle ? `, ${subtitle}` : ""}
                    </span>
                    <span>{date}</span>
                  </div>
                  <p className="text-sm mt-1 text-gray-800">{description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Projects (Dynamic Section) */}
      {data.projects?.length > 0 && data.projects[0] !== "" && (
        <section className="mb-4">
          <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">
            Projects
          </h2>
          <div className="space-y-3">
            {data.projects.map((proj, i) => {
              const { title, subtitle, date, description } =
                parseListString(proj);
              return (
                <div key={i}>
                  <div className="flex justify-between font-bold text-sm">
                    <span>
                      {title}{" "}
                      <span className="font-normal italic text-gray-600">
                        {subtitle}
                      </span>
                    </span>
                    {date && <span>{date}</span>}
                  </div>
                  <p className="text-sm mt-1">{description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education?.length > 0 && data.education[0] !== "" && (
        <section className="mb-4">
          <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">
            Education
          </h2>
          {data.education.map((edu, i) => {
            const { title, subtitle, date } = parseListString(edu);
            return (
              <div key={i} className="flex justify-between text-sm mb-1">
                <div>
                  <span className="font-bold">{title}</span>, {subtitle}
                </div>
                <span>{date}</span>
              </div>
            );
          })}
        </section>
      )}

      {/* Skills & Additional */}
      <section>
        <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">
          Skills & Interests
        </h2>
        <div className="text-sm">
          <p>
            <span className="font-bold">Technical:</span>{" "}
            {data.skills.join(", ")}
          </p>
          {data.languages.length > 0 && (
            <p>
              <span className="font-bold">Languages:</span>{" "}
              {data.languages.join(", ")}
            </p>
          )}
          {data.additional.certifications.length > 0 && (
            <p>
              <span className="font-bold">Certifications:</span>{" "}
              {data.additional.certifications.join(", ")}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

// =================================================================================================
// 2. TEMPLATE: ELEGANT (Based on "John Doe") - Left Sidebar, Serif
// =================================================================================================
export const TemplateElegant: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-[1fr_2fr] min-h-[297mm] bg-[#fdfbf7] text-[#333]">
      {/* Left Sidebar */}
      <div className="p-8 border-r border-[#d4cbb8]">
        <h1 className="text-4xl font-serif text-[#2c3e50] mb-2 leading-none break-words">
          {data.name.split(" ")[0]} <br />
          {data.name.split(" ").slice(1).join(" ")}
        </h1>
        <p className="text-sm tracking-widest uppercase text-gray-500 mb-12">
          {data.title}
        </p>

        {/* Contact */}
        <div className="mb-8 text-sm space-y-2 font-serif">
          <h3 className="text-[#8b7d5b] font-bold tracking-widest uppercase mb-3">
            Contact
          </h3>
          {data.contact.phone && (
            <div className="flex items-center gap-2">{data.contact.phone}</div>
          )}
          {data.contact.email && (
            <div className="flex items-center gap-2 break-all">
              {data.contact.email}
            </div>
          )}
          {data.contact.address && (
            <div className="flex items-center gap-2">
              {data.contact.address}
            </div>
          )}
          {data.contact.linkedin && (
            <div className="flex items-center gap-2 text-xs">
              {data.contact.linkedin}
            </div>
          )}
        </div>

        {/* Education (Left side in this design) */}
        {data.education?.length > 0 && (
          <div className="mb-8 text-sm">
            <h3 className="text-[#8b7d5b] font-bold tracking-widest uppercase mb-3">
              Education
            </h3>
            {data.education.map((edu, i) => {
              const { title, subtitle, date } = parseListString(edu);
              return (
                <div key={i} className="mb-3">
                  <div className="font-bold">{title}</div>
                  <div className="italic">{subtitle}</div>
                  <div className="text-xs text-gray-500">{date}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Skills */}
        <div className="text-sm">
          <h3 className="text-[#8b7d5b] font-bold tracking-widest uppercase mb-3">
            Key Skills
          </h3>
          <ul className="space-y-1">
            {data.skills.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Content */}
      <div className="p-8 pt-12">
        {/* Summary */}
        <div className="mb-8">
          <h3 className="text-[#8b7d5b] font-serif font-bold tracking-widest uppercase mb-3">
            Summary
          </h3>
          <p className="text-sm leading-relaxed font-serif">{data.summary}</p>
        </div>

        {/* Work Experience */}
        {data.experiences?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[#8b7d5b] font-serif font-bold tracking-widest uppercase mb-4">
              Work Experience
            </h3>
            <div className="space-y-6">
              {data.experiences.map((exp, i) => {
                const { title, subtitle, date, description } =
                  parseListString(exp);
                return (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-[#b08d55] uppercase text-sm">
                        {title}
                      </h4>
                      <span className="text-xs font-serif italic text-gray-500">
                        {date}
                      </span>
                    </div>
                    <div className="font-serif font-semibold text-sm mb-2">
                      {subtitle}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects?.length > 0 && data.projects[0] !== "" && (
          <div className="mb-8">
            <h3 className="text-[#8b7d5b] font-serif font-bold tracking-widest uppercase mb-4">
              Projects
            </h3>
            <div className="space-y-6">
              {data.projects.map((proj, i) => {
                const { title, subtitle, description } = parseListString(proj);
                return (
                  <div key={i}>
                    <div className="font-bold text-[#b08d55] uppercase text-sm">
                      {title}
                    </div>
                    <div className="text-xs italic mb-1">{subtitle}</div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =================================================================================================
// 3. TEMPLATE: CORPORATE (Based on "Maya") - Gold Headers, Clean
// =================================================================================================
export const TemplateCorporate: React.FC<TemplateProps> = ({ data }) => {
  {
    /* Section Helper */
  }
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-[#f0d587] p-1 px-4 mb-4">
      <h3 className="text-sm font-bold tracking-widest uppercase text-gray-800">
        {title}
      </h3>
    </div>
  );
  return (
    <div className="bg-white p-10 max-w-[210mm] min-h-[297mm] mx-auto text-gray-800">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-light tracking-widest uppercase mb-2 text-gray-700">
          {data.name}
        </h1>
        <div className="flex justify-center gap-4 text-xs text-gray-500 font-bold tracking-wide">
          {data.contact.email} <span>|</span> {data.contact.phone}{" "}
          <span>|</span> {data.contact.address}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <SectionHeader title="Professional Summary" />
        <p className="text-sm px-4">{data.summary}</p>
      </div>

      {/* Skills - 2 Col split inside */}
      <div className="mb-6">
        <SectionHeader title="Skills" />
        <div className="grid grid-cols-2 gap-x-10 px-4 text-sm">
          <ul className="list-disc ml-4 space-y-1">
            {data.skills
              .slice(0, Math.ceil(data.skills.length / 2))
              .map((s, i) => (
                <li key={i}>{s}</li>
              ))}
          </ul>
          <ul className="list-disc ml-4 space-y-1">
            {data.skills
              .slice(Math.ceil(data.skills.length / 2))
              .map((s, i) => (
                <li key={i}>{s}</li>
              ))}
          </ul>
        </div>
      </div>

      {/* History */}
      <div className="mb-6">
        <SectionHeader title="Work History" />
        <div className="px-4 space-y-6">
          {data.experiences.map((exp, i) => {
            const { title, subtitle, date, description } = parseListString(exp);
            return (
              <div key={i} className="grid grid-cols-[1fr_3fr] gap-4">
                <div>
                  <div className="text-xs text-gray-500 font-bold">{date}</div>
                  <div className="font-bold text-sm">{title}</div>
                  <div className="text-xs">{subtitle}</div>
                </div>
                <div className="text-sm">{description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Education */}
      <div className="mb-6">
        <SectionHeader title="Education" />
        <div className="px-4">
          {data.education.map((edu, i) => {
            const { title, subtitle, date } = parseListString(edu);
            return (
              <div key={i} className="mb-2">
                <div className="text-xs font-bold text-gray-500">{date}</div>
                <div className="font-bold text-sm">
                  {title}: {subtitle}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// =================================================================================================
// 4. TEMPLATE: CREATIVE (Based on "Will") - Dark Header, Right Sidebar, Photo
// =================================================================================================
export const TemplateCreative: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="bg-white min-h-[297mm] relative">
      {/* Top Dark Header */}
      <div className="bg-[#2c3e50] h-48 w-full absolute top-0 left-0"></div>

      <div className="relative z-10 pt-10 px-10 grid grid-cols-[2fr_1fr] gap-8">
        {/* --- LEFT COLUMN (Main) --- */}
        <div>
          {/* Profile Header Block */}
          <div className="flex gap-6 items-center mb-10 text-white">
            {data.profilePic && (
              <div className="w-32 h-32 rounded-full border-4 border-[#5dbaa9] overflow-hidden bg-gray-300 shrink-0">
                <img
                  src={URL.createObjectURL(data.profilePic)}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold mb-1">{data.name}</h1>
              <p className="text-[#5dbaa9] text-xl font-medium mb-4">
                {data.title}
              </p>
              <p className="text-xs opacity-90 max-w-md leading-relaxed">
                {data.summary}
              </p>
            </div>
          </div>

          {/* Contact Bar (Teal) */}
          <div className="bg-[#5dbaa9] text-white p-3 px-6 flex justify-between text-xs font-bold rounded mb-10">
            <span>{data.contact.email}</span>
            <span>{data.contact.phone}</span>
            <span>{data.contact.address}</span>
          </div>

          {/* Experiences */}
          <div className="mb-8">
            <h3 className="text-[#2c3e50] font-bold text-xl uppercase flex items-center gap-2 mb-4">
              <span className="p-1 bg-[#2c3e50] text-white rounded">
                <Award size={16} />
              </span>{" "}
              Work Experience
            </h3>
            <div className="border-l-2 border-gray-200 ml-3 pl-6 space-y-8">
              {data.experiences.map((exp, i) => {
                const { title, subtitle, date, description } =
                  parseListString(exp);
                return (
                  <div key={i} className="relative">
                    <span className="absolute -left-[31px] top-1 w-3 h-3 bg-[#5dbaa9] rounded-full"></span>
                    <h4 className="font-bold text-lg">{title}</h4>
                    <div className="text-[#5dbaa9] font-medium text-sm mb-2">
                      {subtitle}
                    </div>
                    <div className="text-xs text-gray-400 mb-2">{date}</div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Projects */}
          {data.projects?.length > 0 && data.projects[0] !== "" && (
            <div className="mb-8">
              <h3 className="text-[#2c3e50] font-bold text-xl uppercase flex items-center gap-2 mb-4">
                <span className="p-1 bg-[#2c3e50] text-white rounded">
                  <Globe size={16} />
                </span>{" "}
                Projects
              </h3>
              <div className="border-l-2 border-gray-200 ml-3 pl-6 space-y-6">
                {data.projects.map((proj, i) => {
                  const { title, subtitle, description } =
                    parseListString(proj);
                  return (
                    <div key={i} className="relative">
                      <span className="absolute -left-[31px] top-1 w-3 h-3 bg-[#5dbaa9] rounded-full"></span>
                      <h4 className="font-bold text-md">{title}</h4>
                      <div className="text-xs italic text-gray-500 mb-1">
                        {subtitle}
                      </div>
                      <p className="text-sm text-gray-600">{description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN (Sidebar) --- */}
        <div className="pt-40">
          {" "}
          {/* Push down to clear header */}
          <div className="bg-[#f0f0f0] p-6 rounded h-full">
            {/* Hard Skills */}
            <div className="mb-8">
              <h3 className="font-bold text-[#2c3e50] text-lg mb-4 flex items-center gap-2">
                HARD SKILLS
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {data.skills.map((s, i) => (
                  <li key={i} className="border-b border-gray-300 pb-1">
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Soft Skills / Other */}
            {data.additional.otherSkills?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-[#2c3e50] text-lg mb-4">
                  SOFT SKILLS
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.additional.otherSkills.map((s, i) => (
                    <span
                      key={i}
                      className="bg-[#aab7b8] text-white text-xs px-2 py-1 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            <div className="mb-8">
              <h3 className="font-bold text-[#2c3e50] text-lg mb-4">
                EDUCATION
              </h3>
              {data.education.map((edu, i) => {
                const { title, subtitle, date } = parseListString(edu);
                return (
                  <div key={i} className="mb-4">
                    <div className="font-bold text-sm">{title}</div>
                    <div className="text-xs text-gray-500 mb-1">{subtitle}</div>
                    <div className="text-xs text-[#5dbaa9]">{date}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
