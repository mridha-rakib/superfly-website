import React from "react";
import { FaDollarSign, FaClock, FaCheckCircle } from "react-icons/fa";

function Earning() {
  const stats = [
    { label: "Total Earnings", value: "$2,540", icon: <FaDollarSign className="text-2xl text-[#C85344]" /> },
    { label: "Pending Payments", value: "$620", icon: <FaClock className="text-2xl text-yellow-500" /> },
    { label: "Paid Amount", value: "$1,920", icon: <FaCheckCircle className="text-2xl text-green-500" /> },
  ];

  const jobs = [
    { id: "JOB-1012", type: "Residential Cleaning", date: "2025-12-10", amount: 120, paymentStatus: "paid" },
    { id: "JOB-1013", type: "Commercial Cleaning", date: "2025-12-12", amount: 280, paymentStatus: "pending" },
    { id: "JOB-1014", type: "Post-Construction", date: "2025-12-14", amount: 450, paymentStatus: "paid" },
    { id: "JOB-1015", type: "Residential Cleaning", date: "2025-12-16", amount: 300, paymentStatus: "pending" },
  ];

  const getPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 border border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 space-y-10">
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900">Earnings Dashboard</h1>

      {/* Small Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white shadow-md border rounded-xl p-6 flex flex-col items-center hover:shadow-lg transition"
          >
            <div className="mb-3">{stat.icon}</div>
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl md:text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Jobs List */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">My Jobs</h2>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-white border rounded-xl shadow-md hover:shadow-lg transition"
            >
              {/* Left Section */}
              <div className="mb-3 md:mb-0">
                <p className="font-semibold text-lg text-gray-900">{job.type}</p>
                <p className="text-gray-500 text-sm">
                  Job ID: <span className="font-medium">{job.id}</span>
                </p>
                <p className="text-gray-500 text-sm">Date: {job.date}</p>
              </div>

              {/* Right Section */}
              <div className="text-right">
                <p className="font-semibold text-lg text-gray-900">${job.amount}</p>
                <span
                  className={`px-4 py-1 text-sm rounded-full mt-2 inline-block font-medium ${getPaymentBadge(
                    job.paymentStatus
                  )}`}
                >
                  {job.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Earning;
