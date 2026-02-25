import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Call02Icon,
  Mail01Icon,
  Location10Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";
import { contactApi } from "../../services/contactApi";

const initialFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function ContactUs() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setError("");
    setSuccessMessage("");

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      setError("All fields are required.");
      return;
    }

    if (payload.message.length < 10) {
      setError("Message must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await contactApi.sendPublicMessage(payload);
      setSuccessMessage("Your message has been sent. We will contact you soon.");
      setFormData(initialFormData);
      toast.success("Message sent successfully.");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Could not send message. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <form
          className="w-full md:w-1/2 bg-white shadow-md p-5 rounded-lg border border-gray-100"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange("name")}
            className="w-full p-3 mb-3 border border-gray-300 rounded"
            maxLength={120}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange("email")}
            className="w-full p-3 mb-3 border border-gray-300 rounded"
            required
          />

          <input
            type="text"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange("subject")}
            className="w-full p-3 mb-3 border border-gray-300 rounded"
            maxLength={160}
            required
          />

          <textarea
            placeholder="Message"
            rows={5}
            value={formData.message}
            onChange={handleChange("message")}
            className="w-full p-3 mb-3 border border-gray-300 rounded resize-none"
            minLength={10}
            maxLength={2000}
            required
          ></textarea>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3 bg-[#C85344] text-white font-semibold rounded hover:bg-[#b0463a] transition"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </>
  );
}

export default ContactUs;
