import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./LiveClassReminder.css";
import { useStudentCourses } from "../../../hooks/useStudentCourses";
import { useJoinClass } from "../../../hooks/useClassSession";
import { toast } from "react-toastify";
import {
  BiVideo,
  BiTimeFive,
  BiCalendar,
  BiCopy,
  BiLinkExternal,
  BiX,
  BiMinus,
  BiChevronUp,
  BiBroadcast,
  BiCheck,
} from "react-icons/bi";

// Helper: Calculate diff and format components
function getTimeRemaining(targetDate) {
  const total = new Date(targetDate).getTime() - Date.now();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
  };
}

// Helper: Format friendly time string (e.g. "10:00 AM")
function formatTimeOnly(dateString) {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// Helper: Check if date is today
function isToday(dateString) {
  if (!dateString) return false;
  try {
    const d = new Date(dateString);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
}

export default function LiveClassReminder() {
  const navigate = useNavigate();
  const { data } = useStudentCourses();
  const joinClassMutation = useJoinClass();

  // Find most relevant next class
  const classInfo = useMemo(() => {
    if (data?.nextClass?.nextClassAt) {
      return data.nextClass;
    }
    const withClass = (data?.enrolledCourses || [])
      .filter((c) => c.nextClassAt)
      .sort((a, b) => new Date(a.nextClassAt) - new Date(b.nextClassAt));
    return withClass[0] || null;
  }, [data]);

  // UI state
  const [isMinimized, setIsMinimized] = useState(() => {
    return sessionStorage.getItem("progz_live_minimized") === "true";
  });
  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Update countdown every second
  useEffect(() => {
    if (!classInfo?.nextClassAt) return;

    const tick = () => {
      setTimeLeft(getTimeRemaining(classInfo.nextClassAt));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [classInfo?.nextClassAt]);

  if (!classInfo || !classInfo.nextClassAt || isDismissed) {
    return null;
  }

  // Determine Class State:
  // Live: From 10 mins before start up to 90 mins after start time
  const isLiveNow = timeLeft.total <= 0 && timeLeft.total >= -90 * 60 * 1000;
  // Starting soon: Within next 30 minutes
  const isStartingSoon = timeLeft.total > 0 && timeLeft.total <= 30 * 60 * 1000;
  // Passed/Ended
  const isEnded = timeLeft.total < -90 * 60 * 1000;

  if (isEnded) return null;

  const handleMinimize = (e) => {
    e.stopPropagation();
    const next = !isMinimized;
    setIsMinimized(next);
    sessionStorage.setItem("progz_live_minimized", String(next));
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    if (!classInfo.meetLink) {
      toast.info("Trainer has not shared the Google Meet link yet.");
      return;
    }
    const link = classInfo.meetLink;
    const markCopied = () => {
      setCopied(true);
      toast.success("Meeting link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(markCopied).catch(() => {
        toast.info(`Meet link: ${link}`);
      });
    } else {
      toast.info(`Meet link: ${link}`);
    }
  };

  const handleJoinClass = (e) => {
    e.stopPropagation();

    // Trigger join mutation to record attendance timestamp
    if (classInfo.batchId) {
      joinClassMutation.mutate(classInfo.batchId);
    }

    if (classInfo.meetLink) {
      window.open(classInfo.meetLink, "_blank", "noopener,noreferrer");
    } else {
      toast.info("Class is starting! The meeting link will be posted by the instructor shortly.");
      if (classInfo.courseId) {
        navigate(`/student-dashboard/course-details/${classInfo.courseId}`);
      }
    }
  };

  // ── MINIMIZED DOCKED PILL VIEW ──
  if (isMinimized) {
    return (
      <aside
        className={`live-reminder-pill ${isLiveNow ? "is-live" : isStartingSoon ? "is-soon" : ""}`}
        onClick={handleMinimize}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleMinimize(e)}
        aria-label="Expand live class reminder"
      >
        <span className="reminder-pill-dot" />
        <span className="reminder-pill-title">
          {isLiveNow ? (
            <strong>LIVE NOW</strong>
          ) : isStartingSoon ? (
            <>Starts in <strong>{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}</strong></>
          ) : (
            <>Next Class: <strong>{classInfo.courseName || "Batch"}</strong></>
          )}
        </span>
        <button
          type="button"
          className="pill-expand-btn"
          aria-label="Expand reminder"
        >
          <BiChevronUp />
        </button>
      </aside>
    );
  }

  // ── EXPANDED FLOATING REMINDER POPUP CARD ──
  return (
    <aside
      className={`live-class-popup-card ${isLiveNow ? "card-live-now" : isStartingSoon ? "card-starting-soon" : "card-upcoming"}`}
      role="region"
      aria-label="Live Class Countdown and Reminder"
    >
      {/* Top Header Bar */}
      <div className="popup-top-bar">
        <div className="popup-status-badge">
          {isLiveNow ? (
            <>
              <span className="badge-pulse-live" />
              <BiBroadcast className="badge-icon-live" />
              <span>LIVE NOW</span>
            </>
          ) : isStartingSoon ? (
            <>
              <span className="badge-pulse-soon" />
              <BiTimeFive />
              <span>STARTING SOON</span>
            </>
          ) : (
            <>
              <span className="badge-dot-upcoming" />
              <BiCalendar />
              <span>UPCOMING CLASS</span>
            </>
          )}
        </div>

        <div className="popup-actions">
          <button
            type="button"
            className="popup-btn-icon"
            onClick={handleMinimize}
            title="Minimize reminder"
            aria-label="Minimize reminder"
          >
            <BiMinus />
          </button>
          <button
            type="button"
            className="popup-btn-icon"
            onClick={handleDismiss}
            title="Close reminder"
            aria-label="Close reminder"
          >
            <BiX />
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="popup-body">
        <h4 className="popup-course-title">
          {classInfo.courseName || "Live Mentorship Session"}
        </h4>
        <p className="popup-batch-name">
          {classInfo.batchName ? `Batch: ${classInfo.batchName}` : "Active Academy Batch"}
        </p>

        {/* Schedule Timing Subtitle */}
        <div className="popup-time-meta">
          <BiTimeFive aria-hidden="true" />
          <span>
            {isToday(classInfo.nextClassAt) ? "Today" : new Date(classInfo.nextClassAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
            {" at "}
            {formatTimeOnly(classInfo.nextClassAt)}
            {classInfo.classTiming?.endTime ? ` - ${classInfo.classTiming.endTime}` : ""}
          </span>
        </div>

        {/* Countdown Digits Grid */}
        {!isLiveNow ? (
          <div className="popup-countdown-grid">
            {timeLeft.days > 0 && (
              <div className="countdown-tile">
                <span className="countdown-digit">{String(timeLeft.days).padStart(2, "0")}</span>
                <span className="countdown-unit">Days</span>
              </div>
            )}
            <div className="countdown-tile">
              <span className="countdown-digit">{String(timeLeft.hours).padStart(2, "0")}</span>
              <span className="countdown-unit">Hours</span>
            </div>
            <div className="countdown-tile">
              <span className="countdown-digit">{String(timeLeft.minutes).padStart(2, "0")}</span>
              <span className="countdown-unit">Mins</span>
            </div>
            <div className="countdown-tile">
              <span className="countdown-digit digit-active">{String(timeLeft.seconds).padStart(2, "0")}</span>
              <span className="countdown-unit">Secs</span>
            </div>
          </div>
        ) : (
          <div className="popup-live-banner">
            <span className="live-banner-ring" />
            <span className="live-banner-text">Session has started! Join your mentor &amp; batch now.</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="popup-footer">
        <button
          type="button"
          className={`popup-btn-join ${isLiveNow ? "btn-glow-pulse" : ""}`}
          onClick={handleJoinClass}
          aria-label={isLiveNow ? "Join live class now" : "Open class meeting"}
        >
          <BiVideo className="join-btn-icon" />
          <span>{isLiveNow ? "Join Class Now" : isStartingSoon ? "Ready to Join" : "View Class Link"}</span>
          <BiLinkExternal className="join-btn-ext" />
        </button>

        {classInfo.meetLink && (
          <button
            type="button"
            className="popup-btn-copy"
            onClick={handleCopyLink}
            title="Copy Google Meet Link"
            aria-label="Copy Google Meet link"
          >
            {copied ? <BiCheck className="copy-ok" /> : <BiCopy />}
          </button>
        )}
      </div>
    </aside>
  );
}
