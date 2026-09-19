import { useAdminTheme } from "../../context/AdminThemeContext";
import "./Settings.css";

const MODE_OPTIONS = [
  {
    id: "light",
    label: "Light",
    description: "Bright surfaces for daytime use",
    icon: "bi-sun-fill",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Low-glare panels for long sessions",
    icon: "bi-moon-stars-fill",
  },
];

export default function Settings() {
  const { mode, accent, accents, setMode, setAccent } = useAdminTheme();

  return (
    <div className="admin-settings-page">
      <header className="admin-settings-header">
        <div>
          <h1 className="admin-settings-title">Settings</h1>
          <p className="admin-settings-subtitle">
            Customize the admin dashboard appearance. These options apply only here.
          </p>
        </div>
      </header>

      <section className="admin-settings-section" aria-labelledby="appearance-mode-heading">
        <div className="admin-settings-section-head">
          <h2 id="appearance-mode-heading">Appearance</h2>
          <p>Choose light or dark mode for the admin portal.</p>
        </div>

        <div className="admin-settings-mode-grid" role="radiogroup" aria-label="Color mode">
          {MODE_OPTIONS.map((option) => {
            const selected = mode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`admin-settings-mode-card ${selected ? "is-selected" : ""}`}
                onClick={() => setMode(option.id)}
              >
                <span className="admin-settings-mode-preview" data-mode={option.id} aria-hidden="true">
                  <i className={`bi ${option.icon}`} />
                </span>
                <span className="admin-settings-mode-copy">
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </span>
                {selected ? (
                  <i className="bi bi-check-circle-fill admin-settings-check" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="admin-settings-section" aria-labelledby="accent-heading">
        <div className="admin-settings-section-head">
          <h2 id="accent-heading">Color gradient</h2>
          <p>Pick an accent palette. Sidebar, buttons, and highlights update together.</p>
        </div>

        <div className="admin-settings-accent-grid" role="radiogroup" aria-label="Accent gradient">
          {accents.map((item) => {
            const selected = accent === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`admin-settings-accent-card ${selected ? "is-selected" : ""}`}
                onClick={() => setAccent(item.id)}
              >
                <span
                  className="admin-settings-accent-swatch"
                  style={{ background: item.gradient }}
                  aria-hidden="true"
                />
                <span className="admin-settings-accent-copy">
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </span>
                {selected ? (
                  <i className="bi bi-check-circle-fill admin-settings-check" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="admin-settings-preview" aria-label="Theme preview">
        <div
          className="admin-settings-preview-banner"
          style={{
            background: accents.find((a) => a.id === accent)?.gradient,
          }}
        >
          <p>Live preview</p>
          <strong>
            {mode === "dark" ? "Dark" : "Light"} ·{" "}
            {accents.find((a) => a.id === accent)?.label}
          </strong>
        </div>
      </section>
    </div>
  );
}
