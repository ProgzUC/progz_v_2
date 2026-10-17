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

  const selectedCourses = coursesList.filter((c) =>
    selectedSet.has(String(c._id))
  );
  const visibleChips = selectedCourses.slice(0, 2);
  const extraCount = Math.max(0, selectedCourses.length - visibleChips.length);

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
        <span
          className={`course-multi-select-text ${
            selectedCourses.length ? "" : "placeholder"
          }`}
        >
          {selectedCourses.length === 0 ? (
            "Select courses…"
          ) : (
            <>
              {visibleChips.map((c) => (
                <span key={String(c._id)} className="course-multi-select-chip">
                  {c.courseName}
                </span>
              ))}
              {extraCount > 0 ? (
                <span className="course-multi-select-chip more">+{extraCount} more</span>
              ) : null}
            </>
          )}
        </span>
        <i
          className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"} course-multi-select-chevron`}
          aria-hidden="true"
        />
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
