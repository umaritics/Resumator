import React from "react";
import { Award, Globe } from "lucide-react";

// --- TYPES ---
interface ListData {
  title: string;
  subtitle: string;
  date: string;
  description?: string;
}

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
  experiences: ListData[];
  education: ListData[];
  projects: ListData[];
  skills: string[];
  languages: string[];
  additional: {
    certifications: string[];
    awards: string[];
    otherSkills: string[];
  };
  profilePic?: File | null;
}

interface TemplateProps {
  data: ResumeData;
  scale?: number;
}

// --- HELPER: Ensure URLs are clickable links ---
const formatUrl = (url: string) => {
  if (!url) return "#";
  return url.startsWith("http") ? url : `https://${url}`;
};

// =================================================================================================
// 1. TEMPLATE: CLASSIC - Single Column, Dense
// =================================================================================================
export const TemplateClassic: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="font-serif text-black p-8 w-[210mm] min-h-[297mm] mx-auto bg-white">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-4">
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">
          {data.name}
        </h1>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phone && <span>| {data.contact.phone}</span>}
          {data.contact.address && <span>| {data.contact.address}</span>}
          {data.contact.linkedin && (
            <span>
              |{" "}
              <a
                href={formatUrl(data.contact.linkedin)}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-blue-800"
              >
                LinkedIn
              </a>
            </span>
          )}
          {data.contact.github && (
            <span>
              |{" "}
              <a
                href={formatUrl(data.contact.github)}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-blue-800"
              >
                GitHub
              </a>
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experiences?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">
            Experience
          </h2>
          <div className="space-y-3">
            {data.experiences.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold text-sm">
                  <span>
                    {exp.title}
                    {exp.subtitle ? `, ${exp.subtitle}` : ""}
                  </span>
                  <span>{exp.date}</span>
                </div>
                <p className="text-sm mt-1 text-gray-800">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">
            Projects
          </h2>
          <div className="space-y-3">
            {data.projects.map((proj, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between">
                  <h4 className="font-bold text-sm">{proj.title}</h4>
                  <span className="text-sm font-bold">{proj.date}</span>
                </div>
                <div className="text-xs italic text-gray-600 mb-1">
                  {proj.subtitle}
                </div>
                <p className="text-sm text-gray-800">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">
            Education
          </h2>
          {data.education?.length > 0 &&
            data.education.map((edu, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between font-bold text-sm">
                  <span>{edu.title}</span>
                  <span>{edu.date}</span>
                </div>
                <div className="text-sm text-gray-800">{edu.subtitle}</div>
              </div>
            ))}
        </section>
      )}

      {/* Skills & Additional */}
      <section>
        <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">
          Skills & Interests
        </h2>
        <div className="text-sm space-y-1 mt-2">
          {data.skills.length > 0 && (
            <p>
              <span className="font-bold">Technical:</span>{" "}
              {data.skills.join(", ")}
            </p>
          )}
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
// 2. TEMPLATE: ELEGANT - Left Sidebar, Serif
// =================================================================================================
export const TemplateElegant: React.FC<TemplateProps> = ({ data }) => {
  return (
    // Explicit width constraint added to stretch to full A4
    <div className="grid grid-cols-[1fr_2.4fr] w-[210mm] min-h-[297mm] mx-auto bg-[#fdfbf7] text-[#333]">
      {/* Left Sidebar */}
      <div className="p-6 border-r border-[#d4cbb8]">
        <h1 className="text-4xl font-serif text-[#2c3e50] mb-2 leading-none break-words">
          {data.name.split(" ")[0]} <br />
          {data.name.split(" ").slice(1).join(" ")}
        </h1>
        <p className="text-sm tracking-widest uppercase text-gray-500 mb-10">
          {data.title}
        </p>

        {/* Contact */}
        <div className="mb-8 text-sm space-y-2 font-serif">
          <h3 className="text-[#8b7d5b] font-bold tracking-widest uppercase mb-3">
            Contact
          </h3>
          {data.contact.phone && <div>{data.contact.phone}</div>}
          {data.contact.email && (
            <div className="break-all">{data.contact.email}</div>
          )}
          {data.contact.address && <div>{data.contact.address}</div>}

          {data.contact.linkedin && (
            <div>
              <a
                href={formatUrl(data.contact.linkedin)}
                target="_blank"
                rel="noreferrer"
                className="text-[#5dbaa9] hover:underline break-all"
              >
                LinkedIn
              </a>
            </div>
          )}
          {data.contact.github && (
            <div>
              <a
                href={formatUrl(data.contact.github)}
                target="_blank"
                rel="noreferrer"
                className="text-[#5dbaa9] hover:underline break-all"
              >
                GitHub
              </a>
            </div>
          )}
        </div>

        {/* Education */}
        {data.education?.length > 0 && (
          <div className="mb-8 text-sm">
            <h3 className="text-[#8b7d5b] font-bold tracking-widest uppercase mb-3">
              Education
            </h3>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-4">
                <div className="font-bold text-sm">{edu.title}</div>
                <div className="text-xs text-gray-500 mb-1">{edu.subtitle}</div>
                <div className="text-xs text-[#5dbaa9]">{edu.date}</div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        <div className="text-sm">
          <h3 className="text-[#8b7d5b] font-bold tracking-widest uppercase mb-3">
            Key Skills
          </h3>
          <p className="leading-relaxed text-gray-700">
            {data.skills.join(", ")}
          </p>
        </div>
      </div>

      {/* Right Content */}
      <div className="p-8 pt-10">
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
              {data.experiences.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-[#2c3e50]">
                      {exp.title}
                      {exp.subtitle ? `, ${exp.subtitle}` : ""}
                    </span>
                    <span className="text-[#8b7d5b] whitespace-nowrap ml-2">
                      {exp.date}
                    </span>
                  </div>
                  <p className="text-sm mt-2 text-gray-800 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[#8b7d5b] font-serif font-bold tracking-widest uppercase mb-4">
              Projects
            </h3>
            <div className="space-y-6">
              {data.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <h4 className="font-bold text-md text-[#2c3e50]">
                      {proj.title}
                    </h4>
                    <span className="text-xs font-bold text-[#8b7d5b]">
                      {proj.date}
                    </span>
                  </div>
                  <div className="text-xs italic text-gray-500 mb-2">
                    {proj.subtitle}
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =================================================================================================
// 3. TEMPLATE: CORPORATE - Gold Headers, Clean
// =================================================================================================
export const TemplateCorporate: React.FC<TemplateProps> = ({ data }) => {
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-[#f0d587] p-1 px-4 mb-4">
      <h3 className="text-sm font-bold tracking-widest uppercase text-gray-800">
        {title}
      </h3>
    </div>
  );

  return (
    // Explicit width constraint to prevent collapsing
    <div className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto text-gray-800">
      {/* Header */}
      <div className="text-center mb-8 pt-4">
        <h1 className="text-5xl font-light tracking-widest uppercase mb-3 text-gray-700">
          {data.name}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500 font-bold tracking-wide">
          {data.contact.email}
          {data.contact.phone && (
            <>
              <span>|</span> {data.contact.phone}
            </>
          )}
          {data.contact.address && (
            <>
              <span>|</span> {data.contact.address}
            </>
          )}
          {data.contact.linkedin && (
            <>
              <span>|</span>
              <a
                href={formatUrl(data.contact.linkedin)}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 hover:underline"
              >
                LinkedIn
              </a>
            </>
          )}
          {data.contact.github && (
            <>
              <span>|</span>
              <a
                href={formatUrl(data.contact.github)}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 hover:underline"
              >
                GitHub
              </a>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <SectionHeader title="Professional Summary" />
          <p className="text-sm px-4 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="mb-6">
          <SectionHeader title="Skills" />
          <div className="px-4 text-sm leading-relaxed text-gray-700">
            {data.skills.join(", ")}
          </div>
        </div>
      )}

      {/* History */}
      {data.experiences?.length > 0 && (
        <div className="mb-6">
          <SectionHeader title="Work History" />
          <div className="px-4 space-y-6">
            {data.experiences.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold text-sm">
                  <span>
                    {exp.title}
                    {exp.subtitle ? `, ${exp.subtitle}` : ""}
                  </span>
                  <span>{exp.date}</span>
                </div>
                <p className="text-sm mt-1 text-gray-800 leading-relaxed">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <div className="mb-6">
          <SectionHeader title="Projects" />
          <div className="px-4 space-y-6">
            {data.projects.map((proj, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold text-sm">
                  <span>
                    {proj.title}
                    {proj.subtitle ? ` - ${proj.subtitle}` : ""}
                  </span>
                  <span>{proj.date}</span>
                </div>
                <p className="text-sm mt-1 text-gray-800 leading-relaxed">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <div className="mb-6">
          <SectionHeader title="Education" />
          <div className="px-4">
            {data.education.map((edu, i) => (
              <div key={i} className="mb-4">
                <div className="font-bold text-sm flex justify-between">
                  <span>{edu.title}</span>
                  <span className="text-[#5dbaa9] font-normal">{edu.date}</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{edu.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =================================================================================================
// 4. TEMPLATE: CREATIVE - Dark Header, Right Sidebar, Photo
// =================================================================================================
export const TemplateCreative: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="bg-white w-[210mm] min-h-[297mm] mx-auto relative overflow-hidden">
      {/* Top Dark Header */}
      <div className="bg-[#2c3e50] h-[230px] w-full absolute top-0 left-0 z-0"></div>

      <div className="relative z-10 pt-10 px-8 grid grid-cols-[2.6fr_1fr] gap-8 h-full">
        {/* --- LEFT COLUMN (Main) --- */}
        <div>
          {/* Profile Header Block */}
          <div className="flex gap-6 items-start mb-8 text-white min-h-[150px]">
            {data.profilePic && (
              <div className="w-24 h-24 rounded-full border-[3px] border-[#5dbaa9] overflow-hidden bg-gray-300 shrink-0 shadow-md mt-1">
                <img
                  src={URL.createObjectURL(data.profilePic)}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>
            )}
            <div className="flex-1 w-full">
              <h1 className="text-4xl font-bold mb-1">{data.name}</h1>
              <p className="text-[#5dbaa9] text-xl font-medium mb-3">
                {data.title}
              </p>
              {/* Removed max-w-lg so text utilizes the new wider column */}
              <p className="text-sm opacity-90 leading-relaxed w-full pr-2">
                {data.summary}
              </p>
            </div>
          </div>

          {/* Contact Bar (Teal) */}
          <div className="bg-[#5dbaa9] text-white p-3.5 px-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold rounded shadow-sm mb-8">
            {data.contact.email && <span>{data.contact.email}</span>}
            {data.contact.phone && <span>{data.contact.phone}</span>}
            {data.contact.address && <span>{data.contact.address}</span>}
            {data.contact.linkedin && (
              <a
                href={formatUrl(data.contact.linkedin)}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-[#2c3e50]"
              >
                LinkedIn
              </a>
            )}
            {data.contact.github && (
              <a
                href={formatUrl(data.contact.github)}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-[#2c3e50]"
              >
                GitHub
              </a>
            )}
          </div>

          {/* Experiences */}
          {data.experiences?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-[#2c3e50] font-bold text-xl uppercase flex items-center gap-2 mb-4">
                <span className="p-1 bg-[#2c3e50] text-white rounded">
                  <Award size={16} />
                </span>{" "}
                Work Experience
              </h3>
              <div className="border-l-2 border-gray-200 ml-3 pl-5 space-y-8">
                {data.experiences.map((exp, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[25px] top-1.5 w-2 h-2 bg-[#2c3e50] rounded-full"></span>
                    <div className="flex justify-between font-bold text-sm">
                      <span className="text-[#2c3e50]">
                        {exp.title}
                        {exp.subtitle ? `, ${exp.subtitle}` : ""}
                      </span>
                      <span className="text-gray-500 text-xs ml-2">
                        {exp.date}
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-gray-700 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {data.projects?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-[#2c3e50] font-bold text-xl uppercase flex items-center gap-2 mb-4">
                <span className="p-1 bg-[#2c3e50] text-white rounded">
                  <Globe size={16} />
                </span>{" "}
                Projects
              </h3>
              <div className="border-l-2 border-gray-200 ml-3 pl-5 space-y-6">
                {data.projects.map((proj, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[25px] top-1.5 w-2 h-2 bg-[#2c3e50] rounded-full"></span>
                    <div className="flex justify-between">
                      <h4 className="font-bold text-md text-[#2c3e50]">
                        {proj.title}
                      </h4>
                      <span className="text-xs text-gray-500 font-bold">
                        {proj.date}
                      </span>
                    </div>
                    <div className="text-xs italic text-[#5dbaa9] mb-1.5">
                      {proj.subtitle}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN (Sidebar) --- */}
        <div className="relative h-full">
          {/* Pushed down perfectly to sit exactly below the blue header area */}
          <div className="bg-[#f4f6f6] p-6 rounded-md shadow-sm mt-[190px] h-full border border-gray-100">
            {/* Hard Skills */}
            <div className="mb-8">
              <h3 className="font-bold text-[#2c3e50] text-sm tracking-widest uppercase mb-3 flex items-center gap-2">
                Hard Skills
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {data.skills.join(", ")}
              </p>
            </div>

            {/* Soft Skills / Other */}
            {data.additional.otherSkills?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-[#2c3e50] text-sm tracking-widest uppercase mb-3">
                  Soft Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.additional.otherSkills.map((s, i) => (
                    <span
                      key={i}
                      className="bg-[#d5dbdb] text-[#2c3e50] text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            <div className="mb-8">
              <h3 className="font-bold text-[#2c3e50] text-sm tracking-widest uppercase mb-4">
                Education
              </h3>
              {data.education?.length > 0 &&
                data.education.map((edu, i) => (
                  <div key={i} className="mb-5">
                    <div className="font-bold text-sm text-[#2c3e50] leading-snug mb-1">
                      {edu.title}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {edu.subtitle}
                    </div>
                    <div className="text-xs text-[#5dbaa9] font-bold">
                      {edu.date}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
