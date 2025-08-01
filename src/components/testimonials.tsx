"use client";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Philippe",
    time: "15 hours ago",
    text: "Impressive and efficient. I wasn't sure about the service, as I tried a lot of this kind before and it was never as good as advertised. But Enhancv allowed me to tailor a very good resume in less than an hour, and in the end I landed the job!",
  },
  {
    name: "Tomek",
    time: "3 days ago",
    text: "Very flexible template adjustment, incl. modifications of each section. Sensible improvement recommendations. Auto translations still imprecise. AI customization features - falling behind regular LLM tools.",
  },
  {
    name: "Aida",
    time: "3 days ago",
    text: "Se hace bien el CV y es intuitivo, no tiene mucha complicación.",
  },
  {
    name: "Anonymous",
    time: "4 days ago",
    text: "Thanks Resumator! I was on the job search for about 2 months without any traction. When I finally acquired Resumator, it really made all the difference. I got 2 offers in the end!",
  },
  {
    name: "Erik",
    time: "5 days ago",
    text: "Great templates! Easy to use and made my resume look modern, updated and polished! So glad I used this program!",
  },
];

export default function Testimonials() {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 to-slate-800 py-16 px-6 md:px-20 ">
      <div className="text-center mb-12">
        <h2 className="text-white text-3xl font-bold mb-2">
          Trusted by Executives & Senior Professionals
        </h2>
        <p className="text-blue-200 text-sm">
          4.5 Rating · 4,662 happy customers shared their experience.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((review, index) => (
          <motion.div
            key={index}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white shadow-md border border-white/10 hover:scale-105"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <p className="text-sm mb-3 italic">{review.text}</p>
            <div className="flex justify-between items-center text-xs text-blue-300 mt-2">
              <span>— {review.name}</span>
              <span>{review.time}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <button className="text-sm text-blue-300 hover:text-blue-500 underline transition">
          Read More Reviews
        </button>
      </div>
    </section>
  );
}
