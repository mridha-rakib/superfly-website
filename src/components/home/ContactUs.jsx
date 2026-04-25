import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Call02Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { getErrorMessage } from "@/lib/api-error";
import {
  getFieldErrorId,
  useInlineFormErrors,
} from "@/hooks/useInlineFormErrors";
import { toast } from "@/lib/notify";
import { contactApi } from "../../services/contactApi";

const initialFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};
const fullNameLabel = "Full Name";

function ContactUs() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { getFieldA11yProps, getFieldError, validateField } = useInlineFormErrors();

  const getFieldClassName = (fieldName) =>
    `w-full p-3 border rounded ${
      getFieldError(fieldName) ? "border-red-500" : "border-gray-300"
    }`;

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (getFieldError(field)) {
      validateField(field, event.target, {
        label:
          field === "name"
            ? fullNameLabel
            : field === "email"
            ? "Email"
            : field === "subject"
            ? "Subject"
            : "Message",
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setError("");
    setSuccessMessage("");
    const form = event.currentTarget;

    const isValid = [
      ["name", fullNameLabel],
      ["email", "Email"],
      ["subject", "Subject"],
      ["message", "Message"],
    ].every(([field, label]) =>
      validateField(field, form.elements.namedItem(field), { label })
    );

    if (!isValid) {
      return;
    }

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
      const message = getErrorMessage(err, "Could not send message. Please try again.");
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold p-5 text-center">
        Where Clean Takes Flight
      </h1>

      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start gap-10 p-5">
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl font-bold mb-2">Get in touch</h2>
          <p className="text-lg text-gray-600 mb-6">
            Call or email Superfly Services for residential, commercial, and
            post-construction cleaning in Columbus and surrounding areas.
          </p>

          <div>
            <h3 className="text-xl font-bold mb-3">Contact Info</h3>

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
        </div>
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

          <div className="mb-3">
            <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-gray-700">
              {fullNameLabel}
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange("name")}
              onBlur={(event) => validateField("name", event.target, { label: fullNameLabel })}
              className={getFieldClassName("name")}
              maxLength={120}
              required
              {...getFieldA11yProps("name")}
            />
            {getFieldError("name") && (
              <p id={getFieldErrorId("name")} className="mt-1 text-sm text-red-600">
                {getFieldError("name")}
              </p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange("email")}
              onBlur={(event) => validateField("email", event.target, { label: "Email" })}
              className={getFieldClassName("email")}
              required
              {...getFieldA11yProps("email")}
            />
            {getFieldError("email") && (
              <p id={getFieldErrorId("email")} className="mt-1 text-sm text-red-600">
                {getFieldError("email")}
              </p>
            )}
          </div>

          <div className="mb-3">
            <label
              htmlFor="contact-subject"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Subject
            </label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange("subject")}
              onBlur={(event) => validateField("subject", event.target, { label: "Subject" })}
              className={getFieldClassName("subject")}
              maxLength={160}
              required
              {...getFieldA11yProps("subject")}
            />
            {getFieldError("subject") && (
              <p id={getFieldErrorId("subject")} className="mt-1 text-sm text-red-600">
                {getFieldError("subject")}
              </p>
            )}
          </div>

          <div className="mb-3">
            <label
              htmlFor="contact-message"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              placeholder="Message"
              rows={5}
              value={formData.message}
              onChange={handleChange("message")}
              onBlur={(event) => validateField("message", event.target, { label: "Message" })}
              className={`${getFieldClassName("message")} resize-none`}
              minLength={10}
              maxLength={2000}
              required
              {...getFieldA11yProps("message")}
            ></textarea>
            {getFieldError("message") && (
              <p id={getFieldErrorId("message")} className="mt-1 text-sm text-red-600">
                {getFieldError("message")}
              </p>
            )}
          </div>

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

