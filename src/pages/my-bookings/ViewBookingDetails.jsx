import React from "react";
import { useParams } from "react-router-dom";
import { bookingsData } from "../../data/bookingsData";

function ViewBookingDetails() {
  const { id } = useParams();
  const booking = bookingsData.find((b) => b.id === Number(id));

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto p-5 text-center text-red-500 text-lg">
        No booking details found.
      </div>
    );
  }

  const getPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "unpaid":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-6 text-center">Booking Details</h1>

      <div className="bg-white border rounded-lg shadow-sm p-6 space-y-6">
        
        {/* BASIC INFO */}
        <div>
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">General Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="font-medium text-gray-700">Booking ID:</p>
              <p className="text-gray-800">{booking.bookingId}</p>
            </div>

            <div className="flex justify-between">
              <p className="font-medium text-gray-700">Cleaning Type:</p>
              <p className="text-gray-800">{booking.type}</p>
            </div>

            <div className="flex justify-between">
              <p className="font-medium text-gray-700">Status:</p>
              <p className="text-gray-800 capitalize">{booking.status}</p>
            </div>

            <div className="flex justify-between">
              <p className="font-medium text-gray-700">Payment Status:</p>
              <span
                className={`px-3 py-1 rounded-md text-sm border ${getPaymentBadge(
                  booking.paymentStatus
                )}`}
              >
                {booking.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* ADDRESS */}
        <div>
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">Location</h2>
          <p className="text-gray-800">{booking.address}</p>
        </div>

        {/* DATE & TIME */}
        <div>
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">Schedule</h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="font-medium text-gray-700">Date:</p>
              <p className="text-gray-800">{booking.date}</p>
            </div>

            <div className="flex justify-between">
              <p className="font-medium text-gray-700">Time:</p>
              <p className="text-gray-800">{booking.time}</p>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div>
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">Cleaning Items</h2>

          <div className="divide-y border rounded">
            {booking.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between p-3 bg-gray-50"
              >
                <p className="text-gray-800">
                  {item.name} (x{item.qty})
                </p>
                <p className="text-gray-700 font-medium">${item.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PRICE */}
        <div>
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">Payment Summary</h2>

          <div className="flex justify-between text-lg font-semibold">
            <p>Total Price:</p>
            <p>${booking.price}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ViewBookingDetails;
    