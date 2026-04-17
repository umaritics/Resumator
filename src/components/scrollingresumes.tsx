import Image from "next/image";

export default function ScrollingResumes() {
  const templates = [
    "/template1.png",
    "/template2.png",
    "/template3.png",
    "/template4.png",
    "/template5.png",
    "/template6.png",
    "/template1.png",
    "/template2.png",
    "/template3.png",
    "/template4.png",
    "/template5.png",
    "/template6.png",
  ];

  return (
    <div className="overflow-hidden w-full bg-gradient-to-r from-[#1e293b] to-[#0f172a] py-10">
      <div className="flex animate-scroll whitespace-nowrap gap-6 px-4">
        {templates.map((src, index) => (
          <div
            key={index}
            // Perfectly calculated A4 proportions
            className="relative w-[200px] h-[283px] m-3 flex-shrink-0 transform transition-transform duration-300 hover:scale-105"
          >
            <Image
              src={src}
              fill
              alt={`Template ${index + 1}`}
              quality={100} // Bypasses default compression for crisp text
              sizes="200px" // Highly optimized loading
              // object-contain guarantees no cropping or stretching
              className="object-contain rounded-lg border-[8px] border-blue-200 bg-white shadow-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
