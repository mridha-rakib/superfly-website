import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatTimeFromDate, formatTimeTo12Hour } from "../../lib/time-utils";
import { cleaningReportApi } from "../../services/cleaningReportApi";
import { quoteApi } from "../../services/quoteApi";

const statusChip = (key) => {
  switch (key) {
    case "assigned":
      return "bg-indigo-100 text-indigo-700";
    case "ongoing":
    case "cleaning_in_progress":
      return "bg-blue-100 text-blue-700";
    case "waiting-for-admin-approval":
      return "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-900 border border-purple-200 shadow-sm ring-1 ring-purple-100";
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 space-y-4">
    <div className="flex items-center gap-2">
      <div className="w-1 h-6 bg-[#C85344] rounded-full" />
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between text-sm text-gray-700">
    <span className="font-medium text-gray-600">{label}</span>
    <span className="text-gray-900">{value || "--"}</span>
  </div>
);

const formatReportTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} • ${formatTimeFromDate(date)}`;
};

function ViewJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [statusOption, setStatusOption] = useState("pending");
  const [arrivalTime, setArrivalTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [beforePhotos, setBeforePhotos] = useState([]);
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [arrivalSuccess, setArrivalSuccess] = useState("");
  const [showProgressCard, setShowProgressCard] = useState(false);
  const [showApprovalCard, setShowApprovalCard] = useState(false);
  const [displayStatus, setDisplayStatus] = useState(null);
  const [hasArrived, setHasArrived] = useState(false);

  const deriveStatus = (job) => {
    if (job.cleanerStatus) return job.cleanerStatus;
    const hasCleaner = Boolean(job.assignedCleanerId || (job.assignedCleanerIds || []).length);
    const cleaning = job.cleaningStatus;
    const report = job.reportStatus;
    const status = job.status;
    const completedStatuses = new Set(["completed", "reviewed"]);

    if (report === "pending" && cleaning === "completed") {
      return { key: "waiting-for-admin-approval", label: "Admin approval pending." };
    }
    if (report === "approved" || completedStatuses.has(status)) {
      return { key: "completed", label: "Completed" };
    }
    if (cleaning === "cleaning_in_progress") {
      return { key: "ongoing", label: "Ongoing" };
    }
    if (hasCleaner) {
      return { key: "assigned", label: "Assigned" };
    }
    return { key: "pending", label: "Pending" };
  };

  useEffect(() => {
    if (!id) return;
    let active = true;
    setIsLoading(true);
    setError("");
    quoteApi
      .getQuoteById(id)
      .then((res) => {
        if (!active) return;
        setJob(res);
        setDisplayStatus(deriveStatus(res));
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err?.response?.data?.message || err?.message || "Could not load job details."
        );
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center text-gray-500 text-lg">
        Loading job...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center text-red-500 text-lg">
        {error || "No booking details found."}
      </div>
    );
  }

  const computed = deriveStatus(job);
  const totalPrice = job.totalPrice || (job.paymentAmount ? job.paymentAmount / 100 : null);
  const earningAmount =
    job.serviceType === "residential"
      ? job.cleanerEarningAmount || (job.cleanerPercentage && totalPrice
          ? Number(((job.cleanerPercentage / 100) * totalPrice).toFixed(2))
          : null)
      : null;
  const amountLabel = earningAmount ?? totalPrice;
  const amountTitle = earningAmount ? "Your Earning" : "Total Price";

  const handleFileChange = (setter) => (e) => {
    const files = Array.from(e.target.files || []);
    setter(files);
  };

  const toIso = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toISOString();
  };

  const handleMarkArrived = async () => {
    setSubmitError("");
    setArrivalSuccess("");
    setIsSubmitting(true);
    try {
      await quoteApi.markArrived(job._id);
      setArrivalSuccess("Arrival confirmed. Status updated to On Site.");
      setStatusOption("cleaning_in_progress");
      setShowProgressCard(true);
      setDisplayStatus({ key: "cleaning_in_progress", label: "Cleaning in Progress" });
      setHasArrived(true);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not mark arrival. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReport = async () => {
    setSubmitError("");
    setSubmitSuccess("");
    if (!arrivalTime || !startTime || !endTime) {
      setSubmitError("Arrival, start, and end time are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const report = await cleaningReportApi.submit(job._id, {
        arrivalTime: toIso(arrivalTime),
        startTime: toIso(startTime),
        endTime: toIso(endTime),
        notes,
        beforePhotos,
        afterPhotos,
        statusOption,
      });
      setSubmitSuccess("Report submitted successfully.");
      setShowApprovalCard(true);
      setDisplayStatus({ key: "waiting-for-admin-approval", label: "Admin approval pending." });
      setJob((prev) =>
        prev
          ? {
              ...prev,
              reportStatus: report?.status || "pending",
              cleaningStatus: "completed",
              cleaningReport: report,
            }
          : prev
      );
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not submit report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportAlreadySubmitted =
    job &&
    ((job.reportStatus === "pending" && job.cleaningStatus === "completed") ||
      job.reportStatus === "approved");

  return (
    <div className="max-w-5xl mx-auto py-10 px-5 space-y-6 bg-gradient-to-b from-[#f9fbfd] to-white rounded-3xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#C85344]/80">Job</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Job Details</h1>
          <p className="text-gray-600">
            {job.serviceType === "commercial"
              ? "Commercial Cleaning"
              : job.serviceType === "post_construction"
              ? "Post-Construction Cleaning"
              : "Residential Cleaning"}
          </p>
        </div>
        <button
          onClick={() => navigate("/my-jobs")}
          className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
        >
          ← Back to Jobs
        </button>
      </div>

      <Section title="Job Information">
        <div className="flex flex-wrap gap-3 items-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusChip(
              (displayStatus || computed).key
            )}`}
          >
            {(displayStatus || computed).label}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            {(job.paymentStatus || "paid").toUpperCase()}
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Job ID" value={job._id} />
          <InfoRow label="Service Type" value={job.serviceType} />
          <InfoRow label="Date" value={job.serviceDate} />
          <InfoRow
            label="Time"
            value={formatTimeTo12Hour(job.preferredTime) || "N/A"}
          />
          <InfoRow label="Current Status" value={(displayStatus || computed).label} />
        </div>
      </Section>

      <Section title="Client Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow
            label="Name"
            value={job.contactName || `${job.firstName || ""} ${job.lastName || ""}`.trim()}
          />
          <InfoRow label="Phone" value={job.phoneNumber} />
            <InfoRow label="Email" value={job.email} />
            <InfoRow
              label="Address"
              value={
                job.businessAddress ||
                job.clientAddress ||
                job.address ||
                job.contactName ||
                `${job.firstName || ""} ${job.lastName || ""}`.trim()
              }
            />
        </div>
      </Section>

      <Section title="Cleaning Items">
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          {(job.services || []).length === 0 ? (
            <div className="p-4 text-sm text-gray-600">No items recorded.</div>
          ) : (
            <div className="divide-y">
              {(job.services || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center px-4 py-3 bg-gray-50">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {(item.label || item.key || "Service").trim()}
                    </span>
                    <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {/* price hidden for cleaners */}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section title="Payment Summary">
        <div className="flex justify-between text-lg font-semibold text-gray-900">
          <span>{amountTitle}</span>
          <span>{amountLabel ? `$${amountLabel}` : "--"}</span>
        </div>
      </Section>

      <Section title="Update Job Status">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-[#C85344]/40 p-4 bg-[#C85344]/5">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C85344]" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Mark as Arrived</p>
                <p className="text-xs text-gray-600">Tap when you reach the client location.</p>
              </div>
            </div>
            <button
              onClick={handleMarkArrived}
              disabled={isSubmitting || hasArrived}
              className="px-4 py-2 bg-[#C85344] text-white rounded-lg text-sm hover:bg-[#b84335] transition disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : hasArrived ? "Arrived" : "Mark as Arrived"}
            </button>
          </div>

          {showProgressCard && (
            <div className="flex items-center gap-3 rounded-lg border p-3 bg-blue-50">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Cleaning in Progress</p>
                <p className="text-xs text-gray-600">On-site work started.</p>
              </div>
            </div>
          )}

        {showApprovalCard && (
          <div className="flex items-center gap-3 rounded-lg border border-purple-100 p-3 bg-purple-50">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <div>
              <p className="text-sm font-semibold text-purple-900">Admin approval pending.</p>
              <p className="text-xs text-purple-700">Report submitted. Awaiting admin review.</p>
            </div>
          </div>
        )}
        </div>
        {arrivalSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mt-3">
            {arrivalSuccess}
          </div>
        )}
      </Section>

      <Section title="Upload Photos">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-5 text-sm text-gray-600 hover:border-[#C85344]/60 hover:text-[#C85344] transition cursor-pointer">
            <span className="mb-2 font-semibold">Before Photos</span>
            <span className="text-xs text-gray-500 mb-3">
              Click or drop to upload (optional)
            </span>
            <input
              type="file"
              multiple
              className="hidden"
              accept="image/*"
              onChange={handleFileChange(setBeforePhotos)}
            />
            {beforePhotos.length > 0 && (
              <span className="text-xs text-gray-700">{beforePhotos.length} file(s) selected</span>
            )}
          </label>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-5 text-sm text-gray-600 hover:border-[#C85344]/60 hover:text-[#C85344] transition cursor-pointer">
            <span className="mb-2 font-semibold">After Photos</span>
            <span className="text-xs text-gray-500 mb-3">
              Click or drop to upload (optional)
            </span>
            <input
              type="file"
              multiple
              className="hidden"
              accept="image/*"
              onChange={handleFileChange(setAfterPhotos)}
            />
            {afterPhotos.length > 0 && (
              <span className="text-xs text-gray-700">{afterPhotos.length} file(s) selected</span>
            )}
          </label>
        </div>
      </Section>

      <Section title="Job Report">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Arrival Time</label>
            <input
              type="datetime-local"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85344]/50"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85344]/50"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85344]/50"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85344]/50"
            placeholder="Add any actional notes or observations..."
          />
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {submitError}
          </div>
        )}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {submitSuccess}
          </div>
        )}

          <div className="flex flex-col gap-2">
            {reportAlreadySubmitted && (
              <p className="text-sm text-purple-700">
                You already submitted the report. Waiting for admin approval.
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => navigate("/my-jobs")}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
              >
                Close
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={isSubmitting || reportAlreadySubmitted}
                className="px-5 py-2 rounded-lg text-white bg-[#C85344] hover:bg-[#b84335] transition text-sm disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
        </div>
      </Section>
      {job.cleaningReport && (
        <Section title="Submitted Report">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label="Arrival Time"
              value={formatTimeFromDate(job.cleaningReport.arrivalTime)}
            />
            <InfoRow
              label="Start Time"
              value={formatTimeFromDate(job.cleaningReport.startTime)}
            />
            <InfoRow
              label="End Time"
              value={formatTimeFromDate(job.cleaningReport.endTime)}
            />
            <InfoRow
              label="Report Status"
              value={
                job.cleaningReport.status
                  ? job.cleaningReport.status.replace(/_/g, " ")
                  : "--"
              }
            />
            <InfoRow
              label="Submitted On"
              value={formatReportTime(job.cleaningReport.createdAt)}
            />
          </div>
          {(job.cleaningReport.beforePhotos?.length ||
            job.cleaningReport.afterPhotos?.length) > 0 && (
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <p>Before photos: {job.cleaningReport.beforePhotos?.length || 0}</p>
              <p>After photos: {job.cleaningReport.afterPhotos?.length || 0}</p>
            </div>
          )}
          {job.cleaningReport.notes && (
            <div className="mt-3">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Notes</p>
              <p className="text-sm text-gray-900 whitespace-pre-line">
                {job.cleaningReport.notes}
              </p>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

export default ViewJob;
    
