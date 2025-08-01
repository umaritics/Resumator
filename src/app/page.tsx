"use client";

import Navbar from "@/components/navbar";
import HeroSection from "@/components/HeroSection";
import ATSFeatures from "@/components/atsFeatures";
import Testimonials from "@/components/testimonials";
import Corrections from "@/components/corrections";
import JobDescription from "@/components/jobdescription";
import ScrollingResumes from "@/components/scrollingresumes";
import TemplateSections from "@/components/templateSections";
import AboutSection from "@/components/about";
import Footer from "@/components/footer";
export default function Home() {
  return (
    <>
      <div className="scroll-smooth">
        <Navbar />
        <main className="pt-2 ">
          <HeroSection />
          <ScrollingResumes />
          <div className="flex justify-center items-center m-20">
            <button className=" m-5 p-2 justify-around bg-blue-600 text-white text-bold  hover:bg-white hover:text-blue-600 hover:border-blue-600 hover:border-2  self-center ">
              <a href="">Browse Templates</a>
            </button>
          </div>

          <ATSFeatures />
          <Corrections />
          <Testimonials />
          <JobDescription />
          <TemplateSections />
          <AboutSection />
          <Footer />
        </main>
      </div>
    </>
  );
}
