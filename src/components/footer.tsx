import { Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-white px-6 py-18 pb-0">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Resumator Info */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Resumator</h3>
          <p className="text-sm text-gray-300">
            Tailor your resume for each job with AI-powered personalization.
            Impress recruiters with content that truly reflects you.
          </p>
          <a
            href="mailto:umar.irpk@gmail.com"
            className="mt-10 text-sm text-gray-300 hover:text-white transition "
          >
            info@resumator.pk
          </a>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="#about" className="hover:text-white transition">
                About Us
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-white transition">
                Features
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-white transition">
                FAQ
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-white transition">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Stay Updated</h3>
          <p className="text-sm text-gray-300 mb-4">
            Join our newsletter to get resume tips and product updates.
          </p>
          <form className="flex flex-col sm:flex-row items-center sm:items-stretch gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-2 text-sm text-white  border-1 border-white rounded-md"
            />
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm">
              Subscribe
            </button>
          </form>
        </div>

        {/* Social Icons */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300"
            >
              <Github size={20} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300"
            >
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-20 mb-0  border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Resumator. All rights reserved.
      </div>
    </footer>
  );
}
