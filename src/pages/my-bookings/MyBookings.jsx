import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyBookings() {
  const [activeTab, setActiveTab] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [modalBooking, setModalBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading] = useState(false);
  const [error] = useState("");

  const navigate = useNavigate();

  const tabs = [
    { id: "all", label: "All Bookings" },
    { id: "booked", label: "Booked" },
    { id: "assigned", label: "Assigned" },
    { id: "ongoing", label: "Ongoing" },
    { id: "report_submitted", label: "Report Submitted" },
    { id: "completed", label: "Completed" },
  ];

  const deriveStatus = (quote) => {
    if (quote.clientStatus) return quote.clientStatus;
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

  // TODO: replace mock data with real API when available

  const filteredBookings =
    activeTab === "all"
      ? bookingsData
      : bookingsData.filter((b) => deriveStatus(b) === activeTab);

  const renderButtons = (booking) => {
    const status = deriveStatus(booking);
    if (status === "completed") {
      return (
        <button
          onClick={() => openReviewModal(booking)}
          className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Leave Review
        </button>
      );
    } else {
      return (
        <button
          disabled
          className="px-4 py-1 bg-gray-300 text-white rounded cursor-not-allowed"
        >
          Review
        </button>
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "booked":
        return "bg-blue-500";
      case "assigned":
        return "bg-indigo-500";
      case "ongoing":
        return "bg-yellow-500";
      case "report_submitted":
        return "bg-purple-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const openReviewModal = (booking) => {
    setModalBooking(booking);
    setRating(0);
    setComment("");
  };

  const closeModal = () => {
    setModalBooking(null);
  };

  const submitReview = () => {
    console.log("Booking:", modalBooking.bookingId);
    console.log("Rating:", rating);
    console.log("Comment:", comment);
    closeModal();
    alert("Review submitted successfully!");
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-5">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 text-center">My Bookings</h1>

      {/* Tabs */}
      <div className="flex justify-center mb-8 border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 mx-1 font-medium ${
              activeTab === tab.id
                ? "border-b-2 border-[#C85344] text-[#C85344]"
                : "text-gray-600 hover:text-[#C85344]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div className="space-y-4">
        {filteredBookings.length === 0 && (
          <p className="text-center text-gray-500">No bookings found.</p>
        )}

        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="flex justify-between items-center p-5 border border-gray-200 rounded shadow-sm hover:shadow-md transition"
          >
            {/* Left Info */}
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-lg">{booking.type} Cleaning</span>

              {(() => {
                const status = deriveStatus(booking);
                return (
                  <span
                    className={`px-2 py-1 rounded-2xl  text-white text-sm w-max ${getStatusColor(
                      status
                    )}`}
                  >
                    {status.replace(/_/g, " ").toUpperCase()}
                  </span>
                );
              })()}

              <span className="text-gray-700 font-medium">
                Booking ID: {booking.bookingId}
              </span>

              <span className="text-gray-600">{booking.date}</span>

              <span className="text-gray-600">{booking.time}</span>
            </div>

            {/* Right Buttons */}
            <div className="flex flex-col justify-center gap-2 text-right">
              <button
                onClick={() => navigate(`/my-booking/${booking.id}`)}
                className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                View Details
              </button>

              {renderButtons(booking)}
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {modalBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Leave a Review</h2>
            <p className="mb-2 font-medium">Booking: {modalBooking.bookingId}</p>

            {/* Star Rating */}
            <div className="flex mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  onClick={() => setRating(i + 1)}
                  className={`text-3xl cursor-pointer ${
                    i < rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              placeholder="Write your review here..."
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#C85344] resize-none mb-4"
            ></textarea>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="px-4 py-2 bg-[#C85344] text-white rounded hover:bg-[#b84335]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
