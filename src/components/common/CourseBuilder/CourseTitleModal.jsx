import React, { useState } from "react";
import "./CourseBuilder.css";

const MAX_TITLE_LENGTH = 100;

export default function CourseTitleModal({ onContinue, onClose }) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onContinue(trimmed);
  };

  return (
    <div className="course-title-modal-overlay">
      <div className="course-title-modal">
        <button type="button" className="course-title-modal-close" onClick={onClose} aria-label="Close">
          <i className="bi bi-x-lg" />
        </button>

        <p className="course-title-modal-label">CREATE NEW COURSE</p>

        <h2>
          What&apos;s the title of your <em>next course</em>?
        </h2>
        <p className="course-title-modal-sub">
          Start with a working title. You can always refine this as you develop your content.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="course-title-input-wrap">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
              placeholder="e.g. Introduction to Modern Arts"
              autoFocus
            />
            <span className="course-title-char-count">
              {title.length}/{MAX_TITLE_LENGTH}
            </span>
          </div>

          <button type="submit" className="submit-btn" disabled={!title.trim()}>
            Continue to Creation
          </button>
        </form>
      </div>
    </div>
  );
}
