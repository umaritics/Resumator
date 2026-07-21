"use client";

import { Button } from "@/components/ui/button";

interface AskStepProps {
  hasDraft: boolean;
  onContinueDraft: () => void;
  onStartOver: () => void;
  onHasResume: () => void;
  onStartBlank: () => void;
}

export function AskStep({
  hasDraft,
  onContinueDraft,
  onStartOver,
  onHasResume,
  onStartBlank,
}: AskStepProps) {
  return (
    <div className="flex flex-col items-center gap-6 max-w-lg text-center">
      {hasDraft && (
        <div className="w-full space-y-3 rounded-lg border border-blue-100 bg-blue-50/60 p-5">
          <h2 className="text-xl font-semibold text-gray-800">
            Continue your draft?
          </h2>
          <p className="text-sm text-gray-600">
            We found a resume draft saved on this device.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={onContinueDraft}>Continue editing</Button>
            <Button variant="outline" onClick={onStartOver}>
              Start over
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {hasDraft ? "Or start a different path" : "Do you already have a resume?"}
        </h2>
        <div className="flex gap-4 justify-center">
          <Button onClick={onHasResume}>Yes, upload one</Button>
          <Button variant={hasDraft ? "secondary" : "default"} onClick={onStartBlank}>
            No, start blank
          </Button>
        </div>
      </div>
    </div>
  );
}
