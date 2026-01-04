import React from "react";
import "./ActiveBatches.css";
import batchesData from "./batchesData.json";
import { HiOutlineCalendar, HiOutlineClock } from "react-icons/hi";

import { BsHourglassSplit } from "react-icons/bs";

const ActiveBatches = ({ onViewDetails = () => { } }) => {
  const { activeBatches, completedBatches } = batchesData;

  const BatchCard = ({ batch }) => {
    const isActive = batch.status === "active";

    return (
      <article className="batch-card" aria-label={batch.title}>
        <div className="batch-card__top">
          <span className="batch-card__batch">{batch.batchNumber}</span>

          <span className={`batch-card__status ${batch.status}`}>
            <span className="batch-card__dot" />
            {isActive ? "Active" : "Completed"}
          </span>
        </div>

        <h3 className="batch-card__title">{batch.title}</h3>

        <div className="batch-card__details">
          <div className="batch-card__row">
            <span className="batch-card__icon"><HiOutlineCalendar /></span>
            <span>{batch.date}</span>
          </div>
          <div className="batch-card__row">
            <span className="batch-card__icon"><BsHourglassSplit /></span>
            <span>{batch.duration}</span>
          </div>
          <div className="batch-card__row">
            <span className="batch-card__icon"><HiOutlineClock /></span>
            <span>{batch.time}</span>
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
            /* For completed, only the button on the right, no link on left */
            /* Use a spacer or flex-end if needed, but flex: space-between works if one item matches */
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
    <section className="batches-page">
      <h2 className="batches-title">Active Batches</h2>

      <div className="batches-grid">
        {activeBatches.map((b) => (
          <BatchCard key={b.id} batch={b} />
        ))}
      </div>

      <h2 className="batches-title batches-title--spaced">Completed Batches</h2>

      <div className="batches-grid">
        {completedBatches.map((b) => (
          <BatchCard key={b.id} batch={b} />
        ))}
      </div>
    </section>
  );
};

export default ActiveBatches;
