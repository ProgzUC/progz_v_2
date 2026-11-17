import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import "./StudentCombobox.css";

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const highlightMatch = (text = "", query = "") => {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="student-combo-mark">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
};

/**
 * Searchable student picker — connected search + results panel.
 */
const StudentCombobox = ({
  students = [],
  value = "",
  onChange,
  placeholder = "Search by name or email…",
  disabled = false,
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  const selected = useMemo(
    () => students.find((s) => String(s._id) === String(value)) || null,
    [students, value]
  );

  const showSelected = Boolean(selected && !open);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const hay = `${s.name || ""} ${s.email || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [students, query]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const commit = (student) => {
    if (!student) return;
    onChange?.(student._id);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const openMenu = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange?.("");
    openMenu();
  };

  const onKeyDown = (e) => {
    if (disabled) return;

    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openMenu();
      return;
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) commit(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div
      className={`student-combo ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""} ${showSelected ? "has-value" : ""}`}
      ref={rootRef}
    >
      {showSelected ? (
        <div className="student-combo-selected">
          <button
            type="button"
            className="student-combo-selected-main"
            onClick={openMenu}
            onKeyDown={onKeyDown}
            disabled={disabled}
            aria-label={`Selected ${selected.name}. Change student`}
          >
            <span className="student-combo-avatar is-solid" aria-hidden="true">
              {getInitials(selected.name)}
            </span>
            <span className="student-combo-selected-text">
              <span className="student-combo-selected-name">{selected.name}</span>
              <span className="student-combo-selected-email">{selected.email}</span>
            </span>
          </button>
          <button
            type="button"
            className="student-combo-clear"
            aria-label="Clear selection"
            onClick={clearSelection}
          >
            <i className="bi bi-x" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className={`student-combo-shell ${open ? "is-open" : ""}`}>
          <div className="student-combo-search">
            <i className="bi bi-search student-combo-search-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              id={id}
              type="text"
              className="student-combo-input"
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                open && filtered[activeIndex]
                  ? `${listId}-opt-${filtered[activeIndex]._id}`
                  : undefined
              }
              disabled={disabled}
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              autoComplete="off"
            />
            {query ? (
              <button
                type="button"
                className="student-combo-clear"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
              >
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          {open ? (
            <div className="student-combo-panel">
              <div className="student-combo-panel-meta">
                {filtered.length === 0
                  ? "No matches"
                  : query.trim()
                    ? `${filtered.length} match${filtered.length === 1 ? "" : "es"}`
                    : `${students.length} student${students.length === 1 ? "" : "s"}`}
              </div>
              <div className="student-combo-menu" id={listId} role="listbox" ref={listRef}>
                {filtered.length === 0 ? (
                  <div className="student-combo-empty">
                    <i className="bi bi-person-x" aria-hidden="true" />
                    <span>No students match “{query.trim()}”</span>
                    <button
                      type="button"
                      className="student-combo-empty-clear"
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  filtered.map((s, index) => {
                    const isActive = index === activeIndex;
                    const isSelected = String(s._id) === String(value);
                    return (
                      <button
                        key={s._id}
                        type="button"
                        id={`${listId}-opt-${s._id}`}
                        role="option"
                        data-index={index}
                        aria-selected={isSelected}
                        className={`student-combo-option ${isActive ? "is-active" : ""} ${isSelected ? "is-selected" : ""}`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          commit(s);
                        }}
                      >
                        <span className={`student-combo-avatar ${isSelected ? "is-solid" : ""}`} aria-hidden="true">
                          {getInitials(s.name)}
                        </span>
                        <span className="student-combo-option-text">
                          <span className="student-combo-option-name">
                            {highlightMatch(s.name || "", query)}
                          </span>
                          <span className="student-combo-option-email">
                            {highlightMatch(s.email || "", query)}
                          </span>
                        </span>
                        {isSelected ? (
                          <i className="bi bi-check-lg student-combo-check" aria-hidden="true" />
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default StudentCombobox;
