"use client";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/sign-in")) return null;
  return (
    <footer className="bg-[#121212] px-8 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* Logo and tagline */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-[#1DBF9F] text-2xl font-black -space-y-2">
                <h1>SKILL</h1>
                <h1>BRIDGE.</h1>
              </div>
            </div>
            <p className="text-gray-300 text-lg">
              Jumpstart your career as a new-grads with SkillBridge.
            </p>
          </div>

          {/* Navigation columns */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {/* Column 1 */}
              <div>
                <ul className="space-y-4">
                  <li>
                    <h3 className="text-gray-200 font-bold">COMPANY</h3>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-200 hover:text-gray-400 transition-colors"
                    >
                      ABOUT US
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-200 hover:text-gray-400 transition-colors"
                    >
                      EXPLORE
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 2 */}
              <div>
                <ul className="space-y-4">
                  <li>
                    <h3 className="text-gray-200 font-bold">NEED HELP?</h3>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-200 hover:text-gray-400 transition-colors"
                    >
                      CONTACT US
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-200 hover:text-gray-400 transition-colors"
                    >
                      BLOG
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 3 */}
              <div>
                <ul className="space-y-4">
                  <li>
                    <h3 className="text-gray-200 font-bold">COMMUNITY</h3>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-200 hover:text-gray-400 transition-colors"
                    >
                      X
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-200 hover:text-gray-400 transition-colors"
                    >
                      LINKEDIN
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-200 hover:text-gray-400 transition-colors"
                    >
                      INSTAGRAM
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-300 text-sm">
            SkillBridge. All Rights Reserved © 2025.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
