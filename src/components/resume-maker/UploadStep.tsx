"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false },
);

interface UploadStepProps {
  isUploading: boolean;
  hasFile: boolean;
  onFileChange: (file: File | null) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function UploadStep({
  isUploading,
  hasFile,
  onFileChange,
  onContinue,
  onBack,
}: UploadStepProps) {
  if (isUploading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Player
          autoplay
          loop
          src="/animations/resume-maker-animation.json"
          className="w-60 h-60"
        />
        <h2 className="text-xl font-semibold text-blue-600 mt-6 flex items-center gap-1">
          Analyzing
          <span className="animate-pulse">.</span>
          <span className="animate-pulse delay-75">.</span>
          <span className="animate-pulse delay-150">.</span>
        </h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 min-h-[300px] justify-center">
      <h2 className="text-lg font-medium">Upload Your Resume</h2>
      <p className="text-sm text-gray-500 text-center max-w-md">
        PDF, Word (.doc / .docx), or plain text (.txt)
      </p>
      <Input
        type="file"
        accept=".pdf,.doc,.docx,.txt,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
      />
      <div className="flex gap-4">
        <Button disabled={!hasFile} onClick={onContinue}>
          Continue
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
