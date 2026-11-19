import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  fetchNotificationPrefs,
  updateNotificationPrefs,
} from "../api/notificationApi";

export const useNotifications = (enabled = true, options = {}) => {
  const unreadOnly = Boolean(options.unreadOnly);
  return useQuery({
    queryKey: ["notifications", { unreadOnly }],
    queryFn: () =>
      fetchNotifications({
        limit: 40,
        ...(unreadOnly ? { unread: true } : {}),
      }),
    enabled,
    refetchInterval: 30000,
    retry: 1,
  });
};

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
    onSuccess: (_data, id) => {
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (old) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.filter((item) => item.id !== id),
          unreadCount: Math.max(0, (old.unreadCount || 0) - 1),
        };
      });
      queryClient.setQueryData(["notifications-unread"], (old) => ({
        unreadCount: Math.max(0, (old?.unreadCount || 1) - 1),
      }));
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
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (old) => {
        if (!old) return old;
        return { ...old, items: [], unreadCount: 0 };
      });
      queryClient.setQueryData(["notifications-unread"], { unreadCount: 0 });
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
