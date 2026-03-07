import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { useAuthStore } from "../state/useAuthStore";
import { useRealtimeNotificationStore } from "../state/useRealtimeNotificationStore";

const SUPPORTED_ROLES = new Set(["client", "cleaner"]);

const resolveSocketBaseUrl = () => {
  const configured = (import.meta.env.VITE_BASE_URL || "").trim();
  const fallback = typeof window !== "undefined"
    ? `${window.location.origin}/api/v1`
    : "http://localhost:3000/api/v1";

  try {
    const url = new URL(configured || fallback, window.location.origin);
    return url.origin;
  } catch {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "http://localhost:3000";
  }
};

const QuoteAssignmentNotifications = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const addNotification = useRealtimeNotificationStore(
    (state) => state.addNotification
  );
  const clearNotifications = useRealtimeNotificationStore(
    (state) => state.clearNotifications
  );

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      clearNotifications();
      return undefined;
    }

    const normalizedRole = (role || "").toLowerCase();
    if (!SUPPORTED_ROLES.has(normalizedRole)) {
      return undefined;
    }

    const socket = io(resolveSocketBaseUrl(), {
      path: "/ws",
      auth: {
        token: accessToken,
      },
    });

    const onQuoteAssignment = (payload = {}) => {
      const message =
        payload.message ||
        payload.title ||
        `Booking assignment updated${payload.quoteId ? ` (#${payload.quoteId})` : ""}.`;

      const toastId = [
        "quote-assignment",
        payload.recipientType || normalizedRole || "user",
        payload.quoteId || "unknown",
        payload.assignmentType || "updated",
        payload.createdAt || Date.now(),
      ].join(":");

      addNotification("quote:assignment", payload);

      toast.info(message, {
        toastId,
      });
    };

    const onQuoteStatus = (payload = {}) => {
      const message =
        payload.message ||
        payload.title ||
        `Booking status updated${payload.quoteId ? ` (#${payload.quoteId})` : ""}.`;

      const toastId = [
        "quote-status",
        payload.recipientType || normalizedRole || "user",
        payload.quoteId || "unknown",
        payload.status || "updated",
        payload.createdAt || Date.now(),
      ].join(":");

      addNotification("quote:status", payload);

      toast.info(message, {
        toastId,
      });
    };

    socket.on("quote:assignment", onQuoteAssignment);
    socket.on("quote:status", onQuoteStatus);

    return () => {
      socket.off("quote:assignment", onQuoteAssignment);
      socket.off("quote:status", onQuoteStatus);
      socket.disconnect();
    };
  }, [accessToken, addNotification, clearNotifications, isAuthenticated, role]);

  return null;
};

export default QuoteAssignmentNotifications;
