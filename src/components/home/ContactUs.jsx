import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Call02Icon,
  Mail01Icon,
  Location10Icon,
} from "@hugeicons/core-free-icons";

function ContactUs() {
  return (
    <>
      <h1 className="text-4xl font-bold p-5 text-center">Contact Us</h1>

      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start gap-10 p-5">

        {/* Left Section */}
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl font-bold mb-2">Get in touch</h2>
          <p className="text-lg text-gray-600 mb-6">
            Fill out the form below to get in touch with us.
          </p>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-3">Contact Info</h3>

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
        </div>

        {/* Form Section */}
        <form className="w-full md:w-1/2 bg-white shadow-md p-5 rounded-lg border border-gray-100">
          <input
            type="text"
            placeholder="Name"
            className="w-full p-3 mb-3 border border-gray-300 rounded"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-3 border border-gray-300 rounded"
          />

          <input
            type="text"
            placeholder="Subject"
            className="w-full p-3 mb-3 border border-gray-300 rounded"
          />

          <textarea
            placeholder="Message"
            rows={5}
            className="w-full p-3 mb-3 border border-gray-300 rounded resize-none"
          ></textarea>

          <button
            type="submit"
            className="w-full p-3 bg-[#C85344] text-white font-semibold rounded hover:bg-[#b0463a] transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </>
  );
}

export default ContactUs;
