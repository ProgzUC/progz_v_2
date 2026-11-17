import { useEffect, useId, useMemo, useRef, useState } from "react";
import "./AppSelect.css";

const SEARCH_THRESHOLD = 6;

/**
 * Themed select — replaces native <select> so option highlight uses app palette.
 * Auto-enables search when options exceed SEARCH_THRESHOLD (override with searchable).
 */
const AppSelect = ({
  value = "",
  onChange,
  options = [],
  placeholder,
  disabled = false,
  className = "",
  id,
  name,
  "aria-label": ariaLabel,
  icon,
  searchable,
  searchPlaceholder = "Search…",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();
  const triggerId = id || `${listId}-trigger`;

  const items = useMemo(() => {
    return (options || []).map((opt) => {
      if (opt == null) return { value: "", label: "" };
      if (typeof opt === "string" || typeof opt === "number") {
        return { value: String(opt), label: String(opt) };
      }
      return {
        value: String(opt.value ?? opt.id ?? ""),
        label: String(opt.label ?? opt.name ?? opt.value ?? ""),
        disabled: !!opt.disabled,
      };
    });
  }, [options]);

  const selectableCount = items.filter((item) => item.value !== "").length;
  const enableSearch =
    searchable === true || (searchable !== false && selectableCount >= SEARCH_THRESHOLD);

  const filtered = useMemo(() => {
    if (!enableSearch) return items;
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      if (item.value === "" && !item.label) return false;
      return item.label.toLowerCase().includes(q);
    });
  }, [items, query, enableSearch]);

  const selected = items.find((item) => item.value === String(value ?? "")) || null;
  const displayLabel = selected?.label || placeholder || "Select…";

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    if (enableSearch) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open, enableSearch]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, filtered]);

  const emitChange = (nextValue) => {
    if (typeof onChange !== "function") return;
    const fieldId = id || name || "";
    onChange({
      target: { value: nextValue, name: name || "", id: fieldId },
      currentTarget: { value: nextValue, name: name || "", id: fieldId },
    });
  };

  const pick = (item) => {
    if (!item || item.disabled) return;
    emitChange(item.value);
    setOpen(false);
    setQuery("");
  };

  const onSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) pick(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div
      className={`app-select ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""} ${icon ? "has-icon" : ""} ${enableSearch ? "is-searchable" : ""} ${className}`.trim()}
      ref={rootRef}
    >
      {icon ? (
        <i className={`bi ${icon} app-select-icon`} aria-hidden="true" />
      ) : null}

      <button
        type="button"
        id={triggerId}
        className="app-select-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span className={`app-select-value ${selected ? "" : "is-placeholder"}`}>
          {displayLabel}
        </span>
        <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"} app-select-chevron`} aria-hidden="true" />
      </button>

      {name ? <input type="hidden" name={name} value={value ?? ""} readOnly /> : null}

      {open ? (
        <div className="app-select-panel">
          {enableSearch ? (
            <div className="app-select-search">
              <i className="bi bi-search" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                className="app-select-search-input"
                value={query}
                placeholder={searchPlaceholder}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKeyDown}
                aria-label={searchPlaceholder}
                autoComplete="off"
              />
              {query ? (
                <button
                  type="button"
                  className="app-select-search-clear"
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
          ) : null}

          <ul id={listId} className="app-select-menu" role="listbox" aria-labelledby={triggerId} ref={listRef}>
            {filtered.length === 0 ? (
              <li className="app-select-empty" role="presentation">
                No matches
              </li>
            ) : (
              filtered.map((item, index) => {
                const isActive = String(value ?? "") === item.value;
                const isFocused = index === activeIndex;
                return (
                  <li key={`${item.value}::${item.label}`} role="presentation">
                    <button
                      type="button"
                      role="option"
                      data-index={index}
                      aria-selected={isActive}
                      disabled={item.disabled}
                      className={`app-select-option ${isActive ? "is-active" : ""} ${isFocused ? "is-focused" : ""}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => pick(item)}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default AppSelect;
