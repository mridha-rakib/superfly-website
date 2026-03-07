import { create } from "zustand";

const MAX_NOTIFICATIONS = 50;

const toIsoString = (value) => {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
};

const makeNotificationId = (type, payload = {}) =>
  [
    type || "notification",
    payload.recipientType || "user",
    payload.quoteId || "unknown",
    payload.assignmentType || payload.status || "updated",
    payload.createdAt || "",
  ].join(":");

const normalizeNotification = (type, payload = {}) => {
  const fallbackTitle =
    type === "quote:assignment"
      ? "Booking assignment updated"
      : "Booking status updated";

  return {
    id: makeNotificationId(type, payload),
    type,
    quoteId: payload.quoteId ? String(payload.quoteId) : null,
    recipientType: payload.recipientType || "user",
    assignmentType: payload.assignmentType || null,
    status: payload.status || null,
    serviceType: payload.serviceType || "",
    serviceDate: payload.serviceDate || "",
    preferredTime: payload.preferredTime || "",
    title: payload.title || fallbackTitle,
    message:
      payload.message ||
      `${fallbackTitle}${payload.quoteId ? ` (#${payload.quoteId})` : "."}`,
    createdAt: toIsoString(payload.createdAt),
    isRead: false,
  };
};

export const useRealtimeNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (type, payload = {}) =>
    set((state) => {
      const next = normalizeNotification(type, payload);
      if (state.notifications.some((item) => item.id === next.id)) {
        return state;
      }
      return {
        notifications: [next, ...state.notifications].slice(0, MAX_NOTIFICATIONS),
      };
    }),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((item) => ({ ...item, isRead: true })),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));
