import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  fetchNotificationPrefs,
  updateNotificationPrefs,
} from "../api/notificationApi";

export const useNotifications = (enabled = true) =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications({ limit: 40 }),
    enabled,
    refetchInterval: 30000,
    retry: 1,
  });

export const useUnreadCount = (enabled = true) =>
  useQuery({
    queryKey: ["notifications-unread"],
    queryFn: fetchUnreadCount,
    enabled,
    refetchInterval: 20000,
    retry: 1,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
};

export const useNotificationPrefs = (enabled = true) =>
  useQuery({
    queryKey: ["notification-prefs"],
    queryFn: fetchNotificationPrefs,
    enabled,
    retry: 1,
  });

export const useUpdateNotificationPrefs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationPrefs,
    onSuccess: (data) => {
      queryClient.setQueryData(["notification-prefs"], data);
    },
  });
};
