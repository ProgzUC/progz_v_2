import "./ModuleNavigator.css";

export default function ModuleNavigator({
  modules,
  activeIndex,
  onSelect,
}) {
  if (!modules?.length) return null;

  return (
    <div className="module-navigator">
      <span className="module-navigator-label">Jump to:</span>
      <div className="module-navigator-list">
        {modules.map((mod, index) => {
          const label = mod.title?.trim()
            ? mod.title.length > 18
              ? `${mod.title.slice(0, 18)}…`
              : mod.title
            : `Module ${index + 1}`;

          return (
            <button
              key={mod.id}
              type="button"
              className={`module-nav-chip ${activeIndex === index ? "active" : ""}`}
              onClick={() => onSelect(index)}
              title={mod.title?.trim() || `Module ${index + 1}`}
            >
              <span className="module-nav-num">{index + 1}</span>
              <span className="module-nav-text">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
