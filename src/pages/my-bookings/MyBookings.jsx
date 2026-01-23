import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const bookingsData = [
  {
    id: 1,
    bookingId: "BKG-1001",
    type: "Residential",
    address: "123 Maple Street, NY",
    date: "2025-12-10",
    time: "10:00 AM",
    items: [
      { name: "Bedroom Cleaning", qty: 2, price: 30 },
      { name: "Bathroom Cleaning", qty: 1, price: 20 },
    ],
    price: 80,
    status: "upcoming",
  },
  {
    id: 2,
    bookingId: "BKG-1002",
    type: "Commercial",
    address: "Office Tower, Floor 3",
    date: "2025-12-08",
    time: "2:00 PM",
    items: [{ name: "Office Cleaning", qty: 1, price: 150 }],
    price: 150,
    status: "in progress",
  },
  {
    id: 3,
    bookingId: "BKG-1003",
    type: "Post-Construction",
    address: "45 Sunset Road",
    date: "2025-11-25",
    time: "11:30 AM",
    items: [
      { name: "Deep Cleaning", qty: 1, price: 200 },
      { name: "Debris Removal", qty: 1, price: 80 },
    ],
    price: 280,
    status: "completed",
  },
];

function MyBookings() {
  const [activeTab, setActiveTab] = useState("all");
  const [modalBooking, setModalBooking] = useState(null); // booking for review
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const navigate = useNavigate();

  const tabs = [
    { id: "all", label: "All Bookings" },
    { id: "upcoming", label: "Upcoming" },
    { id: "in progress", label: "Ongoing" },
    { id: "completed", label: "Completed" },
  ];

  const filteredBookings =
    activeTab === "all"
      ? bookingsData
      : bookingsData.filter((b) => b.status === activeTab);

  const renderButtons = (booking) => {
    if (booking.status === "completed") {
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
      case "upcoming":
        return "bg-blue-500";
      case "in progress":
        return "bg-yellow-500";
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

              <span
                className={`px-2 py-1 rounded-2xl  text-white text-sm w-max ${getStatusColor(
                  booking.status
                )}`}
              >
                {booking.status.toUpperCase()}
              </span>

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
