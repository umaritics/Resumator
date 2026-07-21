"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { TemplateId } from "@/lib/types/resume";

const TEMPLATES: { id: TemplateId; label: string; src: string; alt: string }[] = [
  { id: "classic", label: "Classic", src: "/template-classic.png", alt: "Classic Template" },
  { id: "elegant", label: "Elegant", src: "/template-elegant.png", alt: "Elegant Template" },
  { id: "corporate", label: "Corporate", src: "/template-corporate.png", alt: "Corporate Template" },
  { id: "creative", label: "Creative", src: "/template-creative.png", alt: "Creative Template" },
];

interface TemplateStepProps {
  selectedTemplate: TemplateId;
  onSelect: (template: TemplateId) => void;
  onBack: () => void;
}

export function TemplateStep({
  selectedTemplate,
  onSelect,
  onBack,
}: TemplateStepProps) {
  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800">Choose your look</h2>
        <p className="text-gray-500">
          Select a template to visualize your resume
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full px-4">
        {TEMPLATES.map((template) => (
          <div
            key={template.id}
            className={`group relative aspect-[210/297] w-full rounded-xl border-2 cursor-pointer overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02] ${
              selectedTemplate === template.id
                ? "border-blue-600 ring-4 ring-blue-100"
                : "border-gray-200"
            }`}
            onClick={() => onSelect(template.id)}
          >
            <Image
              src={template.src}
              alt={template.alt}
              width={300}
              height={400}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 pt-10 flex justify-center">
              <span className="text-white font-semibold tracking-wide">
                {template.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={onBack} className="mt-4">
        Back
      </Button>
    </div>
  );
}
