import axiosInstance from "./axiosInstance";

export const fetchNotifications = (params = {}) =>
  axiosInstance.get("/notifications", { params }).then((res) => res.data);

export const fetchUnreadCount = () =>
  axiosInstance.get("/notifications/unread-count").then((res) => res.data);

export const markNotificationRead = (id) =>
  axiosInstance.patch(`/notifications/${id}/read`).then((res) => res.data);

export const markAllNotificationsRead = () =>
  axiosInstance.patch("/notifications/read-all").then((res) => res.data);

export const fetchNotificationPrefs = () =>
  axiosInstance.get("/notifications/preferences").then((res) => res.data);

export const updateNotificationPrefs = (prefs) =>
  axiosInstance.put("/notifications/preferences", prefs).then((res) => res.data);
