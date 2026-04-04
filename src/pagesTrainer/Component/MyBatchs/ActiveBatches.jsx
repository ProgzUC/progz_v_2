import React from "react";
import "./ActiveBatches.css";
import { useTrainerBatches } from "../../../hooks/useBatches";
import { HiOutlineCalendar, HiOutlineClock } from "react-icons/hi";
import { BsHourglassSplit } from "react-icons/bs";
import Loader from "../../../components/common/Loader/Loader";

const ActiveBatches = ({ onViewDetails = () => { } }) => {
  const { data, isLoading, isError } = useTrainerBatches();

  if (isLoading) return <Loader message="Loading batches..." />;
  if (isError) return <div className="trainer-active-batches-page"><p>Error loading batches.</p></div>;

  const activeBatches = data?.activeBatches || [];
  const completedBatches = data?.completedBatches || [];

  const formatClassTiming = (timing) => {
    if (!timing) return "Not Scheduled";
    return timing;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "Duration not set";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    return weeks > 0 ? `${weeks} week${weeks > 1 ? 's' : ''}` : `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const BatchCard = ({ batch }) => {
    const isActive = batch.status === "active";

    // Map API fields - backend now returns batchName, courseName, timing directly
    const batchNumber = batch.batchName;
    const title = batch.courseName;
    const date = formatDate(batch.startDate);
    const duration = batch.duration || calculateDuration(batch.startDate, batch.endDate);
    const timing = formatClassTiming(batch.timing);

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
          <div className="batch-card__row">
            <span className="batch-card__icon"><HiOutlineCalendar /></span>
            <span>{date}</span>
          </div>
          <div className="batch-card__row">
            <span className="batch-card__icon"><BsHourglassSplit /></span>
            <span>{duration}</span>
          </div>
          <div className="batch-card__row">
            <span className="batch-card__icon"><HiOutlineClock /></span>
            <span>{timing}</span>
          </div>
        </div>

        <div className="batch-card__actions">
          {isActive ? (
            <>
              <button
                className="batch-card__link"
                onClick={() => onViewDetails(batch)}
              >
                View details
              </button>
              <button
                className="batch-card__btn"
                onClick={() => onViewDetails(batch)}
              >
                Join now <span className="batch-card__arrow">→</span>
              </button>
            </>
          ) : (
            <button
              className="batch-card__btn"
              style={{ marginLeft: 'auto' }}
              onClick={() => onViewDetails(batch)}
            >
              View details
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <section className="trainer-active-batches-page">
      <h2 className="batches-title">Active Batches</h2>

      <div className="batches-grid">
        {activeBatches.map((b, idx) => (
          <BatchCard key={b._id || b.id || idx} batch={b} />
        ))}
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
