// ATSFeatures.jsx
import { motion } from "framer-motion";
import { FiPhone, FiUsers } from "react-icons/fi";
import { FaRocket } from "react-icons/fa";

const cards = [
  { text: "Readable contact information", icon: <FiPhone size={24} /> },
  { text: "Full experience section parsing", icon: <FiUsers size={24} /> },
  { text: "Optimized skills section", icon: <FaRocket size={24} /> },
];

export default function ATSFeatures() {
  return (
    <section className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-white py-20 px-8 flex flex-col md:flex-row justify-around items-center overflow-hidden">
      {/* Left Content */}
      <div className="max-w-xl mt-20">
        <h2 className="text-4xl font-bold mb-4">
          Resumes optimized for applicant tracking systems (ATS)
        </h2>
        <p className="mb-6 text-lg text-gray-300">
          Enhance resumes and cover letters vigorously tested against major ATS
          systems to ensure complete parsability.
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full">
          Build an ATS-Friendly Resume
        </button>
      </div>

      {/* Right Animated Cards */}
      <div className="mt-25 md:mt-0 grid gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 w-80 border border-white/20 shadow-lg flex items-center gap-4"
          >
            <div className="text-white">{card.icon}</div>
            <p className="text-white text-md font-semibold">{card.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
