import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./PersonStack.css";

const AVATAR_TONES = ["green", "blue", "orange", "purple", "teal", "rose"];
const DEFAULT_MAX_VISIBLE = 3;
const TOOLTIP_GAP = 8;

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const toneForName = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % AVATAR_TONES.length;
  }
  return AVATAR_TONES[hash];
};

/**
 * Compact overlapping avatar stack + count for table cells.
 * Hover/focus shows full names in a tooltip (ported to body so table overflow does not clip it).
 */
const PersonStack = ({
  names = [],
  emptyLabel = "No instructors",
  singularLabel = "instructor",
  pluralLabel = "instructors",
  maxVisible = DEFAULT_MAX_VISIBLE,
}) => {
  const list = (names || []).map((n) => String(n || "").trim()).filter(Boolean);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const [positioned, setPositioned] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: "below" });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tip = tooltipRef.current;
    if (!trigger) return false;

    const rect = trigger.getBoundingClientRect();
    const tipHeight = tip?.offsetHeight || 120;
    const tipWidth = tip?.offsetWidth || 200;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement = spaceBelow < tipHeight + TOOLTIP_GAP ? "above" : "below";

    let top =
      placement === "below"
        ? rect.bottom + TOOLTIP_GAP
        : rect.top - tipHeight - TOOLTIP_GAP;
    let left = rect.left;

    const maxLeft = window.innerWidth - tipWidth - 8;
    left = Math.max(8, Math.min(left, maxLeft));
    top = Math.max(8, Math.min(top, window.innerHeight - tipHeight - 8));

    setCoords({ top, left, placement });
    return Boolean(tip);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPositioned(false);
      return undefined;
    }

    const ready = updatePosition();
    if (ready) setPositioned(true);

    const frame = requestAnimationFrame(() => {
      updatePosition();
      setPositioned(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [open, list.length, updatePosition]);

  useEffect(() => {
    if (!open) return undefined;

    const handleReposition = () => updatePosition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, updatePosition]);

  if (!list.length) {
    return <span className="person-stack-empty">{emptyLabel}</span>;
  }

  const label = `${list.length} ${list.length === 1 ? singularLabel : pluralLabel}`;
  const joined = list.join(", ");

  const tooltip = open
    ? createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          className={`person-stack-tooltip person-stack-tooltip--portal person-stack-tooltip--${coords.placement}${
            positioned ? " is-open" : ""
          }`}
          role="tooltip"
          style={{ top: coords.top, left: coords.left }}
        >
          {list.map((name, i) => (
            <div key={`${name}-tip-${i}`} className="person-stack-tooltip-row">
              <span
                className={`person-stack-avatar tone-${toneForName(name)}`}
                aria-hidden="true"
              >
                {getInitials(name)}
              </span>
              <span>{name}</span>
            </div>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <div
      ref={triggerRef}
      className="person-stack"
      tabIndex={0}
      title={joined}
      aria-label={joined}
      aria-describedby={open ? tooltipId : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <div className="person-stack-avatars" aria-hidden="true">
        {list.slice(0, maxVisible).map((name, i) => (
          <span
            key={`${name}-${i}`}
            className={`person-stack-avatar tone-${toneForName(name)}`}
            style={{ zIndex: maxVisible - i }}
          >
            {getInitials(name)}
          </span>
        ))}
        {list.length > maxVisible && (
          <span className="person-stack-avatar person-stack-avatar-more">
            +{list.length - maxVisible}
          </span>
        )}
      </div>
      <span className="person-stack-count">{label}</span>
      {tooltip}
    </div>
  );
};

export default PersonStack;
