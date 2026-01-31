import { useState } from "react";
import { toast } from "react-toastify";
import { quoteApi } from "../../services/quoteApi";
import { useAuthStore } from "../../state/useAuthStore";

function BookSiteVisitPostConstraction() {
  const { user } = useAuthStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    preferredDate: "",
    preferredTime: "",
    specialRequest: ""
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
      preferredTime: formData.preferredTime.trim(),
      specialRequest: formData.specialRequest.trim(),
    };

    if (
      !payload.name ||
      !payload.companyName ||
      !payload.email ||
      !payload.phoneNumber ||
      !payload.businessAddress ||
      !payload.preferredDate ||
      !payload.preferredTime ||
      !payload.specialRequest
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
          name: "",
          company: "",
          email: "",
          phone: "",
          address: "",
          preferredDate: "",
          preferredTime: "",
          specialRequest: ""
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

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-5 md:px-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 text-center">
        Book Site Visit for Post Construction Cleaning
      </h1>
      <p className="mb-8 text-gray-700 text-center text-lg">
        Fill up the form below to book a site visit for post construction
        cleaning.
      </p>

      <form
        className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-6 border border-gray-200"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {/* Row 1: Name & Company */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="name" className="mb-2 font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
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
              type="time"
              id="preferredTime"
              value={formData.preferredTime}
              onChange={handleInputChange}
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
          {isSubmitting ? "Submitting..." : "Book a visit"}
        </button>
      </form>
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
