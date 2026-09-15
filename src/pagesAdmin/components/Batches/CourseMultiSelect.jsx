import React, { useEffect, useMemo, useRef, useState } from "react";
import "./CourseMultiSelect.css";

const CourseMultiSelect = ({
  coursesList = [],
  selectedIds = [],
  onToggle,
  onToggleAll,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selectedSet = useMemo(
    () => new Set((selectedIds || []).map(String)),
    [selectedIds]
  );

  const allSelected =
    coursesList.length > 0 &&
    coursesList.every((c) => selectedSet.has(String(c._id)));

  const selectedNames = coursesList
    .filter((c) => selectedSet.has(String(c._id)))
    .map((c) => c.courseName);

  const summary =
    selectedNames.length === 0
      ? "Select courses"
      : selectedNames.length <= 2
        ? selectedNames.join(", ")
        : `${selectedNames.slice(0, 2).join(", ")} +${selectedNames.length - 2} more`;

  useEffect(() => {
    if (!open) return undefined;

    const handleOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="course-multi-select" ref={rootRef}>
      <button
        type="button"
        className={`course-multi-select-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`course-multi-select-text ${selectedNames.length ? "" : "placeholder"}`}>
          {summary}
        </span>
        <span className={`course-multi-select-chevron ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="course-multi-select-panel" role="listbox" aria-multiselectable="true">
          <label className="course-multi-select-option all">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAll}
            />
            <span>(all)</span>
          </label>
          {coursesList.map((c) => {
            const id = String(c._id);
            const checked = selectedSet.has(id);
            return (
              <label key={id} className="course-multi-select-option">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(c._id)}
                />
                <span>{c.courseName}</span>
              </label>
            );
          })}
          {coursesList.length === 0 && (
            <div className="course-multi-select-empty">No courses available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseMultiSelect;
