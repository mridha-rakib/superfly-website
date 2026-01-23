import React from "react";
import { useNavigate } from "react-router-dom";

function CheckoutCancel() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 md:px-8 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Payment Canceled
      </h1>
      <p className="text-gray-700 mb-6">
        Your checkout session was canceled. No charges were made. You can resume your booking or
        update your selections anytime.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate("/services/residential")}
          className="px-6 py-3 rounded-lg bg-[#C85344] text-white hover:bg-[#b84335] transition"
        >
          Return to Cleaning Form
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default CheckoutCancel;
