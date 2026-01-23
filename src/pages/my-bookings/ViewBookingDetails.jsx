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

  const deriveStatus = (quote) => {
    const hasCleaner =
      Boolean(quote.assignedCleanerId) ||
      Boolean(quote.assignedCleanerIds && quote.assignedCleanerIds.length);
    const cleaning = quote.cleaningStatus;
    const report = quote.reportStatus;
    const isCompleted = report === "approved" || quote.status === "completed";
    if (isCompleted) return "completed";
    if (report === "pending" && cleaning === "completed") return "report_submitted";
    if (cleaning === "cleaning_in_progress") return "ongoing";
    if (hasCleaner) return "assigned";
    return "booked";
  };

  const statusBadge = (status) => {
    switch (status) {
      case "booked":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "assigned":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "ongoing":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "report_submitted":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
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
              {(() => {
                const status = deriveStatus(booking);
                return (
                  <span
                    className={`px-3 py-1 rounded-md text-sm border ${statusBadge(
                      status
                    )}`}
                  >
                    {status.replace(/_/g, " ").toUpperCase()}
                  </span>
                );
              })()}
            </div>

            <div className="flex justify-between">
              <p className="font-medium text-gray-700">Payment Status:</p>
              <span className="px-3 py-1 rounded-md text-sm border bg-green-100 text-green-700 border-green-300">
                {(booking.paymentStatus || "paid").toUpperCase()}
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
    
