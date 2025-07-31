// app/layout.tsx
import "./globals.css";
import { Lexend_Deca } from "next/font/google";

const lexend = Lexend_Deca({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend", // Optional: use as CSS variable
});

export const metadata = {
  title: "Resumator",
  description: "Tailor your resume for any job.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={lexend.className}>{children}</body>
    </html>
  );
}
