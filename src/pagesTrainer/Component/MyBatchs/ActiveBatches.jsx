import React from "react";
import { useNavigate } from "react-router-dom";
import "./ActiveBatches.css";
import { useTrainerBatches } from "../../../hooks/useBatches";
import { HiOutlineCalendar, HiOutlineClock } from "react-icons/hi";
import { BsHourglassSplit } from "react-icons/bs";
import Loader from "../../../components/common/Loader/Loader";
import TrainerStatus from "../../components/TrainerStatus";

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

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    return weeks > 0 ? `${weeks} week${weeks > 1 ? 's' : ''}` : `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const BatchCard = ({ batch }) => {
    const isActive = batch.status === "active";
    const batchId = batch.batchId || batch._id || batch.id;

    const batchNumber = batch.batchName;
    const title = batch.courseName;
    const date = formatDate(batch.startDate);
    const duration = batch.duration || calculateDuration(batch.startDate, batch.endDate);
    const timing = batch.timing || null;

    return (
      <article className="batch-card" aria-label={title}>
        <div className="batch-card__top">
          <span className="batch-card__batch">{batchNumber}</span>

          <span className={`batch-card__status ${batch.status}`}>
            <span className="batch-card__dot" />
            {isActive ? "Active" : batch.status === "completed" ? "Completed" : batch.status}
          </span>
        </div>

        <h3 className="batch-card__title">{title}</h3>

        <div className="batch-card__details">
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

        <div className="batch-card__actions">
          <button
            type="button"
            className="batch-card__btn"
            onClick={() => batchId && navigate(`/trainer-dashboard/batches/${batchId}`)}
          >
            {isActive ? "Open batch" : "View details"}
          </button>
        </div>
      </article>
    );
  };

  return (
    <section className="trainer-active-batches-page">
      <h2 className="batches-title">Active Batches</h2>

      <div className="batches-grid">
        {activeBatches.length > 0 ? (
          activeBatches.map((b, idx) => (
            <BatchCard key={b._id || b.id || idx} batch={b} />
          ))
        ) : (
          <div className="batches-empty-state" aria-live="polite">
            <div className="batches-empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="batches-empty-state-title">No active batches</h3>
            <p className="batches-empty-state-text">When a batch is assigned to you, it will show up here.</p>
          </div>
        )}
      </div>

      <h2 className="batches-title batches-title--spaced">Completed Batches</h2>

      <div className="batches-grid">
        {completedBatches.length > 0 ? (
          completedBatches.map((b, idx) => (
            <BatchCard key={b._id || b.id || idx} batch={b} />
          ))
        ) : (
          <div className="batches-empty-state" aria-live="polite">
            <div className="batches-empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="batches-empty-state-title">No completed batches yet</h3>
            <p className="batches-empty-state-text">When you finish running a batch, it will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActiveBatches;
