import React, { useEffect, useMemo, useState } from "react";
import { FaDollarSign, FaClock, FaCheckCircle } from "react-icons/fa";
import { quoteApi } from "../../services/quoteApi";
import { useAuthStore } from "../../state/useAuthStore";

const formatMoney = (amount = 0, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

function Earning() {
  const { isAuthenticated, role } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    role: s.role,
  }));

  const [summary, setSummary] = useState({
    totalEarning: 0,
    paidAmount: 0,
    pendingAmount: 0,
    currency: "USD",
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || role !== "cleaner") return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const summaryRes = await quoteApi.getCleanerEarnings();
        const data =
          summaryRes?.data?.data ||
          summaryRes?.data ||
          summaryRes ||
          summary;
        setSummary({
          totalEarning: Number(data.totalEarning || 0),
          paidAmount: Number(data.paidAmount || 0),
          pendingAmount: Number(data.pendingAmount || 0),
          currency: data.currency || "USD",
        });

        const jobsRes = await quoteApi.listCleanerAssigned();
        const items =
          jobsRes?.data?.data ||
          jobsRes?.data ||
          jobsRes?.items ||
          jobsRes ||
          [];
        setJobs(Array.isArray(items) ? items : []);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load earnings.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, role]);

  const stats = useMemo(
    () => [
      {
        label: "Total Earnings",
        value: formatMoney(summary.totalEarning, summary.currency),
        icon: <FaDollarSign className="text-2xl text-[#C85344]" />,
        helper: "Total from completed jobs.",
      },
      {
        label: "Pending Payments",
        value: formatMoney(summary.pendingAmount, summary.currency),
        icon: <FaClock className="text-2xl text-yellow-500" />,
        helper: "After you submit a report, admin approval keeps it pending.",
      },
      {
        label: "Paid Amount",
        value: formatMoney(summary.paidAmount, summary.currency),
        icon: <FaCheckCircle className="text-2xl text-red-500" />,
        helper: "Added to this tab as soon as the admin approves the report.",
        cardClass: "border-red-100 text-red-900 ring-1 ring-red-50 shadow-lg hover:shadow-xl",
        valueClass: "text-red-900",
      },
    ],
    [summary]
  );

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

  const getJobStatusBadge = (variant) => {
    switch (variant) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "pendingApproval":
        return "bg-amber-50 text-amber-800 border border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const resolvedJobs = useMemo(() => {
    return (jobs || []).map((job) => {
      const isCompleted =
        job.reportStatus === "approved" || job.status === "completed";
      const isPendingApproval = job.reportStatus === "pending" && !isCompleted;

      const paymentStatus = isCompleted ? "paid" : "pending";
      const statusLabel = isCompleted
        ? "Completed"
        : isPendingApproval
        ? "Pending admin approval"
        : "Assigned";
      const statusVariant = isCompleted
        ? "completed"
        : isPendingApproval
        ? "pendingApproval"
        : "assigned";

      return {
        id: job._id || job.id || "N/A",
        type: job.serviceType
          ? job.serviceType.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
          : "Cleaning",
        date: job.serviceDate || "-",
        amount: job.cleanerEarningAmount || 0,
        paymentStatus,
        statusLabel,
        statusVariant,
      };
    });
  }, [jobs]);

  if (!isAuthenticated || role !== "cleaner") {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-10">
        <p className="text-center text-gray-700">
          Sign in as a cleaner to view earnings.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 space-y-10">
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900">Earnings Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      {/* Small Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`bg-white shadow-md border rounded-xl p-6 flex flex-col items-center hover:shadow-lg transition ${stat.cardClass || ""}`}
          >
            <div className="mb-3">{stat.icon}</div>
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className={`text-2xl md:text-3xl font-bold mt-1 ${stat.valueClass || "text-gray-900"}`}>
              {loading ? "..." : stat.value}
            </p>
            {stat.helper && (
              <p className="text-xs text-gray-500 text-center mt-2 px-2">{stat.helper}</p>
            )}
          </div>
        ))}
      </div>

      {/* Jobs List */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">My Jobs</h2>

        <div className="space-y-4">
          {loading && resolvedJobs.length === 0 ? (
            <p className="text-gray-600">Loading jobs...</p>
          ) : resolvedJobs.length === 0 ? (
            <p className="text-gray-500">No jobs found.</p>
          ) : (
            resolvedJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-white border rounded-xl shadow-md hover:shadow-lg transition"
              >
                {/* Left Section */}
                <div className="mb-3 md:mb-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-lg text-gray-900">{job.type}</p>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getJobStatusBadge(
                        job.statusVariant
                      )}`}
                    >
                      {job.statusLabel}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    Job ID: <span className="font-medium">{job.id}</span>
                  </p>
                  <p className="text-gray-500 text-sm">Date: {job.date}</p>
                </div>

                {/* Right Section */}
                <div className="text-right">
                  <p className="font-semibold text-lg text-gray-900">
                    {formatMoney(job.amount, summary.currency)}
                  </p>
                  <span
                    className={`px-4 py-1 text-sm rounded-full mt-2 inline-block font-medium ${getPaymentBadge(
                      job.paymentStatus
                    )}`}
                  >
                    {job.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Earning;
