import { useState } from "react";
import { toast } from "react-toastify";
import { quoteApi } from "../../services/quoteApi";
import { useAuthStore } from "../../state/useAuthStore";

function BookSiteVisitCommercial() {
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

    const numericSquareFoot = Number(formData.squareFoot);
    const validationErrors = [];

    if (!formData.companyName.trim()) validationErrors.push("Company Name is required.");
    if (!formData.companyAddress.trim()) validationErrors.push("Company Address is required.");
    if (!formData.companyPhone.trim()) validationErrors.push("Company Phone Number is required.");
    if (!formData.companyEmail.trim()) validationErrors.push("Company Email is required.");
    if (!formData.preferredDate) validationErrors.push("Preferred Date is required.");
    if (!formData.preferredTime) validationErrors.push("Preferred Time is required.");
    if (!formData.cleaningFrequency) validationErrors.push("Cleaning Frequency is required.");
    if (!formData.cleaningServices.length)
      validationErrors.push("Select at least one type of cleaning service.");
    if (!Number.isFinite(numericSquareFoot) || numericSquareFoot <= 0)
      validationErrors.push("Building Size must be a positive number.");

    if (validationErrors.length) {
      setIsSubmitting(false);
      setError(validationErrors.join(" "));
      return;
    }

    quoteApi
      .createCommercialRequest({
        serviceType: "commercial",
        name: formData.name,
        companyName: formData.companyName,
        email: formData.companyEmail,
        phoneNumber: formData.companyPhone,
        businessAddress: formData.companyAddress,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
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
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleServiceToggle = (value) => {
    setFormData((prev) => {
      const exists = prev.cleaningServices.includes(value);
      const updated = exists
        ? prev.cleaningServices.filter((item) => item !== value)
        : [...prev.cleaningServices, value];
      return { ...prev, cleaningServices: updated };
    });
  };

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-5 md:px-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 text-center">
        Commercial Cleaning Information
      </h1>
      <p className="mb-8 text-gray-700 text-center text-lg">
        Provide your company details so we can prepare an accurate quote.
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
        {/* Contact + Company */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="name" className="mb-2 font-medium text-gray-700">
              Contact Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Contact name"
              value={formData.name}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="companyName" className="mb-2 font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
            />
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
              placeholder="email@company.com"
              value={formData.companyEmail}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="companyPhone" className="mb-2 font-medium text-gray-700">
              Company Phone Number
            </label>
            <input
              type="tel"
              id="companyPhone"
              placeholder="(555) 555-5555"
              value={formData.companyPhone}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
            />
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
              placeholder="Street, City, State"
              value={formData.companyAddress}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="squareFoot" className="mb-2 font-medium text-gray-700">
              Building Size (sq ft)
            </label>
            <input
              type="number"
              min="1"
              id="squareFoot"
              placeholder="e.g. 5000"
              value={formData.squareFoot}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
            />
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
        </div>

        {/* Frequency & Schedule */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="cleaningFrequency" className="mb-2 font-medium text-gray-700">
              Cleaning Frequency
            </label>
            <select
              id="cleaningFrequency"
              value={formData.cleaningFrequency}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
              required
            >
              <option value="">Select frequency</option>
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

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
          {isSubmitting ? "Submitting..." : "Submit info."}
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
