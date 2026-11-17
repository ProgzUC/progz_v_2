import React, { useEffect, useMemo, useRef, useState } from "react";
import "./CourseMultiSelect.css";

const CourseMultiSelect = ({
  coursesList = [],
  selectedIds = [],
  onToggle,
  onToggleAll,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);

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

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coursesList;
    return coursesList.filter((c) =>
      String(c.courseName || "").toLowerCase().includes(q)
    );
  }, [coursesList, query]);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };

    const handleEscape = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      e.preventDefault();
      setOpen(false);
      setQuery("");
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    requestAnimationFrame(() => searchRef.current?.focus());
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
          <div className="course-multi-select-search">
            <i className="bi bi-search" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              className="course-multi-select-search-input"
              placeholder="Search courses…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search courses"
              autoComplete="off"
            />
            {query ? (
              <button
                type="button"
                className="course-multi-select-search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
              >
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="course-multi-select-list">
            {!query.trim() ? (
              <label className="course-multi-select-option all">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                />
                <span>(all)</span>
              </label>
            ) : null}

            {filteredCourses.map((c) => {
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

            {filteredCourses.length === 0 && (
              <div className="course-multi-select-empty">
                {coursesList.length === 0 ? "No courses available" : "No matching courses"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseMultiSelect;
