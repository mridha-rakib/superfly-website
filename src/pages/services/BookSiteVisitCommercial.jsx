import { useState } from "react";
import { getErrorMessage } from "@/lib/api-error";
import {
  getFieldErrorId,
  useInlineFormErrors,
} from "@/hooks/useInlineFormErrors";
import { toast } from "@/lib/notify";
import { quoteApi } from "../../services/quoteApi";
import { useAuthStore } from "../../state/useAuthStore";
import { formatTimeTo12Hour, parseTimeTo24Hour } from "../../lib/time-utils";

const getFieldValidationOptions = (field) => ({
  label:
    field === "name"
      ? "Full name"
      : field === "companyName"
      ? "Company name"
      : field === "companyAddress"
      ? "Company address"
      : field === "companyPhone"
      ? "Company phone number"
      : field === "companyEmail"
      ? "Company email"
      : field === "preferredDate"
      ? "Preferred date"
      : field === "preferredTime"
      ? "Preferred time"
      : field === "cleaningFrequency"
      ? "Cleaning frequency"
      : "Building size",
  customValidator:
    field === "preferredTime"
      ? (value) =>
          value.trim() && !parseTimeTo24Hour(value)
            ? "Enter a valid preferred time."
            : ""
      : undefined,
});

function BookSiteVisitCommercial() {
  const processSteps = [
    {
      title: "1. Schedule a Site Visit",
      body:
        "Start by submitting your information to book a walkthrough of your facility. We coordinate a convenient time to meet with you or your team and assess your space.",
    },
    {
      title: "2. On-Site Walkthrough & Consultation",
      body:
        "During the visit, we meet with the business owner, manager, or supervisor to understand your needs. We evaluate the space, discuss cleaning priorities, and identify all areas that require routine maintenance.",
    },
    {
      title: "3. Customized Cleaning Plan",
      body:
        "We create a tailored commercial cleaning scope of work based on your facility. This includes recommended cleaning frequency, specific tasks, and a structured plan designed to keep your space consistently clean.",
    },
    {
      title: "4. Supply Management & Scheduling",
      body:
        "Superfly Services helps manage cleaning supplies and ensures your facility is always stocked as needed. We also establish a reliable cleaning schedule so your business stays clean without disruption.",
    },
    {
      title: "5. Ongoing Cleaning & Support",
      body:
        "Our team delivers consistent, high-quality cleaning services while maintaining your facility over time. We adjust services as needed to ensure your expectations are always met.",
    },
  ];

  const { user } = useAuthStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.fullName || user?.name || "",
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    preferredDate: "",
    preferredTime: "",
    specialRequest: "",
    squareFoot: "",
    cleaningFrequency: "",
    cleaningServices: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { getFieldA11yProps, getFieldError, setFieldError, validateField } =
    useInlineFormErrors();

  const getFieldClassName = (fieldName) =>
    `p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344] ${
      getFieldError(fieldName) ? "border-red-500" : "border-gray-300"
    }`;

  const cleaningServiceOptions = [
    { value: "janitorial_services", label: "Janitorial Services" },
    { value: "carpet_cleaning", label: "Carpet Cleaning" },
    { value: "window_cleaning", label: "Window Cleaning" },
    { value: "pressure_washing", label: "Pressure Washing" },
    { value: "floor_cleaning", label: "Floor Cleaning" },
  ];

  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    const form = e.currentTarget;

    const isValid = [
      ["name", "Full name"],
      ["companyName", "Company name"],
      ["companyAddress", "Company address"],
      ["companyPhone", "Company phone number"],
      ["companyEmail", "Company email"],
      ["preferredDate", "Preferred date"],
      ["preferredTime", "Preferred time"],
      ["cleaningFrequency", "Cleaning frequency"],
      ["squareFoot", "Building size"],
    ].every(([field, label]) =>
      validateField(field, form.elements.namedItem(field), { label })
    );

    const cleaningServicesMessage = formData.cleaningServices.length
      ? ""
      : "Select at least one type of cleaning service.";
    setFieldError("cleaningServices", cleaningServicesMessage);

    if (!isValid || cleaningServicesMessage) {
      setIsSubmitting(false);
      return;
    }

    const numericSquareFoot = Number(formData.squareFoot);
    const normalizedPreferredTime = parseTimeTo24Hour(formData.preferredTime);

    quoteApi
      .createCommercialRequest({
        serviceType: "commercial",
        name: formData.name.trim(),
        companyName: formData.companyName,
        email: formData.companyEmail,
        phoneNumber: formData.companyPhone,
        businessAddress: formData.companyAddress,
        preferredDate: formData.preferredDate,
        preferredTime: normalizedPreferredTime,
        specialRequest: formData.specialRequest,
        squareFoot: numericSquareFoot,
        cleaningFrequency: formData.cleaningFrequency,
        cleaningServices: formData.cleaningServices,
      })
      .then(() => {
        setShowSuccessModal(true);
        setFormData({
          name: user?.fullName || user?.name || "",
          companyName: "",
          companyEmail: "",
          companyPhone: "",
          companyAddress: "",
          preferredDate: "",
          preferredTime: "",
          specialRequest: "",
          squareFoot: "",
          cleaningFrequency: "",
          cleaningServices: [],
        });
      })
      .catch((err) => {
        const msg = getErrorMessage(err, "Could not submit request. Please try again.");
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    if (getFieldError(id)) {
      validateField(id, e.target, getFieldValidationOptions(id));
    }
  };

  const handlePreferredTimeBlur = (event) => {
    validateField("preferredTime", event.target, getFieldValidationOptions("preferredTime"));
    const normalized = parseTimeTo24Hour(event.target.value);
    if (!normalized) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      preferredTime: formatTimeTo12Hour(normalized),
    }));
  };

  const handleServiceToggle = (value) => {
    setFormData((prev) => {
      const exists = prev.cleaningServices.includes(value);
      const updated = exists
        ? prev.cleaningServices.filter((item) => item !== value)
        : [...prev.cleaningServices, value];
      setFieldError(
        "cleaningServices",
        updated.length ? "" : "Select at least one type of cleaning service."
      );
      return { ...prev, cleaningServices: updated };
    });
  };

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-5 md:px-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 text-center">
        How Our Commercial Cleaning Process Works
      </h1>
      <p className="mb-8 text-gray-700 text-center text-lg">
        At Superfly Services, we provide professional commercial cleaning
        services in Columbus, Ohio designed to take the burden of cleaning
        completely off your team. Our process is built to create a customized
        cleaning plan that keeps your facility clean, organized, and fully
        maintained without adding extra work to your staff.
      </p>

      <div className="mb-10 grid gap-4">
        {processSteps.map((step) => (
          <section
            key={step.title}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
            <p className="mt-3 text-base leading-7 text-gray-700">
              {step.body}
            </p>
          </section>
        ))}
      </div>

      <form
        className="bg-white shadow-md rounded-lg p-6 md:p-8 space-y-6 border border-gray-200"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {/* Contact + Company */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="name" className="mb-2 font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={(event) =>
                validateField("name", event.target, getFieldValidationOptions("name"))
              }
              className={getFieldClassName("name")}
              required
              {...getFieldA11yProps("name")}
            />
            {getFieldError("name") && (
              <p id={getFieldErrorId("name")} className="mt-1 text-sm text-red-600">
                {getFieldError("name")}
              </p>
            )}
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="companyName" className="mb-2 font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleInputChange}
              onBlur={(event) =>
                validateField("companyName", event.target, getFieldValidationOptions("companyName"))
              }
              className={getFieldClassName("companyName")}
              required
              {...getFieldA11yProps("companyName")}
            />
            {getFieldError("companyName") && (
              <p id={getFieldErrorId("companyName")} className="mt-1 text-sm text-red-600">
                {getFieldError("companyName")}
              </p>
            )}
          </div>
        </div>

        {/* Email & Phone */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="companyEmail" className="mb-2 font-medium text-gray-700">
              Company Email
            </label>
            <input
              type="email"
              id="companyEmail"
              name="companyEmail"
              placeholder="email@company.com"
              value={formData.companyEmail}
              onChange={handleInputChange}
              onBlur={(event) =>
                validateField("companyEmail", event.target, getFieldValidationOptions("companyEmail"))
              }
              className={getFieldClassName("companyEmail")}
              required
              {...getFieldA11yProps("companyEmail")}
            />
            {getFieldError("companyEmail") && (
              <p id={getFieldErrorId("companyEmail")} className="mt-1 text-sm text-red-600">
                {getFieldError("companyEmail")}
              </p>
            )}
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="companyPhone" className="mb-2 font-medium text-gray-700">
              Company Phone Number
            </label>
            <input
              type="tel"
              id="companyPhone"
              name="companyPhone"
              placeholder="(555) 555-5555"
              value={formData.companyPhone}
              onChange={handleInputChange}
              onBlur={(event) =>
                validateField("companyPhone", event.target, getFieldValidationOptions("companyPhone"))
              }
              className={getFieldClassName("companyPhone")}
              required
              {...getFieldA11yProps("companyPhone")}
            />
            {getFieldError("companyPhone") && (
              <p id={getFieldErrorId("companyPhone")} className="mt-1 text-sm text-red-600">
                {getFieldError("companyPhone")}
              </p>
            )}
          </div>
        </div>

        {/* Address & Building Size */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="companyAddress" className="mb-2 font-medium text-gray-700">
              Company Address
            </label>
            <input
              type="text"
              id="companyAddress"
              name="companyAddress"
              placeholder="Street, City, State"
              value={formData.companyAddress}
              onChange={handleInputChange}
              onBlur={(event) =>
                validateField("companyAddress", event.target, getFieldValidationOptions("companyAddress"))
              }
              className={getFieldClassName("companyAddress")}
              required
              {...getFieldA11yProps("companyAddress")}
            />
            {getFieldError("companyAddress") && (
              <p
                id={getFieldErrorId("companyAddress")}
                className="mt-1 text-sm text-red-600"
              >
                {getFieldError("companyAddress")}
              </p>
            )}
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="squareFoot" className="mb-2 font-medium text-gray-700">
              Building Size (sq ft)
            </label>
            <input
              type="number"
              min="1"
              id="squareFoot"
              name="squareFoot"
              placeholder="e.g. 5000"
              value={formData.squareFoot}
              onChange={handleInputChange}
              onBlur={(event) =>
                validateField("squareFoot", event.target, getFieldValidationOptions("squareFoot"))
              }
              className={getFieldClassName("squareFoot")}
              required
              {...getFieldA11yProps("squareFoot")}
            />
            {getFieldError("squareFoot") && (
              <p id={getFieldErrorId("squareFoot")} className="mt-1 text-sm text-red-600">
                {getFieldError("squareFoot")}
              </p>
            )}
          </div>
        </div>

        {/* Cleaning Services */}
        <div className="flex flex-col">
          <p className="mb-2 font-medium text-gray-700">Type of Cleaning Services</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cleaningServiceOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2 hover:border-[#C85344] transition"
              >
                <input
                  type="checkbox"
                  checked={formData.cleaningServices.includes(option.value)}
                  onChange={() => handleServiceToggle(option.value)}
                  className="h-4 w-4 text-[#C85344] focus:ring-[#C85344]"
                />
                <span className="text-gray-800">{option.label}</span>
              </label>
            ))}
          </div>
          {getFieldError("cleaningServices") && (
            <p
              id={getFieldErrorId("cleaningServices")}
              className="mt-1 text-sm text-red-600"
            >
              {getFieldError("cleaningServices")}
            </p>
          )}
        </div>

        {/* Frequency & Schedule */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="cleaningFrequency" className="mb-2 font-medium text-gray-700">
              Cleaning Frequency
            </label>
            <select
              id="cleaningFrequency"
              name="cleaningFrequency"
              value={formData.cleaningFrequency}
              onChange={handleInputChange}
              onBlur={(event) =>
                validateField(
                  "cleaningFrequency",
                  event.target,
                  getFieldValidationOptions("cleaningFrequency")
                )
              }
              className={getFieldClassName("cleaningFrequency")}
              required
              {...getFieldA11yProps("cleaningFrequency")}
            >
              <option value="">Select frequency</option>
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {getFieldError("cleaningFrequency") && (
              <p
                id={getFieldErrorId("cleaningFrequency")}
                className="mt-1 text-sm text-red-600"
              >
                {getFieldError("cleaningFrequency")}
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <label htmlFor="preferredDate" className="mb-2 font-medium text-gray-700">
              Preferred Date
            </label>
            <input
              type="date"
              id="preferredDate"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleInputChange}
              onBlur={(event) =>
                validateField("preferredDate", event.target, getFieldValidationOptions("preferredDate"))
              }
              className={getFieldClassName("preferredDate")}
              required
              {...getFieldA11yProps("preferredDate")}
            />
            {getFieldError("preferredDate") && (
              <p
                id={getFieldErrorId("preferredDate")}
                className="mt-1 text-sm text-red-600"
              >
                {getFieldError("preferredDate")}
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <label htmlFor="preferredTime" className="mb-2 font-medium text-gray-700">
              Preferred Time
            </label>
            <input
              type="text"
              id="preferredTime"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleInputChange}
              onBlur={handlePreferredTimeBlur}
              placeholder="9:00 AM"
              inputMode="text"
              className={getFieldClassName("preferredTime")}
              required
              {...getFieldA11yProps("preferredTime")}
            />
            {getFieldError("preferredTime") && (
              <p
                id={getFieldErrorId("preferredTime")}
                className="mt-1 text-sm text-red-600"
              >
                {getFieldError("preferredTime")}
              </p>
            )}
          </div>
        </div>

        {/* Special Request */}
        <div className="flex flex-col">
          <label htmlFor="specialRequest" className="mb-2 font-medium text-gray-700">
            Special Request (optional)
          </label>
          <textarea
            id="specialRequest"
            rows="4"
            placeholder="Share any access instructions or notes..."
            value={formData.specialRequest}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#C85344]"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#C85344] text-white p-4 rounded-lg hover:bg-[#b84335] transition font-medium text-lg disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Schedule Site Visit"}
        </button>
      </form>

      <section className="mt-10 rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-2xl font-bold text-gray-900">
          Complete Facility Cleaning for Businesses in Columbus
        </h2>
        <p className="mt-4 text-base leading-7 text-gray-700">
          Superfly Services goes beyond standard cleaning companies by
          providing full-service commercial cleaning solutions in Columbus and
          Central Ohio. We handle everything from cleaning schedules to supply
          management so business owners and managers can focus on daily
          operations.
        </p>
        <p className="mt-4 text-base leading-7 text-gray-700">
          Whether you manage an office, facility, or commercial space, our goal
          is to deliver dependable cleaning services that keep your environment
          clean, professional, and ready for business.
        </p>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Successfully Booked!
            </h3>
            
            <p className="text-gray-600 mb-6">
              Your site visit has been successfully booked. Our team will contact you shortly to confirm the details.
            </p>
            
            <button
              onClick={closeModal}
              className="w-full bg-[#C85344] text-white py-3 rounded-lg hover:bg-[#b84335] transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookSiteVisitCommercial;

