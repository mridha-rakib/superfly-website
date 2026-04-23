import { useState } from "react";
import { toast } from "@/lib/notify";
import { quoteApi } from "../../services/quoteApi";
import { useAuthStore } from "../../state/useAuthStore";
import { formatTimeTo12Hour, parseTimeTo24Hour } from "../../lib/time-utils";

function BookSiteVisitPostConstraction() {
  const processSteps = [
    {
      title: "1. Submit Project Details",
      body:
        "Start by filling out the form with information about your construction site. Let us know the size of the project, timeline, and type of cleaning needed so we can begin planning your service.",
    },
    {
      title: "2. Schedule a Site Visit",
      body:
        "Our team coordinates a walkthrough of the job site to assess the scope of work. We meet with the general contractor, project manager, or site supervisor to understand all cleaning requirements.",
    },
    {
      title: "3. On-Site Evaluation",
      body:
        "During the visit, we evaluate the condition of the site, identify all areas that require cleaning, and determine whether the project needs progress cleaning, multi-phase cleaning, or a final construction clean.",
    },
    {
      title: "4. Customized Cleaning Plan & Quote",
      body:
        "We create a tailored post-construction cleaning scope of work based on your project. This includes the type of cleaning required, timeline, and a detailed quote designed to meet your budget and deadlines.",
    },
    {
      title: "5. Professional Cleaning Execution",
      body:
        "Our team delivers high-quality cleaning services to remove dust, debris, and construction residue. We ensure the site is clean, safe, and ready for inspection, occupancy, or handoff.",
    },
  ];

  const { user } = useAuthStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.fullName || user?.name || "",
    company: "",
    email: "",
    phone: "",
    address: "",
    preferredDate: "",
    preferredTime: "",
    specialRequest: "",
    squareFoot: "",
    gcName: "",
    gcPhone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    const normalizeDate = (value) => {
      if (!value) return "";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10); // YYYY-MM-DD
    };
    const payload = {
      serviceType: "post_construction",
      name: formData.name.trim(),
      companyName: formData.company.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phone.trim(),
      businessAddress: formData.address.trim(),
      preferredDate: normalizeDate(formData.preferredDate),
      preferredTime: parseTimeTo24Hour(formData.preferredTime),
      specialRequest: formData.specialRequest.trim(),
      squareFoot: Number(formData.squareFoot) || undefined,
      generalContractorName: formData.gcName.trim(),
      generalContractorPhone: formData.gcPhone.trim(),
    };

    if (
      !payload.name ||
      !payload.companyName ||
      !payload.email ||
      !payload.phoneNumber ||
      !payload.businessAddress ||
      !payload.preferredDate ||
      !payload.preferredTime ||
      !payload.specialRequest ||
      !payload.squareFoot ||
      !payload.generalContractorName ||
      !payload.generalContractorPhone
    ) {
      setError("All fields are required. Please complete the form.");
      setIsSubmitting(false);
      return;
    }

    quoteApi
      .createPostConstructionRequest({
        ...payload,
      })
      .then(() => {
        setShowSuccessModal(true);
        setFormData({
          name: user?.fullName || user?.name || "",
          company: "",
          email: "",
          phone: "",
          address: "",
          preferredDate: "",
          preferredTime: "",
          specialRequest: "",
          squareFoot: "",
          gcName: "",
          gcPhone: "",
        });
      })
      .catch((err) => {
        const raw = err?.response?.data;
        const msg =
          raw?.message ||
          raw?.error ||
          err?.message ||
          "Could not submit request. Please try again.";
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
  };

  const handlePreferredTimeBlur = (e) => {
    const normalized = parseTimeTo24Hour(e.target.value);
    if (!normalized) return;
    setFormData((prev) => ({
      ...prev,
      preferredTime: formatTimeTo12Hour(normalized),
    }));
  };

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-5 md:px-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 text-center">
        How Our Post-Construction Cleaning Process Works
      </h1>
      <p className="mb-8 text-gray-700 text-center text-lg">
        At Superfly Services, we provide detailed and reliable
        post-construction cleaning services in Columbus and throughout Ohio. We
        work with general contractors, project managers, and builders to
        deliver customized cleaning solutions that prepare job sites for final
        turnover.
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
        className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-6 border border-gray-200"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {/* Row 1: Full Name & Company */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="name" className="mb-2 font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="company" className="mb-2 font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Company Name"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
            />
          </div>
        </div>

        {/* Row 2: Email & Phone */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="email" className="mb-2 font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="phone" className="mb-2 font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone Number"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
            />
          </div>
        </div>

        {/* Row 3: Address */}
        <div className="flex flex-col">
          <label htmlFor="address" className="mb-2 font-medium text-gray-700">
          Site Address
          </label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Visited Area"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
          />
        </div>

        {/* Row 3b: Site details */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="squareFoot" className="mb-2 font-medium text-gray-700">
              Total Square Footage (sq ft)
            </label>
            <input
              type="number"
              min="1"
              id="squareFoot"
              value={formData.squareFoot}
              onChange={handleInputChange}
              placeholder="e.g. 8000"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="gcName" className="mb-2 font-medium text-gray-700">
              General Contractor Name
            </label>
            <input
              type="text"
              id="gcName"
              value={formData.gcName}
              onChange={handleInputChange}
              placeholder="Contractor full name"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
            />
          </div>
        </div>

        {/* Row 3c: Contractor contact */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="gcPhone" className="mb-2 font-medium text-gray-700">
              General Contractor Contact Number
            </label>
            <input
              type="tel"
              id="gcPhone"
              value={formData.gcPhone}
              onChange={handleInputChange}
              placeholder="(555) 123-4567"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
            />
          </div>
          <div className="flex-1" />
        </div>

        {/* Row 4: Preferred Date & Time */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label
              htmlFor="preferredDate"
              className="mb-2 font-medium text-gray-700"
            >
              Preferred Date
            </label>
            <input
              type="date"
              id="preferredDate"
              value={formData.preferredDate}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label
              htmlFor="preferredTime"
              className="mb-2 font-medium text-gray-700"
            >
              Preferred Time
            </label>
            <input
              type="text"
              id="preferredTime"
              value={formData.preferredTime}
              onChange={handleInputChange}
              onBlur={handlePreferredTimeBlur}
              placeholder="hh:mm AM/PM"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
            />
          </div>
        </div>

        {/* Row 5: Special Request */}
        <div className="flex flex-col">
          <label
            htmlFor="specialRequest"
            className="mb-2 font-medium text-gray-700"
          >
            Special Request
          </label>
          <textarea
            id="specialRequest"
            value={formData.specialRequest}
            onChange={handleInputChange}
            rows="5"
            placeholder="Write your request here..."
            className="p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#C85344]"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#C85344] text-white p-4 rounded-xl hover:bg-[#b84335] transition font-medium text-lg disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit Project Details"}
        </button>
      </form>

      <section className="mt-10 rounded-lg bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900">
          Post-Construction Cleaning Services Across Ohio
        </h2>
        <p className="mt-4 text-base leading-7 text-gray-700">
          Superfly Services provides professional construction cleaning
          services in Columbus, Central Ohio, and surrounding areas. Whether
          it's a residential build, commercial project, or renovation, we
          deliver dependable cleaning solutions tailored to your project.
        </p>
        <p className="mt-4 text-base leading-7 text-gray-700">
          We work closely with contractors and project managers to ensure every
          job site is completed to a high standard and ready for the next
          phase.
        </p>
      </section>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Successfully Booked!
            </h3>

            <p className="text-gray-600 mb-6">
              Your site visit has been successfully booked. Our team will
              contact you shortly to confirm the details.
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

export default BookSiteVisitPostConstraction;

