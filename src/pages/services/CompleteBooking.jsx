import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function CompleteBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { details, totalPrice } = location.state || {};
  const [selectedDate, setSelectedDate] = useState("");

  if (!details || Object.keys(details).length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-5">
        <p className="text-gray-700 text-lg">
          No booking details found. Please select cleaning options first.
        </p>
        <button
          onClick={() => navigate("/services/residential")}
          className="mt-4 bg-[#C85344] text-white px-6 py-3 rounded-lg hover:bg-[#b84335] transition"
        >
          Back to Cleaning Form
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-5 md:px-8 space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
        Complete Your Booking
      </h1>

      {/* Cleaning Details Card */}
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Selected Cleaning Items</h2>
        {Object.entries(details).map(([key, qty]) => (
          <div
            key={key}
            className="flex justify-between items-center border-b border-gray-200 py-2"
          >
            <span className="capitalize text-gray-800">{key}</span>
            <span className="font-medium text-gray-700">{qty}</span>
          </div>
        ))}
        <div className="flex justify-between items-center font-bold text-lg mt-4 text-gray-900">
          <span>Total</span>
          <span>${totalPrice}</span>
        </div>
      </div>

      {/* Date Picker Card */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <label htmlFor="date" className="block mb-2 font-medium text-gray-700">
          Select Date
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]"
        />
      </div>

      {/* Payment Summary / Action */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <button className="flex-1 bg-[#C85344] text-white p-4 rounded-lg hover:bg-[#b84335] transition font-medium text-lg">
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}

export default CompleteBooking;
