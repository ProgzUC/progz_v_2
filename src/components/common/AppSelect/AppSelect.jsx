import { useEffect, useId, useMemo, useRef, useState } from "react";
import "./AppSelect.css";

/**
 * Themed select — replaces native <select> so option highlight uses app palette
 * (Windows/Chrome native dropdowns cannot restyle the blue OS highlight).
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
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
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

  const selected = items.find((item) => item.value === String(value ?? "")) || null;
  const displayLabel = selected?.label || placeholder || "Select…";

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const emitChange = (nextValue) => {
    if (typeof onChange !== "function") return;
    const fieldId = id || name || "";
    onChange({
      target: { value: nextValue, name: name || "", id: fieldId },
      currentTarget: { value: nextValue, name: name || "", id: fieldId },
    });
  };

  const pick = (item) => {
    if (item.disabled) return;
    emitChange(item.value);
    setOpen(false);
  };

  return (
    <div
      className={`app-select ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""} ${icon ? "has-icon" : ""} ${className}`.trim()}
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
        <ul id={listId} className="app-select-menu" role="listbox" aria-labelledby={triggerId}>
          {items.map((item) => {
            const isActive = String(value ?? "") === item.value;
            return (
              <li key={`${item.value}::${item.label}`} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  disabled={item.disabled}
                  className={`app-select-option ${isActive ? "is-active" : ""}`}
                  onClick={() => pick(item)}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};

export default AppSelect;
