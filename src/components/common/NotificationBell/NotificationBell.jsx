import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationPrefs,
  useNotifications,
  useUnreadCount,
  useUpdateNotificationPrefs,
} from "../../../hooks/useNotifications";
import { showError, showSuccess } from "../../../utils/toast";
import "./NotificationBell.css";

const TYPE_META = {
  approval: { icon: "bi-check-circle", label: "Approval" },
  rejection: { icon: "bi-x-circle", label: "Rejection" },
  pending_approval: { icon: "bi-person-check", label: "Needs review" },
  batch_assignment: { icon: "bi-people", label: "Batch" },
  class_reminder: { icon: "bi-clock", label: "Class" },
  attendance_warning: { icon: "bi-exclamation-triangle", label: "Attendance" },
  admin_event: { icon: "bi-megaphone", label: "Notice" },
};

const PREF_FIELDS = [
  { key: "inAppEnabled", label: "In-app alerts", desc: "Show notices in this bell" },
  { key: "emailEnabled", label: "Email alerts", desc: "Send matching notices to your inbox" },
  { key: "approvalAlerts", label: "Approvals", desc: "Account approved, rejected, or pending review" },
  { key: "batchAssignment", label: "Batch assignment", desc: "Added to or removed from a batch" },
  { key: "classReminders", label: "Class reminders", desc: "Upcoming class start times" },
  { key: "attendanceWarnings", label: "Attendance warnings", desc: "When attendance falls below 75%" },
  { key: "adminEvents", label: "Admin notices", desc: "Announcements and important academy events" },
];

const ADMIN_PREF_FIELDS = [
  ...PREF_FIELDS,
  { key: "emailDigest", label: "Weekly digest", desc: "Monday summary of pending work and attendance" },
];

function relativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function positionPanel(anchor, placement) {
  const rect = anchor.getBoundingClientRect();
  const width = Math.min(380, window.innerWidth - 16);
  const margin = 8;
  let top;
  let left;
  if (placement === "right") {
    top = rect.top;
    left = rect.right + margin;
  } else {
    top = rect.bottom + margin;
    left = rect.right - width;
  }
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
  const maxHeight = Math.min(520, window.innerHeight - 24);
  if (top + maxHeight > window.innerHeight - 8) {
    top = Math.max(8, window.innerHeight - maxHeight - 8);
  }
  return { top, left, width, maxHeight };
}

export default function NotificationBell({
  variant = "default",
  placement = "bottom",
  showPrefs = true,
  settingsHref = "",
  triggerClassName = "",
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const { data: listData, isLoading } = useNotifications(open);
  const { data: unreadData } = useUnreadCount(true);
  const { data: prefsData } = useNotificationPrefs(open && showPrefs && !settingsHref);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const updatePrefs = useUpdateNotificationPrefs();

  const items = listData?.items || [];
  const unreadCount = unreadData?.unreadCount ?? listData?.unreadCount ?? 0;
  const prefs = prefsData?.prefs || {};
  const fields = variant === "admin" ? ADMIN_PREF_FIELDS : PREF_FIELDS;

  const updatePosition = () => {
    if (!buttonRef.current) return;
    setCoords(positionPanel(buttonRef.current, placement));
  };

  useEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const onResize = () => updatePosition();
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onClick = (event) => {
      if (
        panelRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open, placement]);

  const badge = useMemo(() => {
    if (!unreadCount) return null;
    return unreadCount > 99 ? "99+" : String(unreadCount);
  }, [unreadCount]);

  const handleItemClick = async (item) => {
    if (!item.read) {
      try {
        await markRead.mutateAsync(item.id);
      } catch {
        /* still navigate */
      }
    }
    setOpen(false);
    if (!item.link) return;
    if (/^https?:\/\//i.test(item.link)) {
      window.open(item.link, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(item.link);
  };

  const handleMarkAll = async () => {
    try {
      await markAll.mutateAsync();
    } catch (err) {
      showError(err.message || "Could not mark notifications as read");
    }
  };

  const togglePref = async (key, value) => {
    try {
      await updatePrefs.mutateAsync({ [key]: value });
      showSuccess("Alert preference saved");
    } catch (err) {
      showError(err.message || "Could not save preference");
    }
  };

  return (
    <div className={`notify-bell ${variant === "admin" ? "is-admin" : ""}`}>
      <button
        ref={buttonRef}
        type="button"
        className={`notify-bell-btn ${triggerClassName}`.trim()}
        aria-label={unreadCount ? `${unreadCount} unread notifications` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <i className="bi bi-bell" aria-hidden="true" />
        {badge ? <span className="notify-bell-badge">{badge}</span> : null}
      </button>

      {open && coords && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              className="notify-panel"
              role="dialog"
              aria-label="Notifications"
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
                maxHeight: coords.maxHeight,
              }}
            >
              <header className="notify-panel-head">
                <div>
                  <strong>Notifications</strong>
                  <span>
                    {unreadCount
                      ? `${unreadCount} unread`
                      : "You're up to date"}
                  </span>
                </div>
                <button
                  type="button"
                  className="notify-text-btn"
                  onClick={handleMarkAll}
                  disabled={!unreadCount || markAll.isPending}
                >
                  Mark all read
                </button>
              </header>

              <div className="notify-panel-list">
                {isLoading ? (
                  <p className="notify-empty">Loading notices…</p>
                ) : items.length === 0 ? (
                  <p className="notify-empty">No notifications yet.</p>
                ) : (
                  items.map((item) => {
                    const meta = TYPE_META[item.type] || TYPE_META.admin_event;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`notify-item ${item.read ? "" : "is-unread"}`}
                        onClick={() => handleItemClick(item)}
                      >
                        <i className={`bi ${meta.icon}`} aria-hidden="true" />
                        <span>
                          <strong>{item.title}</strong>
                          {item.body ? <em>{item.body}</em> : null}
                          <small>
                            {meta.label} · {relativeTime(item.createdAt)}
                          </small>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {showPrefs ? (
                <footer className="notify-panel-foot">
                  {settingsHref ? (
                    <button
                      type="button"
                      className="notify-text-btn"
                      onClick={() => {
                        setOpen(false);
                        navigate(settingsHref);
                      }}
                    >
                      Manage alert preferences
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="notify-text-btn"
                        onClick={() => setPrefsOpen((prev) => !prev)}
                      >
                        {prefsOpen ? "Hide preferences" : "Alert preferences"}
                      </button>
                      {prefsOpen ? (
                        <div className="notify-prefs">
                          {fields.map((field) => (
                            <label key={field.key} className="notify-pref-row">
                              <span>
                                <strong>{field.label}</strong>
                                <em>{field.desc}</em>
                              </span>
                              <input
                                type="checkbox"
                                checked={prefs[field.key] !== false}
                                onChange={(event) =>
                                  togglePref(field.key, event.target.checked)
                                }
                              />
                            </label>
                          ))}
                        </div>
                      ) : null}
                    </>
                  )}
                </footer>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
