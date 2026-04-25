import { useEffect } from "react";
import { toast } from "@/lib/notify";
import { resolveSocketOrigin } from "@/lib/api-base";
import { useAuthStore } from "../state/useAuthStore";
import { useRealtimeNotificationStore } from "../state/useRealtimeNotificationStore";

const SUPPORTED_ROLES = new Set(["client", "cleaner"]);

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

    let isActive = true;
    let socket;

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

    const connect = async () => {
      try {
        const { io } = await import("socket.io-client");
        if (!isActive) {
          return;
        }

        socket = io(resolveSocketOrigin(), {
          path: "/ws",
          auth: {
            token: accessToken,
          },
        });

        socket.on("quote:assignment", onQuoteAssignment);
        socket.on("quote:status", onQuoteStatus);
      } catch (error) {
        console.error("Failed to initialize realtime notifications", error);
      }
    };

    void connect();

    return () => {
      isActive = false;
      if (!socket) {
        return;
      }
      socket.off("quote:assignment", onQuoteAssignment);
      socket.off("quote:status", onQuoteStatus);
      socket.disconnect();
    };
  }, [accessToken, addNotification, clearNotifications, isAuthenticated, role]);

  return null;
};

export default QuoteAssignmentNotifications;
