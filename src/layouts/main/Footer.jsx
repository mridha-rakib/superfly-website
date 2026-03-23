import React from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Call02Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import superflyLogo from "../../assets/superfly-logo.svg";

function Footer() {
  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Residential Cleaning", to: "/services/residential" },
    {
      label: "Commercial Cleaning",
      to: "/services/book-site-visit-commercial",
    },
    {
      label: "Post-Construction Cleaning",
      to: "/services/book-site-visit-post-construction",
    },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <footer className="bg-[#F7E5E3] border-t border-gray-200">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 gap-10 p-10 sm:grid-cols-3">
        <div className="flex flex-col">
          <img
            src={superflyLogo}
            alt="Superfly Logo"
            className="w-20 mb-2 mix-blend-multiply contrast-110"
          />

          <h1 className="font-bold text-xl">Superfly Services</h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-[#8f3529]">
            Where Clean Takes Flight
          </p>

          <p className="mt-2 leading-relaxed text-gray-600">
            Superfly Services proudly provides professional cleaning services
            throughout Columbus, Ohio and surrounding communities including
            Westerville, Dublin, Worthington, and Hilliard.
          </p>
        </div>

        <div className="flex flex-col">
          <h1 className="mb-3 text-xl font-bold">Contact Info</h1>

          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center gap-3">
              <HugeiconsIcon icon={Call02Icon} />
              <span>614-206-0296</span>
            </li>

            <li className="flex items-center gap-3">
              <HugeiconsIcon icon={Mail01Icon} />
              <span>info@superflycleaning.com</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col">
          <h1 className="mb-3 text-xl font-bold">Quick Links</h1>

          <ul className="space-y-2 text-gray-700">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link className="hover:text-[#C85344]" to={link.to}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="border-t border-gray-200 py-4 text-center text-gray-500">
        Copyright {new Date().getFullYear()} Superfly Services. All rights
        reserved.
      </p>
    </footer>
  );
}

export default Footer;
