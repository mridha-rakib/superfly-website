import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quoteApi } from "../../services/quoteApi";
import { useAuthStore } from "../../state/useAuthStore";
import { formatTimeTo12Hour } from "../../lib/time-utils";

const tabs = [
  { id: "all", label: "All Jobs" },
  { id: "pending", label: "Pending" },
  { id: "cleaning_in_progress", label: "Ongoing" },
  { id: "waiting-for-admin-approval", label: "Admin approval pending" },
  { id: "completed", label: "Completed" },
];

const dateScopes = [
  { id: "all", label: "All dates" },
  { id: "today", label: "Today" },
  { id: "next_7", label: "Next 7 days" },
  { id: "this_month", label: "This month" },
  { id: "next_month", label: "Next month" },
];

const WEEKDAY_TO_INDEX = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

const DEFAULT_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
};

const addMonths = (date, months) =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

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

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeMonths = (months) => {
  const normalized = Array.from(
    new Set(
      (Array.isArray(months) ? months : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 1 && value <= 12)
    )
  ).sort((a, b) => a - b);
  return normalized.length ? normalized : [...DEFAULT_MONTHS];
};

const maxDayForMonth = (monthValue) =>
  new Date(2025, Number(monthValue), 0).getDate() || 31;

const normalizeDatesForMonth = (dates, monthValue) => {
  const maxDay = maxDayForMonth(monthValue);
  return Array.from(
    new Set(
      (Array.isArray(dates) ? dates : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 1 && value <= maxDay)
    )
  ).sort((a, b) => a - b);
};

const getWeekdayPatternDayOfMonth = (year, month, week, day) => {
  const targetWeekday = WEEKDAY_TO_INDEX[day];
  if (targetWeekday === undefined) return null;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  if (week === "last") {
    const lastWeekday = new Date(year, month, daysInMonth).getDay();
    const delta = (lastWeekday - targetWeekday + 7) % 7;
    return daysInMonth - delta;
  }

  const firstWeekday = new Date(year, month, 1).getDay();
  const offsetFromFirst = (targetWeekday - firstWeekday + 7) % 7;
  const weekOffset =
    week === "first"
      ? 0
      : week === "second"
      ? 1
      : week === "third"
      ? 2
      : week === "fourth"
      ? 3
      : null;

  if (weekOffset === null) return null;
  const dayOfMonth = 1 + offsetFromFirst + weekOffset * 7;
  return dayOfMonth <= daysInMonth ? dayOfMonth : null;
};

const serviceTypeLabel = (serviceType) => {
  if (serviceType === "commercial") return "Commercial Cleaning";
  if (serviceType === "post_construction") return "Post-Construction Cleaning";
  return "Residential Cleaning";
};

const deriveStatus = (job) => {
  const normalizeKey = (val) => (val || "").toLowerCase();
  const labelMap = {
    pending: "Pending",
    assigned: "Pending",
    cleaning_in_progress: "Ongoing",
    in_progress: "Ongoing",
    "waiting-for-admin-approval": "Admin approval pending.",
    waiting_for_admin_approval: "Admin approval pending.",
    approved: "Completed",
    completed: "Completed",
    reviewed: "Completed",
  };

  const cleanerKey = normalizeKey(job.cleanerStatus?.key || job.cleanerStatus);
  if (cleanerKey && labelMap[cleanerKey]) {
    const normalizedKey =
      cleanerKey === "in_progress" ? "cleaning_in_progress" : cleanerKey;
    return { key: normalizedKey, label: labelMap[cleanerKey] };
  }

  const hasCleaner = Boolean(
    job.assignedCleanerId || (job.assignedCleanerIds || []).length
  );
  const cleaning = normalizeKey(job.cleaningStatus);
  const report = normalizeKey(job.reportStatus);
  const status = normalizeKey(job.status);

  if (
    report === "approved" ||
    status === "completed" ||
    status === "reviewed"
  ) {
    return { key: "completed", label: "Completed" };
  }
  if (report === "pending" && cleaning === "completed") {
    return {
      key: "waiting-for-admin-approval",
      label: "Admin approval pending.",
    };
  }
  if (cleaning === "cleaning_in_progress" || cleaning === "in_progress") {
    return { key: "cleaning_in_progress", label: "Ongoing" };
  }
  if (hasCleaner) {
    return { key: "pending", label: "Pending" };
  }
  return { key: "pending", label: "Pending" };
};

const getStatusStyles = (key) => {
  switch (key) {
    case "pending":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "cleaning_in_progress":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "waiting-for-admin-approval":
      return "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-900 border border-purple-200 shadow-sm ring-1 ring-purple-100";
    case "completed":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

const resolveOccurrenceTime = (job) => {
  const schedule = job?.cleaningSchedule;
  if (!schedule || typeof schedule !== "object") {
    return job?.preferredTime || "";
  }

  if (schedule.frequency === "one_time") {
    return schedule.schedule?.start_time || job?.preferredTime || "";
  }

  if (schedule.frequency === "weekly" || schedule.frequency === "monthly") {
    return schedule.start_time || job?.preferredTime || "";
  }

  return job?.preferredTime || "";
};

const resolveMonthlyDatesMap = (schedule) => {
  const months = normalizeMonths(schedule.months);
  const result = new Map();

  if (Array.isArray(schedule.month_dates) && schedule.month_dates.length > 0) {
    schedule.month_dates.forEach((entry) => {
      const month = Number(entry?.month);
      if (!months.includes(month)) return;
      const dates = normalizeDatesForMonth(entry?.dates, month);
      if (dates.length > 0) {
        result.set(month, dates);
      }
    });
  } else {
    const fallbackDates = Array.from(
      new Set(
        (Array.isArray(schedule.dates) ? schedule.dates : [])
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value >= 1 && value <= 31)
      )
    ).sort((a, b) => a - b);

    months.forEach((month) => {
      const dates = normalizeDatesForMonth(fallbackDates, month);
      if (dates.length > 0) {
        result.set(month, dates);
      }
    });
  }

  return result;
};

const buildJobOccurrences = (job, rangeStart, rangeEnd) => {
  const occurrences = [];
  const schedule = job?.cleaningSchedule;
  const startOn = parseDateOnly(job?.serviceDate) || rangeStart;
  const startTime = resolveOccurrenceTime(job);

  const addOccurrence = (candidateDate) => {
    if (!candidateDate) return;
    const normalized = startOfDay(candidateDate);
    if (normalized < startOfDay(startOn)) return;
    if (normalized < rangeStart || normalized > rangeEnd) return;
    occurrences.push({
      date: normalized,
      dateKey: toDateKey(normalized),
      time: startTime,
      job,
    });
  };

  if (!schedule || typeof schedule !== "object" || !schedule.frequency) {
    addOccurrence(parseDateOnly(job?.serviceDate));
  } else if (schedule.frequency === "one_time") {
    addOccurrence(parseDateOnly(schedule.schedule?.date || job?.serviceDate));
  } else if (schedule.frequency === "weekly") {
    const days = new Set(
      (Array.isArray(schedule.days) ? schedule.days : [])
        .map((day) => String(day || "").toLowerCase())
        .filter(Boolean)
    );
    const repeatUntil = parseDateOnly(schedule.repeat_until);
    const endLimit =
      repeatUntil && repeatUntil < rangeEnd ? startOfDay(repeatUntil) : rangeEnd;
    let cursor = startOfDay(rangeStart > startOn ? rangeStart : startOn);

    while (cursor <= endLimit) {
      const weekday = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ][cursor.getDay()];
      if (days.has(weekday)) {
        addOccurrence(cursor);
      }
      cursor = addDays(cursor, 1);
    }
  } else if (
    schedule.frequency === "monthly" &&
    schedule.pattern_type === "specific_dates"
  ) {
    const monthDatesMap = resolveMonthlyDatesMap(schedule);
    let monthCursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    const monthEnd = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);

    while (monthCursor <= monthEnd) {
      const year = monthCursor.getFullYear();
      const month = monthCursor.getMonth();
      const monthValue = month + 1;
      const dates = monthDatesMap.get(monthValue) || [];
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      dates.forEach((day) => {
        if (day <= daysInMonth) {
          addOccurrence(new Date(year, month, day));
        }
      });

      monthCursor = addMonths(monthCursor, 1);
    }
  } else if (
    schedule.frequency === "monthly" &&
    schedule.pattern_type === "weekday_pattern"
  ) {
    const months = normalizeMonths(schedule.months);
    const monthSet = new Set(months);
    const week = String(schedule.week || "").toLowerCase();
    const day = String(schedule.day || "").toLowerCase();

    let monthCursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    const monthEnd = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);

    while (monthCursor <= monthEnd) {
      const year = monthCursor.getFullYear();
      const month = monthCursor.getMonth();
      const monthValue = month + 1;

      if (monthSet.has(monthValue)) {
        const dayOfMonth = getWeekdayPatternDayOfMonth(year, month, week, day);
        if (dayOfMonth) {
          addOccurrence(new Date(year, month, dayOfMonth));
        }
      }

      monthCursor = addMonths(monthCursor, 1);
    }
  } else {
    addOccurrence(parseDateOnly(job?.serviceDate));
  }

  const deduped = Array.from(
    new Map(
      occurrences.map((entry) => [`${entry.job._id}:${entry.dateKey}`, entry])
    ).values()
  );

  return deduped.sort((a, b) => a.date.getTime() - b.date.getTime());
};

function MyJobs() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    role: s.role,
  }));

  const [activeTab, setActiveTab] = useState("all");
  const [activeDateScope, setActiveDateScope] = useState("next_7");
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const accessError =
    !isAuthenticated || role !== "cleaner"
      ? "You need to be logged in as a cleaner to view assigned jobs."
      : "";
  const displayError = accessError || error;

  useEffect(() => {
    if (!isAuthenticated || role !== "cleaner") {
      return undefined;
    }
    let active = true;

    const loadJobs = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await quoteApi.listCleanerAssigned();
        if (!active) return;
        const items = res?.data || res || [];
        setJobs(items);
      } catch (err) {
        if (!active) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Could not load jobs. Please try again."
        );
        setJobs([]);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      active = false;
    };
  }, [isAuthenticated, role]);

  const filteredJobs = useMemo(() => {
    if (activeTab === "all") return jobs;
    return jobs.filter((job) => deriveStatus(job).key === activeTab);
  }, [jobs, activeTab]);

  const occurrenceWindow = useMemo(() => {
    const today = startOfDay(new Date());
    return {
      today,
      start: addDays(today, -30),
      end: addDays(today, 180),
    };
  }, []);

  const allOccurrences = useMemo(() => {
    return filteredJobs
      .flatMap((job) =>
        buildJobOccurrences(job, occurrenceWindow.start, occurrenceWindow.end)
      )
      .sort((a, b) => {
        const byDate = a.date.getTime() - b.date.getTime();
        if (byDate !== 0) return byDate;
        return String(a.job._id).localeCompare(String(b.job._id));
      });
  }, [filteredJobs, occurrenceWindow.end, occurrenceWindow.start]);

  const scopedOccurrences = useMemo(() => {
    const today = occurrenceWindow.today;
    const nextWeekEnd = addDays(today, 6);
    const nextMonthDate = addMonths(today, 1);

    return allOccurrences.filter((entry) => {
      const date = entry.date;

      if (activeDateScope === "today") {
        return toDateKey(date) === toDateKey(today);
      }
      if (activeDateScope === "next_7") {
        return date >= today && date <= nextWeekEnd;
      }
      if (activeDateScope === "this_month") {
        return (
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth()
        );
      }
      if (activeDateScope === "next_month") {
        return (
          date.getFullYear() === nextMonthDate.getFullYear() &&
          date.getMonth() === nextMonthDate.getMonth()
        );
      }

      return true;
    });
  }, [activeDateScope, allOccurrences, occurrenceWindow.today]);

  const groupedByDate = useMemo(() => {
    const groups = new Map();

    scopedOccurrences.forEach((entry) => {
      if (!groups.has(entry.dateKey)) {
        groups.set(entry.dateKey, {
          dateKey: entry.dateKey,
          date: entry.date,
          items: [],
        });
      }
      groups.get(entry.dateKey).items.push(entry);
    });

    return Array.from(groups.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }, [scopedOccurrences]);

  const defaultSelectedDateKey = useMemo(() => {
    if (groupedByDate.length === 0) return null;
    const todayKey = toDateKey(occurrenceWindow.today);
    const nextUpcoming =
      groupedByDate.find((group) => group.dateKey >= todayKey) || groupedByDate[0];
    return nextUpcoming.dateKey;
  }, [groupedByDate, occurrenceWindow.today]);

  const resolvedSelectedDateKey = useMemo(() => {
    if (
      selectedDateKey &&
      groupedByDate.some((group) => group.dateKey === selectedDateKey)
    ) {
      return selectedDateKey;
    }
    return defaultSelectedDateKey;
  }, [defaultSelectedDateKey, groupedByDate, selectedDateKey]);

  const selectedDateGroup = useMemo(() => {
    if (!resolvedSelectedDateKey) return null;
    return (
      groupedByDate.find((group) => group.dateKey === resolvedSelectedDateKey) ||
      null
    );
  }, [groupedByDate, resolvedSelectedDateKey]);

  const formatDateLabel = (date, withWeekday = true) =>
    date.toLocaleDateString("en-US", {
      weekday: withWeekday ? "short" : undefined,
      month: "short",
      day: "numeric",
      year: withWeekday ? undefined : "numeric",
    });

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

      <div className="flex justify-center mb-8">
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

      <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Assigned Date Planner</h2>
            <p className="text-sm text-gray-600">
              {scopedOccurrences.length} scheduled work slot
              {scopedOccurrences.length === 1 ? "" : "s"} in this view.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dateScopes.map((scope) => (
              <button
                key={scope.id}
                onClick={() => setActiveDateScope(scope.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  activeDateScope === scope.id
                    ? "border-[#C85344] bg-[#C85344]/10 text-[#C85344]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {scope.label}
              </button>
            ))}
          </div>
        </div>

        {groupedByDate.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            No assigned dates found for this range.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {groupedByDate.map((group) => {
                const selected = group.dateKey === resolvedSelectedDateKey;
                return (
                  <button
                    key={group.dateKey}
                    onClick={() => setSelectedDateKey(group.dateKey)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      selected
                        ? "border-[#C85344] bg-[#C85344]/10"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDateLabel(group.date)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {group.items.length} job{group.items.length === 1 ? "" : "s"}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              {selectedDateGroup ? (
                <>
                  <div className="mb-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-[#C85344]/80">
                        Selected Date
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedDateGroup.date.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500">
                      {selectedDateGroup.items.length} assignment
                      {selectedDateGroup.items.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {selectedDateGroup.items.map((entry) => {
                      const job = entry.job;
                      const computed = deriveStatus(job);
                      return (
                        <div
                          key={`${job._id}:${entry.dateKey}`}
                          className="rounded-xl border border-gray-200 bg-white px-4 py-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {serviceTypeLabel(job.serviceType)}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusStyles(
                                computed.key
                              )}`}
                            >
                              {computed.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-600">
                            Booking #{job._id}
                            {entry.time
                              ? ` • ${formatTimeTo12Hour(entry.time)}`
                              : ""}
                          </p>
                          <div className="mt-2">
                            <button
                              onClick={() =>
                                navigate(
                                  `/my-jobs/${job._id}?occurrenceDate=${encodeURIComponent(
                                    entry.dateKey
                                  )}`
                                )
                              }
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-800 transition hover:bg-gray-50"
                            >
                              View details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Select a date to view assignments.</p>
              )}
            </div>
          </div>
        )}
      </section>

      <div className="space-y-4">
        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {displayError}
          </div>
        )}
        {isLoading && <p className="text-center text-gray-500">Loading jobs...</p>}
        {!isLoading && filteredJobs.length === 0 && !displayError && (
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
                    {serviceTypeLabel(job.serviceType)}
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
                    {job.serviceDate
                      ? formatDateLabel(parseDateOnly(job.serviceDate) || new Date(), false)
                      : "--"}
                    {job.preferredTime ? ` • ${formatTimeTo12Hour(job.preferredTime)}` : ""}
                  </span>
                </div>

                <div className="text-sm text-gray-700 flex items-center gap-2">
                  <span role="img" aria-label="phone">
                    📞
                  </span>
                  <span>
                    {job.contactName ||
                      `${job.firstName || ""} ${job.lastName || ""}`.trim()}
                    {job.phoneNumber ? ` • ${job.phoneNumber}` : ""}
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
