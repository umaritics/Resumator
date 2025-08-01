export default function JobDescription() {
  return (
    <section className="py-20 px-6 md:px-20 bg-white flex flex-col-reverse md:flex-row items-center gap-12 justify-center items-center">
      <section className="py-20 px-6 md:px-20 bg-white flex flex-col-reverse md:flex-row items-center gap-12">
        {/* Left Visual Cluster */}
        <div className="relative w-[350px] h-[400px]">
          {/* Animated person */}
          <img
            src="/person-animated.jpg"
            alt="Animated Person"
            className="w-32 h-32 object-contain rounded-full border-4 border-white shadow-lg absolute top-7 left-1/4 -translate-x-1/2 z-8"
          />

          {/* Job Description Image */}
          <img
            src="/resume-jd.jpg"
            alt="Job Description"
            className="w-48 h-64 object-contain rounded-xl shadow-md absolute bottom-0 left-0 z-10"
          />

          {/* Resume Image */}
          <img
            src="/job-description.jpg"
            alt="Resume"
            className="w-52 h-64 object-contain rounded-xl shadow-lg absolute bottom-4 left-35 z-20"
          />
        </div>

        {/* Right Text Content */}
        <div className="max-w-xl space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">
            Resume tailoring based on the job you’re applying for
          </h2>
          <p className="text-gray-600">
            Quickly ensure that your resume covers key skills and experiences by
            pasting the job ad you’re applying for.
          </p>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>Skills and experience section analysis</li>
            <li>Actionable checklist of what else to add to your resume</li>
            <li>Instant comparison between your resume and the job posting</li>
          </ul>
        </div>
      </section>
    </section>
  );
}
