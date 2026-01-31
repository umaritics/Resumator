"use client";
import React, { useEffect, useRef, useState } from "react";

interface ResumeScalerProps {
  children: React.ReactNode;
  scale?: number; // Optional manual scale override
}

export const ResumeScaler: React.FC<ResumeScalerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const checkHeight = () => {
      if (!containerRef.current || !contentRef.current) return;

      // Standard A4 height in pixels (approximate at 96dpi)
      // 297mm ~= 1123px. We add a small buffer for safety.
      const MAX_HEIGHT = 1120;

      // Reset scale to 1 to measure true height
      contentRef.current.style.transform = "scale(1)";
      const currentHeight = contentRef.current.scrollHeight;

      if (currentHeight > MAX_HEIGHT) {
        // Calculate ratio to fit
        const newScale = MAX_HEIGHT / currentHeight;
        // Cap the shrinking to 70% to prevent unreadable text
        setScaleFactor(Math.max(newScale, 0.7));
      } else {
        setScaleFactor(1);
      }
    };

    // Run on mount and when children change
    checkHeight();

    // Optional: Re-check on window resize
    window.addEventListener("resize", checkHeight);
    return () => window.removeEventListener("resize", checkHeight);
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-white shadow-2xl mx-auto"
      style={{
        width: "210mm",
        height: "297mm",
        pageBreakAfter: "avoid", // Helps with printing
      }}
    >
      <div
        ref={contentRef}
        style={{
          transform: `scale(${scaleFactor})`,
          transformOrigin: "top center",
          width: "100%",
          // If we scale down, the visual height shrinks, but layout space might remain.
          // This ensures the content flows naturally.
        }}
      >
        {children}
      </div>
    </div>
  );
};
