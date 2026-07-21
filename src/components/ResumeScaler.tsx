"use client";

import React, { useEffect, useRef, useState } from "react";

interface ResumeScalerProps {
  children: React.ReactNode;
}

/** A4 at 96dpi in CSS pixels. */
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

/**
 * Fits an A4 resume into the available width on mobile/desktop.
 * Wrapper height matches the visual scaled size so layout stays correct.
 * Print/PDF uses full size via print media overrides.
 */
export const ResumeScaler: React.FC<ResumeScalerProps> = ({ children }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!outerRef.current) return;
      const availableWidth = outerRef.current.clientWidth;
      if (availableWidth <= 0) return;
      setScale(Math.min(1, availableWidth / A4_WIDTH_PX));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(outerRef.current!);
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <div ref={outerRef} className="w-full max-w-full flex justify-center">
      <div
        className="relative overflow-hidden print:!w-auto print:!h-auto print:!overflow-visible"
        style={{
          width: A4_WIDTH_PX * scale,
          height: A4_HEIGHT_PX * scale,
        }}
      >
        <div
          className="bg-white shadow-2xl print:shadow-none print:!transform-none origin-top-left"
          style={{
            width: A4_WIDTH_PX,
            minHeight: A4_HEIGHT_PX,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
