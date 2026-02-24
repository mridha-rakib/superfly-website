import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Call02Icon,
  Location10Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import superflyLogo from "../../assets/superfly-logo.svg";

function Footer() {
  return (
    <footer className="bg-[#F7E5E3] border-t border-gray-200">
      {/* Top Section */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 p-10">

        {/* Logo + About */}
        <div className="flex flex-col">
          <img src={superflyLogo} alt="Superfly Logo" className="w-20 mb-2" />

          <h1 className="font-bold text-xl">Superfly Services</h1>

          <p className="text-gray-600 mt-2 leading-relaxed">
            Professional cleaning services that make your life easier.  
            Fast, reliable, and affordable cleaning solutions for your 
            home and office.
          </p>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold mb-3">Contact Info</h1>

          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center gap-3">
              <HugeiconsIcon icon={Call02Icon} />
              <span>+123456789</span>
            </li>

            <li className="flex items-center gap-3">
              <HugeiconsIcon icon={Mail01Icon} />
              <span>info@superfly.com</span>
            </li>

            <li className="flex items-center gap-3">
              <HugeiconsIcon icon={Location10Icon} />
              <span>123 Main St, Anytown, USA</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold mb-3">Quick Links</h1>

          <ul className="space-y-2 text-gray-700">
            <li className="hover:text-[#C85344] cursor-pointer">Home</li>
            <li className="hover:text-[#C85344] cursor-pointer">About</li>
            <li className="hover:text-[#C85344] cursor-pointer">Services</li>
            <li className="hover:text-[#C85344] cursor-pointer">Blog</li>
            <li className="hover:text-[#C85344] cursor-pointer">Contact</li>
          </ul>
        </div>

      </div>

      {/* Bottom Section */}
      <p className="text-center text-gray-500 py-4 border-t border-gray-200">
        © 2025 Superfly. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
