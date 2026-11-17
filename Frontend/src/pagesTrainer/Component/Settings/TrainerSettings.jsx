import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useNotificationPrefs,
  useUpdateNotificationPrefs,
} from "../../../hooks/useNotifications";
import { useTrainerProfile } from "../../../hooks/useTrainerProfile";
import Loader from "../../../components/common/Loader/Loader";
import TrainerStatus from "../../components/TrainerStatus";
import { showError, showSuccess } from "../../../utils/toast";
import "./TrainerSettings.css";

const PREF_GROUPS = [
  {
    id: "channels",
    title: "Notification Channels",
    description: "Choose where you want to receive your alerts and updates",
    items: [
      {
        key: "inAppEnabled",
        label: "In-App Bell Alerts",
        description: "Show real-time notifications in the top navigation bell menu",
        icon: "bi-bell-fill",
        badge: "Essential",
      },
      {
        key: "emailEnabled",
        label: "Email Alerts",
        description: "Send critical notices and batch updates to your registered email address",
        icon: "bi-envelope-check-fill",
        badge: "Email",
      },
    ],
  },
  {
    id: "teaching",
    title: "Classroom & Attendance Alerts",
    description: "Stay ahead of your batch schedules and student attendance thresholds",
    items: [
      {
        key: "classReminders",
        label: "Class Start Reminders",
        description: "Alerts when your scheduled live classes are about to start with direct join links",
        icon: "bi-clock-history",
      },
      {
        key: "attendanceWarnings",
        label: "Low Attendance Alerts (< 75%)",
        description: "Get notified as soon as any student's attendance in your batches drops below 75%",
        icon: "bi-exclamation-triangle-fill",
      },
      {
        key: "batchAssignment",
        label: "Batch Assignments",
        description: "Alerts whenever you are assigned to a new batch or batch schedules change",
        icon: "bi-people-fill",
      },
    ],
  },
  {
    id: "academy",
    title: "Academy & Administrative Notices",
    description: "Important updates regarding academy guidelines and administrative announcements",
    items: [
      {
        key: "approvalAlerts",
        label: "Approvals & Verifications",
        description: "Notices when your profile updates or course curriculum are approved or reviewed",
        icon: "bi-patch-check-fill",
      },
      {
        key: "adminEvents",
        label: "Academy Announcements",
        description: "Broadcast notices, holiday alerts, and important news from ProgZ administration",
        icon: "bi-megaphone-fill",
      },
      {
        key: "emailDigest",
        label: "Weekly Activity Digest",
        description: "Consolidated Monday recap of student attendance and upcoming batch sessions",
        icon: "bi-calendar3-week-fill",
      },
    ],
  },
];

const DEFAULT_SETTINGS = {
  inAppEnabled: true,
  emailEnabled: true,
  approvalAlerts: true,
  batchAssignment: true,
  classReminders: true,
  attendanceWarnings: true,
  adminEvents: true,
  emailDigest: true,
};

export default function TrainerSettings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "alerts";

  const { data: prefsData, isLoading: prefsLoading, isError: prefsError, refetch: refetchPrefs } = useNotificationPrefs(true);
  const { data: profileData } = useTrainerProfile();
  const updatePrefs = useUpdateNotificationPrefs();

  const [localPrefs, setLocalPrefs] = useState(DEFAULT_SETTINGS);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  useEffect(() => {
    if (prefsData?.prefs) {
      setLocalPrefs(prefsData.prefs);
      setIsDirty(false);
    }
  }, [prefsData]);

  const handleToggle = (key) => {
    setLocalPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setIsDirty(true);
      return next;
    });
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      await updatePrefs.mutateAsync(localPrefs);
      setIsDirty(false);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      showSuccess("Alert preferences saved successfully");
    } catch (err) {
      showError(err.message || "Failed to save alert preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableAll = () => {
    const allEnabled = Object.keys(DEFAULT_SETTINGS).reduce((acc, k) => {
      acc[k] = true;
      return acc;
    }, {});
    setLocalPrefs(allEnabled);
    setIsDirty(true);
  };

  const handleDisableAll = () => {
    const allDisabled = Object.keys(DEFAULT_SETTINGS).reduce((acc, k) => {
      acc[k] = false;
      return acc;
    }, {});
    setLocalPrefs(allDisabled);
    setIsDirty(true);
  };

  const handleResetDefaults = () => {
    setLocalPrefs(DEFAULT_SETTINGS);
    setIsDirty(true);
  };

  const enabledCount = Object.values(localPrefs).filter(Boolean).length;
  const totalCount = Object.keys(DEFAULT_SETTINGS).length;

  if (prefsLoading) {
    return <Loader message="Loading settings..." />;
  }

  if (prefsError) {
    return (
      <TrainerStatus
        message="Could not load your alert preferences."
        onRetry={() => refetchPrefs()}
        onBack={() => navigate("/trainer-dashboard")}
        backLabel="Back to dashboard"
      />
    );
  }

  return (
    <div className="trainer-settings-wrapper">
      <div className="trainer-settings-container">
        {/* Top Header */}
        <header className="trainer-settings-header">
          <div className="trainer-settings-title-group">
            <button
              className="trainer-settings-back-btn"
              onClick={() => navigate("/trainer-dashboard")}
              aria-label="Back to dashboard"
              title="Back to dashboard"
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            <div>
              <div className="trainer-settings-badge">
                <i className="bi bi-sliders"></i> Trainer Preferences
              </div>
              <h1 className="trainer-settings-heading">Settings & Preferences</h1>
              <p className="trainer-settings-subheading">
                Customize your alerts, notification channels, and portal preferences.
              </p>
            </div>
          </div>

          <div className="trainer-settings-header-actions">
            {isDirty && (
              <span className="trainer-settings-dirty-pill">
                <i className="bi bi-dot"></i> Unsaved changes
              </span>
            )}
            <button
              type="button"
              className="trainer-save-btn"
              onClick={handleSaveAll}
              disabled={isSaving || !isDirty}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Saving…
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle"></i> Save Preferences
                </>
              )}
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="trainer-settings-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "alerts"}
            className={`trainer-tab-btn ${activeTab === "alerts" ? "active" : ""}`}
            onClick={() => setSearchParams({ tab: "alerts" })}
          >
            <i className="bi bi-bell-fill"></i>
            <span>Alert Preferences</span>
            <span className="trainer-tab-badge">{enabledCount}/{totalCount} Active</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "account"}
            className={`trainer-tab-btn ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setSearchParams({ tab: "account" })}
          >
            <i className="bi bi-person-badge-fill"></i>
            <span>Account Details</span>
          </button>
        </div>

        {/* Tab 1: Alert Preferences */}
        {activeTab === "alerts" && (
          <div className="trainer-alerts-content">
            {/* Quick Overview Card */}
            <div className="trainer-alerts-summary-card">
              <div className="summary-left">
                <div className="summary-icon-box">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div>
                  <h3 className="summary-title">Alert Protection Status</h3>
                  <p className="summary-desc">
                    {localPrefs.inAppEnabled && localPrefs.emailEnabled
                      ? "Both In-App and Email notifications are actively delivering reminders."
                      : localPrefs.inAppEnabled
                      ? "In-App alerts are active. Email alerts are paused."
                      : localPrefs.emailEnabled
                      ? "Email alerts are active. In-App bell alerts are paused."
                      : "All alert notifications are currently disabled."}
                  </p>
                </div>
              </div>

              <div className="summary-actions">
                <button
                  type="button"
                  className="trainer-chip-btn"
                  onClick={handleEnableAll}
                  title="Enable all notifications"
                >
                  <i className="bi bi-check-all"></i> Enable All
                </button>
                <button
                  type="button"
                  className="trainer-chip-btn"
                  onClick={handleDisableAll}
                  title="Turn off all notifications"
                >
                  <i className="bi bi-slash-circle"></i> Disable All
                </button>
                <button
                  type="button"
                  className="trainer-chip-btn"
                  onClick={handleResetDefaults}
                  title="Reset to recommended defaults"
                >
                  <i className="bi bi-arrow-counterclockwise"></i> Reset
                </button>
              </div>
            </div>

            {/* Preference Groups */}
            <div className="trainer-pref-groups">
              {PREF_GROUPS.map((group) => (
                <section key={group.id} className="trainer-pref-card">
                  <div className="trainer-pref-card-header">
                    <h2 className="trainer-group-title">{group.title}</h2>
                    <p className="trainer-group-desc">{group.description}</p>
                  </div>

                  <div className="trainer-pref-list">
                    {group.items.map((item) => {
                      const isChecked = localPrefs[item.key] !== false;
                      return (
                        <div
                          key={item.key}
                          className={`trainer-pref-item ${isChecked ? "is-enabled" : "is-disabled"}`}
                          onClick={() => handleToggle(item.key)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleToggle(item.key);
                            }
                          }}
                        >
                          <div className="trainer-pref-icon">
                            <i className={`bi ${item.icon}`}></i>
                          </div>

                          <div className="trainer-pref-info">
                            <div className="trainer-pref-label-row">
                              <span className="trainer-pref-label">{item.label}</span>
                              {item.badge && (
                                <span className="trainer-item-badge">{item.badge}</span>
                              )}
                            </div>
                            <p className="trainer-pref-desc">{item.description}</p>
                          </div>

                          <div className="trainer-pref-control" onClick={(e) => e.stopPropagation()}>
                            <label className="trainer-toggle-switch">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggle(item.key)}
                                aria-label={item.label}
                              />
                              <span className="trainer-toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* Bottom Save Bar (Sticky or bottom anchor) */}
            <div className="trainer-settings-bottom-bar">
              <div className="bottom-bar-status">
                {lastSavedTime ? (
                  <span className="last-saved-text">
                    <i className="bi bi-check-circle-fill"></i> Last saved at {lastSavedTime}
                  </span>
                ) : (
                  <span className="last-saved-text neutral">
                    <i className="bi bi-info-circle"></i> Configure your alert preferences and save
                  </span>
                )}
              </div>

              <div className="bottom-bar-buttons">
                {isDirty && (
                  <button
                    type="button"
                    className="trainer-discard-btn"
                    onClick={() => {
                      if (prefsData?.prefs) setLocalPrefs(prefsData.prefs);
                      setIsDirty(false);
                    }}
                    disabled={isSaving}
                  >
                    Discard Changes
                  </button>
                )}
                <button
                  type="button"
                  className="trainer-save-btn"
                  onClick={handleSaveAll}
                  disabled={isSaving || !isDirty}
                >
                  {isSaving ? "Saving…" : "Save Preferences"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Account Overview & Shortcuts */}
        {activeTab === "account" && (
          <div className="trainer-account-content">
            <div className="trainer-pref-card">
              <div className="trainer-pref-card-header">
                <h2 className="trainer-group-title">Trainer Profile</h2>
                <p className="trainer-group-desc">Your basic account credentials and assigned role</p>
              </div>

              <div className="trainer-account-card-body">
                <div className="account-details-grid">
                  <div className="account-detail-item">
                    <span className="detail-title">Full Name</span>
                    <strong className="detail-value">{profileData?.name || "Trainer"}</strong>
                  </div>
                  <div className="account-detail-item">
                    <span className="detail-title">Registered Email</span>
                    <strong className="detail-value">{profileData?.email || "—"}</strong>
                  </div>
                  <div className="account-detail-item">
                    <span className="detail-title">Contact Phone</span>
                    <strong className="detail-value">{profileData?.phone || "—"}</strong>
                  </div>
                  <div className="account-detail-item">
                    <span className="detail-title">Role & Permissions</span>
                    <span className="detail-pill">{profileData?.role || "trainer"}</span>
                  </div>
                </div>

                <div className="account-actions-row">
                  <button
                    type="button"
                    className="trainer-btn-primary"
                    onClick={() => navigate("/trainer-dashboard/profile/edit")}
                  >
                    <i className="bi bi-pencil-square"></i> Edit Profile Information
                  </button>
                  <button
                    type="button"
                    className="trainer-btn-secondary"
                    onClick={() => navigate("/trainer-dashboard/profile")}
                  >
                    <i className="bi bi-person-circle"></i> View Full Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
