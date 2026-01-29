import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { quoteApi } from "../../services/quoteApi";
import { useAuthStore } from "../../state/useAuthStore";
import { useReviewStore } from "../../state/useReviewStore";
import { formatTimeTo12Hour } from "../../lib/time-utils";

function MyBookings() {
  const [activeTab, setActiveTab] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [modalBooking, setModalBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, role } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role,
  }));
  const reviews = useReviewStore((state) => state.reviews);
  const addReview = useReviewStore((state) => state.addReview);
  const fetchReviews = useReviewStore((state) => state.fetchReviews);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    if (!isAuthenticated || role !== "client") {
      setBookings([]);
      setError(
        !isAuthenticated
          ? "Sign in as a client to view your bookings."
          : "Clients only can view bookings here."
      );
      setIsLoading(false);
      return;
    }
    const fetchBookings = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await quoteApi.listClient();
        const data = Array.isArray(res) ? res : res?.data || [];
        if (mounted) {
          setBookings(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Could not load bookings. Please try again."
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchBookings();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (!isAuthenticated || role !== "client") {
      return;
    }
    fetchReviews().catch(() => {
      /* swallow errors; UI will rely on submission feedback */
    });
  }, [fetchReviews, isAuthenticated, role]);

  const tabs = [
    { id: "all", label: "All" },
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
    const isCompleted =
      report === "approved" ||
      quote.status === "completed" ||
      quote.status === "reviewed";
    if (isCompleted) return "completed";
    if (report === "pending" && cleaning === "completed")
      return "report_submitted";
    if (cleaning === "cleaning_in_progress" || cleaning === "in_progress")
      return "ongoing";
    if (hasCleaner) return "assigned";
    return "booked";
  };

  const statusLabel = (status) =>
    ({
      booked: "Booked",
      assigned: "Assigned",
      ongoing: "Ongoing",
      report_submitted: "Report Submitted",
      completed: "Completed",
    }[status] || status);

  const filteredBookings =
    activeTab === "all"
      ? bookings
      : bookings.filter((b) => deriveStatus(b) === activeTab);

  const renderButtons = (booking) => {
    const status = deriveStatus(booking);
    if (status === "completed") {
      const bookingId = booking._id || booking.id;
      const hasReview = reviews.some(
        (review) => review.bookingId === bookingId
      );
      if (hasReview) {
        return (
          <button
            disabled
            className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
          >
            Review submitted
          </button>
        );
      }
      return (
        <button
          onClick={() => openReviewModal(booking)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
        >
          Leave Review
        </button>
      );
    }
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
      >
        Review
      </button>
    );
  };

  const getStatusTheme = (status) => {
    switch (status) {
      case "booked":
        return { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" };
      case "assigned":
        return {
          bg: "bg-indigo-50",
          text: "text-indigo-700",
          dot: "bg-indigo-500",
        };
      case "ongoing":
        return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" };
      case "report_submitted":
        return { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" };
      case "completed":
        return { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" };
    }
  };

  const openReviewModal = (booking) => {
    setModalBooking(booking);
    setRating(0);
    setComment("");
    setReviewError("");
  };

  const closeModal = () => {
    setModalBooking(null);
    setRating(0);
    setComment("");
    setReviewError("");
  };

  const submitReview = async () => {
    if (!modalBooking) return;
    if (rating === 0) {
      setReviewError("Please select a rating before submitting your review.");
      return;
    }
    setReviewError("");
    setIsReviewSubmitting(true);
    try {
      const bookingId = modalBooking._id || modalBooking.id;
      await addReview({
        quoteId: bookingId,
        clientName:
          modalBooking.contactName ||
          modalBooking.firstName ||
          modalBooking.email ||
          "Client",
        rating,
        comment,
      });
      setReviewSuccess("Thank you! Your review has been submitted.");
      closeModal();
    } catch (err) {
      setReviewError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not submit review. Please try again."
      );
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  useEffect(() => {
    if (!reviewSuccess) return undefined;
    const timer = setTimeout(() => setReviewSuccess(""), 4000);
    return () => clearTimeout(timer);
  }, [reviewSuccess]);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {reviewSuccess && (
        <div className="mb-5 px-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm flex items-center gap-2">
          <FiCheckCircle className="shrink-0" />
          <span>{reviewSuccess}</span>
        </div>
      )}
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--primary-color)]">
          Overview
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
          My Bookings
        </h1>
        <p className="text-gray-600 mt-2">
          Track every booking from payment to completion.
        </p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm flex items-center gap-2">
          <FiAlertCircle className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                active
                  ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-md shadow-[color:rgba(200,83,68,0.2)]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[var(--primary-color)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="text-center text-gray-500 py-6">
            Loading bookings...
          </div>
        )}

        {!isLoading && filteredBookings.length === 0 && (
          <div className="text-center text-gray-500 py-6">No bookings found.</div>
        )}

        {filteredBookings.map((booking) => {
          const status = deriveStatus(booking);
          const theme = getStatusTheme(status);
          return (
            <div
              key={booking._id || booking.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition duration-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-lg font-semibold text-gray-900 capitalize">
                    {booking.serviceType || "Residential"} Cleaning
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${theme.bg} ${theme.text}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                    {statusLabel(status)}
                  </span>
                </div>

                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Booking ID:</span>{" "}
                  {booking._id || booking.id}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  <span className="inline-flex items-center gap-2">
                    <FiCalendar className="text-gray-500" />{" "}
                    {booking.serviceDate || "Date N/A"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <FiClock className="text-gray-500" />{" "}
                    {formatTimeTo12Hour(booking.preferredTime) || "Preferred Time: N/A"}
                  </span>
                </div>
                {booking.assignedCleaners?.length ? (
                  <div className="mt-2 text-sm text-gray-600">
                    Assigned cleaner
                    <span className="ml-1 font-semibold text-gray-900">
                      {booking.assignedCleaners
                        .map((cleaner) => cleaner.fullName || cleaner.email || cleaner._id)
                        .join(", ")}
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-500">
                    Cleaner assignment pending.
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:items-end gap-2 min-w-[160px]">
                <button
                  onClick={() =>
                    navigate(`/my-booking/${booking._id || booking.id}`)
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color-strong)] transition shadow-sm"
                >
                  View Details <FiArrowRight />
                </button>
                {renderButtons(booking)}
              </div>
            </div>
          );
        })}
      </div>

      {modalBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-4">
              <FiCheckCircle className="text-green-500 mt-1" size={20} />
              <div>
                <h2 className="text-xl font-bold">Leave a Review</h2>
                <p className="text-sm text-gray-600">
                  Booking ID: {modalBooking._id || modalBooking.id}
                </p>
              </div>
            </div>

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

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              placeholder="Share your experience..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color)] resize-none mb-4"
            ></textarea>
            {reviewError && (
              <p className="text-sm text-red-600 mb-2">{reviewError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={isReviewSubmitting}
                className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color-strong)]"
              >
                {isReviewSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
