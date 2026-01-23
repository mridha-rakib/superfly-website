import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Sample bookings data
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

function MyJobs() {
  const [activeTab, setActiveTab] = useState("all");
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

  const renderButtons = (status) => {
    switch (status) {
      case "upcoming":
        return (
          <button className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600">
            Cancel
          </button>
        );
      case "in progress":
        return (
          <button className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
            Review
          </button>
        );
      case "completed":
        return (
          <button className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600">
            Leave Review
          </button>
        );
      default:
        return null;
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

  return (
    <div className="max-w-5xl mx-auto py-10 px-5">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 text-center">My Jobs</h1>

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
            {/* Left Info (same order as ViewBookingDetails) */}
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-lg">
                {booking.type} Cleaning
              </span>

              <span
                className={`px-2 py-1 rounded text-white text-sm w-max ${getStatusColor(
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
                onClick={() => navigate(`/my-jobs/${booking.id}`)}
                className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                View Details
              </button>

              {renderButtons(booking.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyJobs;
