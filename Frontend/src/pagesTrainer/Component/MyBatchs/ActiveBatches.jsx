import React from "react";
import { useNavigate } from "react-router-dom";
import "./ActiveBatches.css";
import { useTrainerBatches } from "../../../hooks/useBatches";
import { HiOutlineCalendar, HiOutlineClock } from "react-icons/hi";
import { BsHourglassSplit, BsPeople } from "react-icons/bs";
import Loader from "../../../components/common/Loader/Loader";
import TrainerStatus from "../../components/TrainerStatus";

function initials(name = "") {
  const parts = String(name).trim().split(/[\s-_]+/).filter(Boolean);
  if (parts.length === 0) return "B";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const ActiveBatches = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useTrainerBatches();

  if (isLoading) return <Loader message="Loading batches..." />;
  if (isError) {
    return (
      <TrainerStatus
        message="Batches could not be loaded."
        onRetry={() => refetch()}
      />
    );
  }

  const activeBatches = data?.activeBatches || [];
  const completedBatches = data?.completedBatches || [];
  const studentTotal = activeBatches.reduce((sum, batch) => sum + (Number(batch.studentsCount) || 0), 0);
  const avgProgress = activeBatches.length
    ? Math.round(activeBatches.reduce((sum, batch) => sum + (Number(batch.completionPercentage) || 0), 0) / activeBatches.length)
    : 0;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    return weeks > 0 ? `${weeks} week${weeks > 1 ? "s" : ""}` : `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  };

  const BatchCard = ({ batch }) => {
    const isActive = batch.status === "active";
    const batchId = batch.batchId || batch._id || batch.id;
    const title = batch.courseName || batch.batchName;
    const date = formatDate(batch.startDate);
    const duration = batch.duration || calculateDuration(batch.startDate, batch.endDate);
    const timing = batch.timing || null;
    const students = Number(batch.studentsCount);
    const pct = Number(batch.completionPercentage);
    const hasProgress = Number.isFinite(pct);

    return (
      <button
        type="button"
        className="batch-card"
        onClick={() => batchId && navigate(`/trainer-dashboard/batches/${batchId}`)}
        aria-label={`Open ${batch.batchName || title}`}
      >
        <div className="batch-card__head">
          <span className="batch-card__avatar" aria-hidden="true">{initials(batch.batchName || title)}</span>
          <div className="batch-card__copy">
            <span className="batch-card__batch">{batch.batchName}</span>
            <h3 className="batch-card__title">{title}</h3>
          </div>
          <span className={`batch-card__status ${batch.status}`}>
            <span className="batch-card__dot" />
            {isActive ? "Active" : batch.status === "completed" ? "Completed" : batch.status}
          </span>
        </div>

        <div className="batch-card__details">
          {Number.isFinite(students) && (
            <div className="batch-card__row">
              <span className="batch-card__icon"><BsPeople /></span>
              <span>{students} {students === 1 ? "Student" : "Students"}</span>
            </div>
          )}
          {date && (
            <div className="batch-card__row">
              <span className="batch-card__icon"><HiOutlineCalendar /></span>
              <span>{date}</span>
            </div>
          )}
          {duration && (
            <div className="batch-card__row">
              <span className="batch-card__icon"><BsHourglassSplit /></span>
              <span>{duration}</span>
            </div>
          )}
          {timing && (
            <div className="batch-card__row">
              <span className="batch-card__icon"><HiOutlineClock /></span>
              <span>{timing}</span>
            </div>
          )}
        </div>

        {hasProgress && (
          <div className="batch-card__progress">
            <div className="batch-card__progress-label">
              <span>Completion</span>
              <strong>{pct}%</strong>
            </div>
            <div className="batch-card__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
            </div>
          </div>
        )}

        <span className="batch-card__go">{isActive ? "Open batch" : "View details"}</span>
      </button>
    );
  };

  const renderGrid = (list, empty) => (
    <div className="batches-grid">
      {list.length > 0 ? (
        list.map((batch, idx) => (
          <BatchCard key={batch.batchId || batch._id || batch.id || idx} batch={batch} />
        ))
      ) : (
        <div className="batches-empty-state" aria-live="polite">
          <h3 className="batches-empty-state-title">{empty.title}</h3>
          <p className="batches-empty-state-text">{empty.text}</p>
        </div>
      )}
    </div>
  );

  return (
    <section className="trainer-active-batches-page">
      <div className="tb-statbar" aria-label="Batch totals">
        <article><strong>{activeBatches.length}</strong><span>Active batches</span></article>
        <article><strong>{completedBatches.length}</strong><span>Completed</span></article>
        <article><strong>{studentTotal}</strong><span>Students</span></article>
        <article><strong>{avgProgress}%</strong><span>Avg. progress</span></article>
      </div>

      <div className="tb-section-head">
        <p>Live now</p>
        <h2>Active batches</h2>
      </div>
      {renderGrid(activeBatches, {
        title: "No active batches",
        text: "When a batch is assigned to you, it will show up here.",
      })}

      <div className="tb-section-head tb-section-head--spaced">
        <p>Finished</p>
        <h2>Completed batches</h2>
      </div>
      {renderGrid(completedBatches, {
        title: "No completed batches yet",
        text: "When you finish running a batch, it will appear here.",
      })}
    </section>
  );
};

export default ActiveBatches;
