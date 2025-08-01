"use client";

export default function Corrections() {
  return (
    <section className="py-20 px-6 md:px-20 bg-[#f6f9fc] flex flex-col md:flex-row justify-center items-center gap-12">
      {/* Left Text Content */}
      <div className="max-w-lg space-y-4">
        <h2 className="text-3xl font-bold text-gray-800">
          Check your resume for grammatical and punctuation errors
        </h2>
        <p className="text-gray-600">
          A built-in content checker tool helping you stay on top of grammar
          errors and clichés.
        </p>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>Wording and readability analysis</li>
          <li>Eliminate typos and grammatical errors</li>
          <li>Content suggestions based on your job and experience</li>
        </ul>
      </div>

      {/* Right Image with Boxes */}
      <div className="relative w-[300px] h-[400px]">
        <img
          src="/resume-image.jpg"
          alt="Resume Example"
          className="w-full h-full object-cover rounded-xl shadow-xl"
        />

        {/* Slanted Boxes */}
        <div className="absolute top-[60%] left-[-10%] rotate-[-10deg] space-y-4">
          {[
            "Correction: 'there' → 'their'",
            "Improvement: Avoid passive voice",
            "Suggestion: Add action verb",
          ].map((text, i) => (
            <div
              key={i}
              className="bg-white text-sm font-medium text-gray-800 px-4 py-2 rounded shadow-md border border-blue-100"
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
