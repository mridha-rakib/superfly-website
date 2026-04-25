import React, { useEffect, useMemo, useState } from "react";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
} from "react-icons/fa";
import { quoteApi } from "../../services/quoteApi";
import { useAuthStore } from "../../state/useAuthStore";

const formatMoney = (amount = 0, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (value) => {
  const parsed = parseDateOnly(value);
  if (!parsed) return "Date not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

const parseDateOnly = (value) => {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const startOfWeek = (date) => {
  const normalized = startOfDay(date);
  return new Date(
    normalized.getFullYear(),
    normalized.getMonth(),
    normalized.getDate() - normalized.getDay()
  );
};

const endOfWeek = (date) => {
  const start = startOfWeek(date);
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

const toAmount = (...values) => {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return Math.max(numeric, 0);
    }
  }
  return 0;
};

const formatServiceType = (serviceType) => {
  if (!serviceType) return "Cleaning";
  return String(serviceType)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const deriveEntryStatus = ({
  status,
  cleaningStatus,
  reportStatus,
  paymentStatus,
}) => {
  const normalizedStatus = String(status || "").toLowerCase();
  const normalizedCleaning = String(cleaningStatus || "").toLowerCase();
  const normalizedReport = String(reportStatus || "").toLowerCase();
  const normalizedPayment = String(paymentStatus || "").toLowerCase();

  const isCompleted =
    normalizedPayment === "paid" ||
    normalizedReport === "approved" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "reviewed";

  if (isCompleted) {
    return {
      isCompleted: true,
      isPending: false,
      statusLabel: "Completed",
      statusVariant: "completed",
      paymentBadge: "PAID",
      paymentVariant: "paid",
    };
  }

  if (normalizedReport === "pending" && normalizedCleaning === "completed") {
    return {
      isCompleted: false,
      isPending: true,
      statusLabel: "Pending admin approval",
      statusVariant: "pendingApproval",
      paymentBadge: "PENDING",
      paymentVariant: "pending",
    };
  }

  if (
    normalizedCleaning === "cleaning_in_progress" ||
    normalizedCleaning === "in_progress"
  ) {
    return {
      isCompleted: false,
      isPending: true,
      statusLabel: "In progress",
      statusVariant: "inProgress",
      paymentBadge: "PENDING",
      paymentVariant: "pending",
    };
  }

  return {
    isCompleted: false,
    isPending: true,
    statusLabel: "Pending",
    statusVariant: "pending",
    paymentBadge: "PENDING",
    paymentVariant: "pending",
  };
};

const getResolvedAmount = (job, amountOverride) => {
  const totalPrice = toAmount(
    job?.totalPrice,
    job?.paymentAmount ? Number(job.paymentAmount) / 100 : undefined
  );

  if (amountOverride !== undefined && amountOverride !== null) {
    return toAmount(amountOverride);
  }

  if (job?.cleanerEarningAmount !== undefined && job?.cleanerEarningAmount !== null) {
    return toAmount(job.cleanerEarningAmount);
  }

  if (job?.cleanerPercentage && totalPrice) {
    return Number(((Number(job.cleanerPercentage) / 100) * totalPrice).toFixed(2));
  }

  return 0;
};

const buildEarningEntries = (jobs = []) =>
  (jobs || []).flatMap((job) => {
    const base = {
      jobId: job?._id || job?.id || "N/A",
      type: formatServiceType(job?.serviceType),
      currency: job?.currency || "USD",
    };

    if (Array.isArray(job?.occurrenceProgress) && job.occurrenceProgress.length > 0) {
      return job.occurrenceProgress.map((occurrence, index) => {
        const status = deriveEntryStatus({
          status: job?.status,
          cleaningStatus: occurrence?.cleaningStatus ?? job?.cleaningStatus,
          reportStatus: occurrence?.reportStatus ?? job?.reportStatus,
          paymentStatus: occurrence?.paymentStatus ?? job?.paymentStatus,
        });

        const occurrenceDate = occurrence?.occurrenceDate || job?.serviceDate;
        return {
          id: `${base.jobId}:${occurrence?.occurrenceDate || index}`,
          ...base,
          dateValue: occurrenceDate,
          date: parseDateOnly(occurrenceDate),
          amount: getResolvedAmount(job, occurrence?.cleanerEarningAmount),
          ...status,
        };
      });
    }

    const status = deriveEntryStatus({
      status: job?.status,
      cleaningStatus: job?.cleaningStatus,
      reportStatus: job?.reportStatus,
      paymentStatus: job?.paymentStatus,
    });

    return [
      {
        id: base.jobId,
        ...base,
        dateValue: job?.serviceDate,
        date: parseDateOnly(job?.serviceDate),
        amount: getResolvedAmount(job),
        ...status,
      },
    ];
  });

function Earning() {
  const { isAuthenticated, role } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role,
  }));

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || role !== "cleaner") return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const jobsRes = await quoteApi.listCleanerAssigned();
        if (!active) return;

        const items =
          jobsRes?.data?.data ||
          jobsRes?.data ||
          jobsRes?.items ||
          jobsRes ||
          [];

        setJobs(Array.isArray(items) ? items : []);
      } catch (err) {
        if (!active) return;

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load earnings.";

        setError(message);
        setJobs([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [isAuthenticated, role]);

  const earningEntries = useMemo(() => buildEarningEntries(jobs), [jobs]);

  const summary = useMemo(() => {
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const currency = earningEntries[0]?.currency || "USD";

    return earningEntries.reduce(
      (acc, entry) => {
        const amount = toAmount(entry.amount);

        if (entry.isCompleted) {
          acc.completedJobs += 1;
          acc.completedEarnings += amount;

          if (entry.date && entry.date >= weekStart && entry.date <= weekEnd) {
            acc.weeklyIncome += amount;
          }

          if (entry.date && entry.date >= monthStart && entry.date <= monthEnd) {
            acc.monthlyIncome += amount;
          }
        } else {
          acc.pendingJobs += 1;
          acc.pendingIncome += amount;
        }

        return acc;
      },
      {
        weeklyIncome: 0,
        monthlyIncome: 0,
        completedJobs: 0,
        completedEarnings: 0,
        pendingJobs: 0,
        pendingIncome: 0,
        currency,
      }
    );
  }, [earningEntries]);

  const stats = useMemo(
    () => [
      {
        label: "Weekly Income",
        value: formatMoney(summary.weeklyIncome, summary.currency),
        icon: <FaCalendarAlt className="text-2xl text-[#C85344]" />,
        helper: "Income from completed jobs in the current week.",
      },
      {
        label: "Monthly Income",
        value: formatMoney(summary.monthlyIncome, summary.currency),
        icon: <FaCalendarAlt className="text-2xl text-[#D97706]" />,
        helper: "Income from completed jobs in the current month.",
      },
      {
        label: "Completed Jobs",
        value: String(summary.completedJobs),
        icon: <FaCheckCircle className="text-2xl text-emerald-600" />,
        helper: "Jobs already completed and approved.",
      },
      {
        label: "Completed Earnings",
        value: formatMoney(summary.completedEarnings, summary.currency),
        icon: <FaDollarSign className="text-2xl text-emerald-600" />,
        helper: "Total earnings from completed jobs.",
      },
      {
        label: "Pending Jobs",
        value: String(summary.pendingJobs),
        icon: <FaBriefcase className="text-2xl text-yellow-500" />,
        helper: "Jobs still waiting for payout.",
      },
      {
        label: "Pending Income",
        value: formatMoney(summary.pendingIncome, summary.currency),
        icon: <FaClock className="text-2xl text-yellow-500" />,
        helper: "Income tied to pending jobs.",
        cardClass:
          "border-yellow-200 bg-yellow-50/60 ring-1 ring-yellow-100 shadow-lg hover:shadow-xl",
        valueClass: "text-yellow-900",
      },
    ],
    [summary]
  );

  const resolvedJobs = useMemo(() => {
    return [...earningEntries].sort((left, right) => {
      if (left.isCompleted !== right.isCompleted) {
        return left.isCompleted ? 1 : -1;
      }

      if (left.date && right.date) {
        return right.date.getTime() - left.date.getTime();
      }

      if (left.date) return -1;
      if (right.date) return 1;
      return String(left.id).localeCompare(String(right.id));
    });
  }, [earningEntries]);

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
      case "inProgress":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

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
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 space-y-10">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Earnings Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-500">
          Track this week&apos;s income, this month&apos;s income, completed jobs,
          completed earnings, and pending payouts in one place.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-white shadow-md border rounded-xl p-6 flex flex-col items-center hover:shadow-lg transition ${stat.cardClass || ""}`}
          >
            <div className="mb-3">{stat.icon}</div>
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p
              className={`text-2xl md:text-3xl font-bold mt-1 ${stat.valueClass || "text-gray-900"}`}
            >
              {loading ? "..." : stat.value}
            </p>
            <p className="text-xs text-gray-500 text-center mt-2 px-2">
              {stat.helper}
            </p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">My Jobs</h2>
            <p className="text-sm text-gray-500 mt-1">
              {loading
                ? "Loading jobs..."
                : `${summary.completedJobs} completed, ${summary.pendingJobs} pending`}
            </p>
          </div>
        </div>

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
                <div className="mb-3 md:mb-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-lg text-gray-900">
                      {job.type}
                    </p>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getJobStatusBadge(
                        job.statusVariant
                      )}`}
                    >
                      {job.statusLabel}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    Job ID: <span className="font-medium">{job.jobId}</span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Date: {formatDate(job.dateValue)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-lg text-gray-900">
                    {formatMoney(job.amount, job.currency)}
                  </p>
                  <span
                    className={`px-4 py-1 text-sm rounded-full mt-2 inline-block font-medium ${getPaymentBadge(
                      job.paymentVariant
                    )}`}
                  >
                    {job.paymentBadge}
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
