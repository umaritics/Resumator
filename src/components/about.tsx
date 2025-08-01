import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How to use Resumator - Resume Creator?",
    answer:
      "To use Resumator, sign up and choose how you want to start — from scratch, an old resume, or LinkedIn import. Then use the drag-and-drop builder and templates to customize your resume.",
  },
  {
    question:
      "Why do I have to make a different resume for every job application?",
    answer:
      "Tailoring your resume for each job ensures it matches the job description and increases your chances of passing ATS filters and impressing recruiters.",
  },
  {
    question: "Should I use a resume template in 2025?",
    answer:
      "Absolutely! A well-designed, modern template helps your resume stand out and ensures consistent formatting, which is essential in 2025's competitive job market.",
  },
  {
    question: "Should my resume be in PDF or Word format?",
    answer:
      "PDF is recommended because it preserves layout and styling across devices and is preferred by most recruiters and ATS systems.",
  },
  {
    question: "Should I send a cover letter with my resume?",
    answer:
      "Yes. A cover letter adds personality and context to your application, giving you a chance to explain your fit beyond the resume.",
  },
];

export default function AboutSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="about" className="bg-gray-50 py-16 px-6 md:px-24 mt-36">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-6xl font-bold text-gray-900 mb-16 text-center">
          About Us
        </h2>
        <p className="text-lg text-gray-700 mb-4">
          <strong>
            What makes Resumator the perfect tool to prepare your job
            application?
          </strong>
        </p>
        <p className="text-gray-700 mb-4">
          Resumator helps you create a resume to be proud of. It&apos;s modern
          and people remember it. The tool guides you every step of the process,
          so you can highlight your achievements, attitude, and personality.
          It&apos;s easy. And actually fun!
        </p>
        <p className="text-gray-700 mb-4">
          Resumator has helped users stand out even in companies such as
          Spotify, Tesla, Google, and many others. By using Resumator, you can
          take advantage of:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
          <li>
            Drag-and-drop Resume Builder with professional resume templates for
            every career situation.
          </li>
          <li>
            Resume and CV examples with modern CV templates for global and
            academic roles.
          </li>
          <li>Cover Letter Builder with templates and hundreds of examples.</li>
          <li>Real resume examples from professionals who got hired.</li>
          <li>Start from LinkedIn, old resume, or blank page.</li>
          <li>Built-in content suggestions and AI-powered improvements.</li>
          <li>Resume Tailoring for job-specific edits.</li>
          <li>Free Resume Checker with actionable tips.</li>
          <li>Download in PDF/TXT, A4 or letter format.</li>
          <li>Cloud storage for up to 30 editable documents.</li>
        </ul>
        <p className="text-gray-700 font-medium mb-6">
          Still not sure whether Resumator is right for you? Check out our
          reviews, and hear from others how Resumator helped them get their
          dream job.
        </p>
        <section id="faq" className="mt-36">
          <h2 className="text-4xl font-bold text-gray-900 mb-26 text-center">
            Frequently asked questions from Resumator
          </h2>
          {/* Dropdown FAQ List */}
          <div className="border-t border-gray-300 pt-6">
            {faqs.map((item, index) => (
              <div key={index} className="border-b border-gray-200 py-4">
                <button
                  onClick={() => toggleIndex(index)}
                  className="flex items-start justify-between w-full text-left"
                >
                  <span className="text-gray-800 font-medium text-lg">
                    {item.question}
                  </span>
                  <span className="ml-4">
                    {openIndex === index ? (
                      <Minus className="h-5 w-5 text-gray-600" />
                    ) : (
                      <Plus className="h-5 w-5 text-gray-600" />
                    )}
                  </span>
                </button>
                {openIndex === index && (
                  <p className="mt-2 text-gray-600 text-sm">{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
