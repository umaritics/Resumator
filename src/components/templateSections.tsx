export default function TemplateSections() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-gradient-to-r text-white from-[#1e293b] to-[#0f172a] py-16 px-6 md:px-16 relative overflow-hidden">
      {/* Left Text Block */}
      <div className="md:w-1/2 space-y-6 z-10">
        <h2 className="text-3xl md:text-4xl font-bold ">
          Express your professional history without limitations or worry about
          how your resume looks
        </h2>
        <ul className="space-y-3  text-lg">
          <li>
            <strong>Professional sections</strong> like Experience, Skills,
            Summary and Education
          </li>
          <li>
            <strong>Personal sections</strong> like Strengths, Quotes, Books,
            Interests and My Time
          </li>
          <li>
            <strong>Other sections</strong> like Certifications, Awards,
            Achievements, Languages and References
          </li>
        </ul>
      </div>

      {/* Right Slanted Card Stack */}
      <div className="relative md:w-1/2 h-[400px] flex items-center justify-center">
        {/* Card 1 */}
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-white rounded-xl shadow-xl border p-4 transform rotate-[-10deg] z-10">
          <h3 className="text-lg font-semibold text-indigo-700">Awards</h3>
          <p className="text-sm text-gray-600 mt-1">
            Showcase your notable accomplishments
          </p>
        </div>

        {/* Card 2 */}
        <div className="absolute top-20 left-1/3 w-48 h-48 bg-white rounded-xl shadow-xl border p-4 transform rotate-[-5deg] z-20">
          <h3 className="text-lg font-semibold text-emerald-700">Education</h3>
          <p className="text-sm text-gray-600 mt-1">
            Display your academic journey
          </p>
        </div>

        {/* Card 3 */}
        <div className="absolute top-36 left-1/2 w-48 h-48 bg-white rounded-xl shadow-xl border p-4 transform rotate-[0deg] z-30">
          <h3 className="text-lg font-semibold text-pink-700">Experience</h3>
          <p className="text-sm text-gray-600 mt-1">
            Highlight your work experience
          </p>
        </div>

        {/* Card 4 */}
        <div className="absolute top-52 left-[60%] w-48 h-48 bg-white rounded-xl shadow-xl border p-4 transform rotate-[5deg] z-40">
          <h3 className="text-lg font-semibold text-blue-700">Most Proud Of</h3>
          <p className="text-sm text-gray-600 mt-1">
            Share your proudest moments
          </p>
        </div>
      </div>
    </div>
  );
}
