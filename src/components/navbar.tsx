"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { div } from "framer-motion/client";
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo + Name */}
          <div className="flex items-center space-x-2">
            {/* <Image
              src="/logo.png"
              alt="Resumator Logo"
              width={36}
              height={36}
              priority
            /> */}
            <Link
              href="/"
              className="text-blue-600 text-3xl sm:text-4xl font-bold font-ubuntu"
            >
              Resumator
            </Link>
          </div>

          {/* Center: Nav Links (Desktop Only) */}
          <div className="hidden md:flex space-x-15">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link
              href="/resume-maker"
              className="text-gray-700 hover:text-blue-600"
            >
              Make Resume
            </Link>
            <Link href="/make" className="text-gray-700 hover:text-blue-600">
              Cover Letter
            </Link>
            <Link href="/make" className="text-gray-700 hover:text-blue-600">
              Resume Score
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-blue-600">
              About
            </Link>
            <Link href="#faq" className="text-gray-700 hover:text-blue-600">
              FAQs
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
          </div>

          {/* Right: Auth Button (Desktop Only) */}
          <div className="hidden md:flex">
            <Link
              href="/auth"
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-white hover:text-blue-600 hover:border hover:border-blue-600 transition-all"
            >
              Sign Up / Login
            </Link>
          </div>

          {/* Mobile: Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md px-4 pb-4">
          <Link
            href="/"
            className="block py-2 text-gray-700 hover:text-blue-600"
          >
            Home
          </Link>
          <Link
            href="/make"
            className="block py-2 text-gray-700 hover:text-blue-600"
          >
            Make Resume
          </Link>
          <Link
            href="/about"
            className="block py-2 text-gray-700 hover:text-blue-600"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="block py-2 text-gray-700 hover:text-blue-600"
          >
            Contact
          </Link>
          <Link
            href="/auth"
            className="block mt-2 bg-blue-600 text-white text-center px-4 py-2 rounded-full hover:bg-white hover:text-blue-600 hover:border hover:border-blue-600 transition-all"
          >
            Sign Up / Login
          </Link>
        </div>
      )}
    </nav>
  );
}
