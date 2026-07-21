"use client";

import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { ResumeScaler } from "@/components/ResumeScaler";
import {
  TemplateClassic,
  TemplateElegant,
  TemplateCorporate,
  TemplateCreative,
} from "@/components/resumeTemplates";
import type { ResumeData, TemplateId } from "@/lib/types/resume";

interface PreviewStepProps {
  resumeData: ResumeData;
  selectedTemplate: TemplateId;
  printRef: RefObject<HTMLDivElement | null>;
  onPrint: () => void;
  onEdit: () => void;
  onChangeTemplate: () => void;
  onStartOver: () => void;
}

export function PreviewStep({
  resumeData,
  selectedTemplate,
  printRef,
  onPrint,
  onEdit,
  onChangeTemplate,
  onStartOver,
}: PreviewStepProps) {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 sm:gap-6 pb-10 mt-4 sm:mt-10 px-2 sm:px-4">
      <div className="flex flex-col items-center gap-2 text-center px-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Your Resume is Ready!
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Review the AI-polished version below.
        </p>
      </div>

      <div className="w-full max-w-3xl sticky top-16 sm:top-4 z-50 bg-white/95 backdrop-blur p-2 sm:p-3 rounded-md shadow-lg border">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 sm:justify-center">
          <Button
            onClick={onPrint}
            className="col-span-2 sm:col-span-1 bg-green-600 hover:bg-green-700 font-bold sm:px-8 shadow-md"
          >
            Download PDF
          </Button>
          <Button variant="outline" onClick={onEdit}>
            Edit Data
          </Button>
          <Button variant="ghost" onClick={onChangeTemplate}>
            Change Template
          </Button>
          <Button variant="secondary" onClick={onStartOver}>
            Start over
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-hidden bg-gray-100 p-2 sm:p-6 md:p-8 rounded-lg border border-gray-200">
        <div ref={printRef} className="mx-auto w-full flex justify-center">
          <ResumeScaler>
            {selectedTemplate === "classic" && (
              <TemplateClassic data={resumeData} />
            )}
            {selectedTemplate === "elegant" && (
              <TemplateElegant data={resumeData} />
            )}
            {selectedTemplate === "corporate" && (
              <TemplateCorporate data={resumeData} />
            )}
            {selectedTemplate === "creative" && (
              <TemplateCreative data={resumeData} />
            )}
          </ResumeScaler>
        </div>
      </div>
    </div>
  );
}
