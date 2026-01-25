import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quoteApi } from "../../services/quoteApi";
import { useAuthStore } from "../../state/useAuthStore";

function MyJobs() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    role: s.role,
  }));
  const [activeTab, setActiveTab] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const tabs = [
    { id: "all", label: "All Jobs" },
    { id: "pending", label: "Pending" },
    { id: "cleaning_in_progress", label: "Ongoing" },
    { id: "waiting-for-admin-approval", label: "Waiting Approval" },
    { id: "completed", label: "Completed" },
  ];

  const deriveStatus = (job) => {
    const normalizeKey = (val) => (val || "").toLowerCase();
    const labelMap = {
      pending: "Pending",
      assigned: "Pending",
      cleaning_in_progress: "Ongoing",
      "waiting-for-admin-approval": "Waiting for admin approval",
      waiting_for_admin_approval: "Waiting for admin approval",
      approved: "Completed",
      completed: "Completed",
    };

    // If backend already sets cleanerStatus, respect it but wrap in object
    const cleanerKey = normalizeKey(job.cleanerStatus);
    if (cleanerKey && labelMap[cleanerKey]) {
      return { key: cleanerKey, label: labelMap[cleanerKey] };
    }

    const hasCleaner = Boolean(
      job.assignedCleanerId || (job.assignedCleanerIds || []).length
    );
    const cleaning = normalizeKey(job.cleaningStatus);
    const report = normalizeKey(job.reportStatus);
    const status = normalizeKey(job.status);

    if (report === "approved" || status === "completed") {
      return { key: "completed", label: "Completed" };
    }
    if (report === "pending" && cleaning === "completed") {
      return { key: "waiting-for-admin-approval", label: "Waiting for admin approval" };
    }
    if (cleaning === "cleaning_in_progress" || cleaning === "in_progress") {
      return { key: "cleaning_in_progress", label: "Ongoing" };
    }
    if (hasCleaner) {
      return { key: "pending", label: "Pending" };
    }
    return { key: "pending", label: "Pending" };
  };

  useEffect(() => {
    if (!isAuthenticated || role !== "cleaner") {
      setError("You need to be logged in as a cleaner to view assigned jobs.");
      return;
    }
    setIsLoading(true);
    setError("");
    quoteApi
      .listCleanerAssigned()
      .then((res) => {
        const items = res?.data || res || [];
        setJobs(items);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Could not load jobs. Please try again."
        );
        setJobs([]);
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, role]);

  const filteredJobs = useMemo(() => {
    if (activeTab === "all") return jobs;
    return jobs.filter((job) => deriveStatus(job).key === activeTab);
  }, [jobs, activeTab]);

  const getStatusStyles = (key) => {
    switch (key) {
      case "pending":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "cleaning_in_progress":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "waiting-for-admin-approval":
        return "bg-purple-100 text-purple-700 border border-purple-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const renderButtons = (statusKey) => {
    if (statusKey === "cleaning_in_progress") {
      return (
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
          Mark Arrived
        </button>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-5">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[#C85344]/80">Cleaner</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">My Jobs</h1>
        <p className="text-gray-600 mt-1">
          Stay on top of every assignment, from booking to completion.
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <div className="flex gap-1 bg-gray-100 rounded-full p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-white shadow-sm text-[#C85344]"
                  : "text-gray-600 hover:text-[#C85344]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {isLoading && <p className="text-center text-gray-500">Loading jobs...</p>}
        {!isLoading && filteredJobs.length === 0 && !error && (
          <p className="text-center text-gray-500">No jobs found.</p>
        )}

        {filteredJobs.map((job) => {
          const computed = deriveStatus(job);
          return (
            <div
              key={job._id}
              className="flex justify-between items-center p-5 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition bg-white"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg text-gray-900">
                    {job.serviceType === "commercial"
                      ? "Commercial Cleaning"
                      : job.serviceType === "post_construction"
                      ? "Post-Construction Cleaning"
                      : "Residential Cleaning"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(
                      computed.key
                    )}`}
                    title={computed.label}
                  >
                    {computed.label}
                  </span>
                </div>

                <div className="text-sm text-gray-700">
                  <span className="font-medium">Booking ID:</span>{" "}
                  <span className="font-mono tracking-tight">{job._id}</span>
                </div>

                <div className="text-sm text-gray-700 flex items-center gap-2">
                  <span role="img" aria-label="calendar">
                    📅
                  </span>
                  <span>
                    {job.serviceDate} {job.preferredTime ? `• ${job.preferredTime}` : ""}
                  </span>
                </div>

                <div className="text-sm text-gray-700 flex items-center gap-2">
                  <span role="img" aria-label="phone">
                    📞
                  </span>
                  <span>
                    {job.contactName ||
                      `${job.firstName || ""} ${job.lastName || ""}`.trim()}{" "}
                    {job.phoneNumber ? `• ${job.phoneNumber}` : ""}
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2 text-right">
                <button
                  onClick={() => navigate(`/my-jobs/${job._id}`)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-800 hover:bg-gray-50 transition text-sm"
                >
                  View Details
                </button>

                {renderButtons(computed.key)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyJobs;
