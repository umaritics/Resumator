"use client";

import Navbar from "@/components/navbar";
import HeroSection from "@/components/HeroSection";
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-2">
        <HeroSection />
        <div className="overflow-hidden w-full bg-white py-10">
          <div className="flex animate-scroll whitespace-nowrap gap-6">
            <img
              src="/template1.png"
              alt="Template 1"
              className="h-64 w-auto m-5 border-4-blue-200 border-solid rounded-lg"
            />
            <img
              src="/template2.png"
              alt="Template 2"
              className="h-64 w-auto m-5 border-4-blue-200 border-solid rounded-lg"
            />
            <img
              src="/template3.png"
              alt="Template 3"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template4.png"
              alt="Template 4"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template5.png"
              alt="Template 5"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template6.png"
              alt="Template 6"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template1.png"
              alt="Template 1"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template2.png"
              alt="Template 2"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template3.png"
              alt="Template 3"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template4.png"
              alt="Template 4"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template5.png"
              alt="Template 5"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template6.png"
              alt="Template 6"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template1.png"
              alt="Template 1"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template2.png"
              alt="Template 2"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template3.png"
              alt="Template 3"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template4.png"
              alt="Template 4"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template5.png"
              alt="Template 5"
              className="h-64 w-auto m-5"
            />
            <img
              src="/template6.png"
              alt="Template 6"
              className="h-64 w-auto m-5"
            />

            {/* Repeat images or use real content */}
          </div>
        </div>
      </main>
    </>
  );
}
