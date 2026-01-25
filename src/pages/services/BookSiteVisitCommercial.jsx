import React, { useState } from "react";
import { quoteApi } from "../../services/quoteApi";
import { useAuthStore } from "../../state/useAuthStore";
import { toast } from "react-toastify";

function BookSiteVisitCommercial() {
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
    quoteApi
      .createCommercialRequest({
        serviceType: "commercial",
        name: formData.name,
        companyName: formData.company,
        email: formData.email,
        phoneNumber: formData.phone,
        businessAddress: formData.address,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        specialRequest: formData.specialRequest,
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
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Could not submit request. Please try again.";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-5 md:px-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 text-center">
        Book Site Visit for Commercial Cleaning
      </h1>
      <p className="mb-8 text-gray-700 text-center text-lg">
        Fill up the form below to book a site visit for commercial cleaning.
      </p>

      <form
        className="bg-white shadow-md rounded-lg p-6 md:p-8 space-y-6 border border-gray-200"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {/* Row 1: Name & Company Name */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="name" className="mb-2 font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="company" className="mb-2 font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="company"
              placeholder="Company Name"
              value={formData.company}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
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
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="phone" className="mb-2 font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
            />
          </div>
        </div>

        {/* Row 3: Business Address */}
        <div className="flex flex-col">
          <label htmlFor="address" className="mb-2 font-medium text-gray-700">
            Business Address
          </label>
          <input
            type="text"
            id="address"
            placeholder="Business Address"
            value={formData.address}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
            required
          />
        </div>

        {/* Row 4: Preferred Date & Time */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="preferredDate" className="mb-2 font-medium text-gray-700">
              Preferred Date
            </label>
            <input
              type="date"
              id="preferredDate"
              value={formData.preferredDate}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="preferredTime" className="mb-2 font-medium text-gray-700">
              Preferred Time
            </label>
            <input
              type="time"
              id="preferredTime"
              value={formData.preferredTime}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
            />
          </div>
        </div>

        {/* Row 5: Special Request */}
        <div className="flex flex-col">
          <label htmlFor="specialRequest" className="mb-2 font-medium text-gray-700">
            Special Request
          </label>
          <textarea
            id="specialRequest"
            rows="5"
            placeholder="Write your request here..."
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
          {isSubmitting ? "Submitting..." : "Book a visit"}
        </button>
      </form>

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
