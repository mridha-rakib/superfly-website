import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatTimeTo12Hour } from "../../lib/time-utils";
import { quoteApi } from "../../services/quoteApi";
import { useAuthStore } from "../../state/useAuthStore";

const QUOTE_CLEANING_STATUS = {
  IN_PROGRESS: "cleaning_in_progress",
};

const statusBadge = {
  booked: "bg-blue-100 text-blue-700 border-blue-200",
  assigned: "bg-indigo-100 text-indigo-700 border-indigo-200",
  ongoing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  report_submitted: "bg-purple-100 text-purple-700 border-purple-200",
  completed: "bg-green-100 text-green-700 border-green-200",
};

const deriveStatus = (quote) => {
  if (!quote) return "booked";
  const hasCleaner =
    Boolean(quote.assignedCleanerId) ||
    Boolean(quote.assignedCleanerIds && quote.assignedCleanerIds.length);
  const cleaning = quote.cleaningStatus;
  const report = quote.reportStatus;
  const isCompleted = report === "approved" || quote.status === "completed";
  if (isCompleted) return "completed";
  if (report === "pending" && cleaning === "completed") return "report_submitted";
  if (
    cleaning === "cleaning_in_progress" ||
    cleaning === QUOTE_CLEANING_STATUS.IN_PROGRESS
  )
    return "ongoing";
  if (hasCleaner) return "assigned";
  return "booked";
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const time = formatTimeTo12Hour(date.toISOString().slice(11, 16));
  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} • ${time || "N/A"}`;
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value || "-"}</p>
  </div>
);

const Card = ({ title, children }) => (
  <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_15px_45px_-30px_rgba(0,0,0,0.5)] space-y-3">
    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    {children}
  </section>
);

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm text-gray-700">
    <span>{label}</span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

const CleanerCard = ({ cleaner }) => (
  <div className="rounded-2xl border border-gray-100 bg-[#F5F7FB] p-4 text-sm text-gray-700 space-y-1">
    <p className="font-semibold text-gray-900">
      {cleaner.fullName || cleaner.name || cleaner.email}
    </p>
    {cleaner.phone && <p className="text-xs text-gray-600">Phone: {cleaner.phone}</p>}
    {cleaner.email && <p className="text-xs text-gray-600">Email: {cleaner.email}</p>}
  </div>
);

const formatCurrency = (value) =>
  typeof value === "number" ? `$${value.toFixed(2)}` : "-";

function ViewBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role,
  }));
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    if (!isAuthenticated || role !== "client") {
      setError("Sign in as a client to view booking details.");
      return;
    }
    let mounted = true;
    const loadBooking = async () => {
      setIsLoading(true);
      setError("");
      try {
        const quote = await quoteApi.getQuoteById(id);
        if (mounted) {
          setBooking(quote);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Could not load booking. Please try again."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    loadBooking();
    return () => {
      mounted = false;
    };
  }, [id, isAuthenticated, role]);

  const assignedCleaners =
    booking?.assignedCleaners?.length > 0
      ? booking.assignedCleaners
      : booking?.assignedCleanerId
      ? [{ email: booking.assignedCleanerId }]
      : [];

  const services = booking?.services || [];

  if (!isAuthenticated || role !== "client") {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center text-gray-700">
        <p className="text-lg font-semibold">
          Please sign in as a client to view your booking details.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center text-gray-500">
        Loading booking details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => navigate("/my-booking")}
          className="mt-4 text-sm font-semibold text-[#C85344]"
        >
          Back to bookings
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center text-gray-500">
        No booking found.
      </div>
    );
  }

  const badgeClass = statusBadge[deriveStatus(booking)] || "bg-gray-100 text-gray-700 border-border-gray-200";

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#C85344]">Booking</p>
          <h1 className="text-3xl font-bold text-gray-900">#{booking._id}</h1>
        </div>
        <span className={`rounded-full px-4 py-1 text-xs font-semibold border ${badgeClass}`}>
          {deriveStatus(booking).replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      <section className="rounded-[32px] border border-[#E5E7EB] bg-white/90 p-6 shadow-[0_30px_70px_-45px_rgba(10,15,40,0.8)] space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Detail label="Service Type" value={booking.serviceType || "Residential"} />
          <Detail label="Payment Status" value={(booking.paymentStatus || "paid").toUpperCase()} />
          <Detail label="Service Date" value={formatDate(booking.serviceDate)} />
          <Detail
            label="Preferred Time"
            value={formatTimeTo12Hour(booking.preferredTime) || "N/A"}
          />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-[#FDFDFD] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Assigned Cleaners</p>
          <p className="text-sm font-semibold text-gray-900">
            {assignedCleaners.length
              ? assignedCleaners
                  .map((cleaner) => cleaner.fullName || cleaner.email || cleaner._id)
                  .join(", ")
              : "Cleaner not assigned yet."}
          </p>
        </div>
      </section>

      <section className="rounded-[32px] border border-[#E5E7EB] bg-white/90 p-6 shadow-[0_25px_60px_-40px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Services</h2>
          <span className="text-xs uppercase tracking-[0.4em] text-gray-500">
            {services.length} item{services.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="space-y-3 mt-4">
          {services.length === 0 ? (
            <p className="text-sm text-gray-600">No service items recorded.</p>
          ) : (
            services.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between rounded-3xl bg-[#F8FAFC] px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.label || "Service"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.quantity || 1} • $
                    {typeof item.unitPrice === "number"
                      ? item.unitPrice.toFixed(2)
                      : "--"}{" "}
                    each
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {item.subtotal ? `$${item.subtotal.toFixed(2)}` : "--"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Payment Summary">
          <SummaryRow label="Total Price" value={formatCurrency(booking.totalPrice)} />
        </Card>

        <Card title="Assigned Cleaner Details">
          {assignedCleaners.length ? (
            assignedCleaners.map((cleaner) => (
              <CleanerCard key={cleaner._id || cleaner.email} cleaner={cleaner} />
            ))
          ) : (
            <p className="text-sm text-gray-600">Cleaner not assigned yet.</p>
          )}
        </Card>
      </section>

      {/* <Card title="Report Submission">
        {booking.reportStatus === "pending" || booking.reportStatus === "approved" ? (
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">Status:</span>{" "}
              {booking.reportStatus?.replace(/_/g, " ") || "Pending"}
            </p>
            {booking.reportSubmittedAt && (
              <p>
                <span className="font-semibold text-gray-900">Submitted At:</span>{" "}
                {formatDateTime(booking.reportSubmittedAt)}
              </p>
            )}
            {booking.reportSubmittedBy && (
              <p>
                <span className="font-semibold text-gray-900">Submitted By:</span>{" "}
                {booking.reportSubmittedBy}
              </p>
            )}
            <p className="text-xs text-purple-700">You already submitted the report. Waiting for admin review.</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            No report submitted yet. Once the cleaner submits the cleaning report, the details will appear here.
          </p>
        )}
      </Card> */}

      <Card title="Address & Notes">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Address</p>
            <p className="text-sm text-gray-700">
              {booking.businessAddress ||
                booking.clientAddress ||
                booking.address ||
                booking.contactName ||
                "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Notes</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {booking.notes || "No additional notes provided."}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ViewBookingDetails;
