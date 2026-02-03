"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  // const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // // ✅ Fetch user + subscribe to auth changes
  // useEffect(() => {
  //   const getUser = async () => {
  //     const {
  //       data: { session },
  //       error,
  //     } = await supabase.auth.getSession();

  //     if (error) console.error("Error fetching session:", error);

  //     setUser(session?.user ?? null);
  //     setLoading(false);
  //   };
  //   getUser();

  //   // ✅ Listen for auth state changes
  //   const { data: subscription } = supabase.auth.onAuthStateChange(
  //     (_event, session) => {
  //       setUser(session?.user ?? null);
  //       setLoading(false);
  //     }
  //   );

  //   return () => {
  //     subscription.subscription.unsubscribe();
  //   };
  // }, []);

  // const handleLogout = async () => {
  //   await supabase.auth.signOut();
  // };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="text-blue-600 text-3xl sm:text-4xl font-bold font-ubuntu"
            >
              Resumator
            </Link>
          </div>

          {/* Center: Nav Links (Desktop Only) */}
          <div className="hidden md:flex space-x-8">
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

          {/* Right: Auth/Profile (Desktop Only) */}
          <div className="hidden md:flex items-center">
            {/* {!loading &&
              (user ? (
                <ProfileDropdown /> // ✅ Only when logged in
              ) : (
                <Link
                  href="/auth"
                  className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-white hover:text-blue-600 hover:border hover:border-blue-600 transition-all"
                >
                  Sign Up / Login
                </Link>
              ))} */}
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
            href="/resume-maker"
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

          {/* {!loading &&
            (user ? (
              <div className="mt-2 border-t pt-2">
                <Link
                  href="/profile"
                  className="block py-2 text-gray-700 hover:text-blue-600"
                >
                  Profile
                </Link>
                <button
                  // onClick={handleLogout}
                  className="w-full text-left py-2 text-gray-700 hover:text-blue-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="block mt-2 bg-blue-600 text-white text-center px-4 py-2 rounded-full hover:bg-white hover:text-blue-600 hover:border hover:border-blue-600 transition-all"
              >
                Sign Up / Login
              </Link>
            ))} */}
        </div>
      )}
    </nav>
  );
}
