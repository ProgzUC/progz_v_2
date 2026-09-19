import React from "react";
import "./PersonStack.css";

const AVATAR_TONES = ["green", "blue", "orange", "purple", "teal", "rose"];
const DEFAULT_MAX_VISIBLE = 3;

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
 * Hover/focus shows full names in a tooltip.
 */
const PersonStack = ({
  names = [],
  emptyLabel = "No instructors",
  singularLabel = "instructor",
  pluralLabel = "instructors",
  maxVisible = DEFAULT_MAX_VISIBLE,
}) => {
  const list = (names || []).map((n) => String(n || "").trim()).filter(Boolean);

  if (!list.length) {
    return <span className="person-stack-empty">{emptyLabel}</span>;
  }

  const label = `${list.length} ${list.length === 1 ? singularLabel : pluralLabel}`;
  const joined = list.join(", ");

  return (
    <div
      className="person-stack"
      tabIndex={0}
      title={joined}
      aria-label={joined}
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
      <div className="person-stack-tooltip" role="tooltip">
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
      </div>
    </div>
  );
};

export default PersonStack;
