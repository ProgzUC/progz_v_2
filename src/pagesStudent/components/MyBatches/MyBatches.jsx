import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineCalendar, HiOutlineClock } from "react-icons/hi";
import { BiVideo, BiSearch } from "react-icons/bi";
import { BsPeople } from "react-icons/bs";
import Loader from "../../../components/common/Loader/Loader";
import { ErrorState } from "../../../components/common/PageState";
import { useStudentBatches } from "../../../hooks/useStudentCourses";
import { formatNextClass } from "../../utils/formatNextClass";
import { showSuccess, showInfo } from "../../../utils/toast";
import "./MyBatches.css";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

function initials(name = "") {
  const parts = String(name).trim().split(/[\s-_]+/).filter(Boolean);
  if (parts.length === 0) return "B";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function statusLabel(status) {
  if (status === "active") return "Active";
  if (status === "upcoming") return "Upcoming";
  if (status === "completed") return "Completed";
  return status || "Batch";
}

export default function MyBatches() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useStudentBatches();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const activeBatches = data?.activeBatches || [];
  const completedBatches = data?.completedBatches || [];
  const allBatches = useMemo(
    () => [...activeBatches, ...completedBatches],
    [activeBatches, completedBatches]
  );

  const filteredBatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allBatches.filter((batch) => {
      if (statusFilter !== "all" && batch.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        batch.batchName,
        ...(batch.courseNames || []),
        ...(batch.courses || []).map((c) => c.courseName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [allBatches, statusFilter, search]);

  const counts = useMemo(() => {
    const base = { all: allBatches.length, active: 0, upcoming: 0, completed: 0 };
    allBatches.forEach((b) => {
      if (b.status === "active") base.active += 1;
      else if (b.status === "upcoming") base.upcoming += 1;
      else if (b.status === "completed") base.completed += 1;
    });
    return base;
  }, [allBatches]);

  if (isLoading) return <Loader message="Loading your batches..." />;

  if (isError) {
    return (
      <div className="student-batches-page">
        <ErrorState
          title="Batches could not be loaded"
          message="Your assigned batches are still safe. Try again to refresh."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const copyMeet = (link) => {
    if (!link) {
      showInfo("No meet link for this batch yet.");
      return;
    }
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(link)
        .then(() => showSuccess("Meet link copied"))
        .catch(() => showSuccess(`Meet link: ${link}`));
    } else {
      showSuccess(`Meet link: ${link}`);
    }
  };

  const openCourse = (courseId) => {
    if (!courseId) {
      navigate("/student-dashboard/my-courses");
      return;
    }
    navigate(`/student-dashboard/course-details/${courseId}`);
  };

  const BatchCard = ({ batch }) => {
    const pct = Number(batch.completionPercentage) || 0;
    const nextLabel = formatNextClass(batch.nextClassAt);
    const dateRange = [formatDate(batch.startDate), formatDate(batch.endDate)]
      .filter(Boolean)
      .join(" – ");
    const courses = batch.courses || [];
    const courseCount = courses.length || (batch.courseNames || []).length;
    const primaryCourseId = courses[0]?.courseId;

    return (
      <article className="sb-batch-card">
        <div className="sb-batch-card__head">
          <span className="sb-batch-card__avatar" aria-hidden="true">
            {initials(batch.batchName)}
          </span>
          <div className="sb-batch-card__copy">
            <span className="sb-batch-card__kicker">Assigned batch</span>
            <h3 className="sb-batch-card__title">{batch.batchName}</h3>
            <p className="sb-batch-card__courses">
              {courseCount > 0
                ? `${courseCount} course${courseCount === 1 ? "" : "s"}`
                : "No courses"}
              {(batch.courseNames || []).length > 0
                ? ` · ${batch.courseNames.join(", ")}`
                : ""}
            </p>
          </div>
          <span className={`sb-batch-card__status ${batch.status || ""}`}>
            {statusLabel(batch.status)}
          </span>
        </div>

        <div className="sb-batch-card__meta">
          <div className="sb-batch-card__row">
            <HiOutlineCalendar />
            <span>{dateRange || "Dates TBA"}</span>
          </div>
          <div className="sb-batch-card__row">
            <HiOutlineClock />
            <span>{batch.timing || "Timing TBA"}</span>
          </div>
          <div className="sb-batch-card__row">
            <BsPeople />
            <span>
              {(batch.daysOfWeek || []).length > 0
                ? batch.daysOfWeek.join(", ")
                : "Days TBA"}
            </span>
          </div>
          <div className="sb-batch-card__row sb-batch-card__row--accent">
            <BiVideo />
            <span>{nextLabel ? `Next class · ${nextLabel}` : "No upcoming class"}</span>
          </div>
        </div>

        <div className="sb-batch-card__progress">
          <div className="sb-batch-card__progress-label">
            <span>Progress</span>
            <strong>{pct}%</strong>
          </div>
          <div
            className="sb-batch-card__bar"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
          </div>
        </div>

        <div className="sb-batch-card__actions">
          <button
            type="button"
            className="sb-batch-card__primary"
            onClick={() => openCourse(primaryCourseId)}
          >
            Open courses
          </button>
          <button
            type="button"
            className="sb-batch-card__secondary"
            onClick={() => copyMeet(batch.meetLink)}
          >
            Meet link
          </button>
          <button
            type="button"
            className="sb-batch-card__secondary"
            onClick={() =>
              navigate(`/student-dashboard/my-attendance?batchId=${batch.batchId}`)
            }
          >
            Attendance
          </button>
        </div>
      </article>
    );
  };

  const emptyText =
    search.trim() || statusFilter !== "all"
      ? {
          title: "No batches match",
          text: "Try another status filter or clear the search.",
        }
      : {
          title: "No batches assigned yet",
          text: "When an admin adds you to a batch, it will show up here.",
        };

  return (
    <section className="student-batches-page">
      <header className="sb-page-head">
        <p className="sb-kicker">Your schedule</p>
        <h2>My Batches</h2>
        <p>Batches assigned to you — separate from the course catalog.</p>
      </header>

      <div className="sb-statbar" aria-label="Batch totals">
        <article>
          <strong>{counts.active + counts.upcoming}</strong>
          <span>Assigned</span>
        </article>
        <article>
          <strong>{counts.completed}</strong>
          <span>Completed</span>
        </article>
        <article>
          <strong>
            {activeBatches.reduce((n, b) => n + (b.courses?.length || 0), 0)}
          </strong>
          <span>Courses in batches</span>
        </article>
      </div>

      <div className="sb-filters">
        <div className="sb-filter-chips" role="tablist" aria-label="Filter batches by status">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === filter.id}
              className={`sb-filter-chip ${statusFilter === filter.id ? "active" : ""}`}
              onClick={() => setStatusFilter(filter.id)}
            >
              {filter.label}
              <em>{counts[filter.id] ?? 0}</em>
            </button>
          ))}
        </div>

        <label className="sb-search">
          <BiSearch aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batch or course…"
            aria-label="Search batches"
          />
        </label>
      </div>

      <div className="sb-section-head">
        <p>
          {statusFilter === "all"
            ? "All assigned"
            : statusLabel(statusFilter)}
        </p>
        <h3>
          {filteredBatches.length} batch{filteredBatches.length === 1 ? "" : "es"}
        </h3>
      </div>

      <div className="sb-batches-grid">
        {filteredBatches.length > 0 ? (
          filteredBatches.map((batch) => (
            <BatchCard key={String(batch.batchId)} batch={batch} />
          ))
        ) : (
          <div className="sb-batches-empty">
            <h3>{emptyText.title}</h3>
            <p>{emptyText.text}</p>
            {(search.trim() || statusFilter !== "all") && (
              <button
                type="button"
                className="sb-clear-filters"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
