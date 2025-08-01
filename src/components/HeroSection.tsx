// components/HeroSection.tsx
"use client";

import dynamic from "next/dynamic";

// Dynamically import the Lottie Player with SSR disabled
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);

const HeroSection = () => {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center justify-around gap-8 px-4 md:px-16 py-10 bg-white">
      {/* Left Side Content */}
      <div className="flex flex-col items-start text-center md:text-left max-w-xl">
        <h1 className="mt-20 text-4xl md:text-8xl text-center font-bold leading-snug line-height:1.2">
          Tailor your resume with{" "}
          <span className="text-blue-600">Resumator</span>.
        </h1>
        <div className="mt-10 self-center justify-between flex flex-col md:flex-row items-center mt-6 space-y-4 md:space-y-0 md:space-x-4">
          <button className="mt-6 bg-blue-600 text-bold  text-white px-6 py-3 rounded-xl  text-lg hover:bg-blue-700 transition">
            Make Resume
          </button>
          <button className="mt-6 bg-white text-bold  text-blue-600 px-6 py-3 rounded-xl  text-lg border border-blue-600 hover:bg-blue-600 hover:text-white transition">
            Get Your Resume Score
          </button>
        </div>
        <h2 className="text-4xl md:text-4xl  mt-20 text-center font-bold leading-snug">
          Pick a template and build your resume in minutes!
        </h2>
      </div>

      {/* Right Side Animation */}
      <div className="w-full md:w-1/2">
        <Player
          autoplay
          loop
          src="/animations/resume-animation.json"
          className="w-full h-auto"
        />
      </div>
    </section>
  );
};

export default HeroSection;
