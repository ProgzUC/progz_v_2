import { useEffect, useMemo, useState } from "react";
import { useAdminTheme } from "../../context/AdminThemeContext";
import { useAdminDashboard } from "../../../hooks/useAdminStats";
import { useOperationalSummary } from "../../../hooks/useReports";
import "./Settings.css";

const NAV_GROUPS = [
  {
    id: "look",
    label: "Look and feel",
    items: [
      { id: "appearance", label: "Appearance", icon: "bi-palette2", desc: "Theme, accent, layout" },
      { id: "branding", label: "Branding", icon: "bi-award", desc: "Academy name and logo" },
      { id: "announcements", label: "Announcements", icon: "bi-megaphone", desc: "Portal-wide notices" },
    ],
  },
  {
    id: "learning",
    label: "Learning",
    items: [
      { id: "defaults", label: "Batch and course defaults", icon: "bi-sliders", desc: "Starting rules for new batches" },
      { id: "notifications", label: "Notifications", icon: "bi-bell", desc: "Email and in-app alerts" },
    ],
  },
];

const MODE_OPTIONS = [
  { id: "light", label: "Light", description: "Bright surfaces for daytime", icon: "bi-sun-fill" },
  { id: "dark", label: "Dark", description: "Low-glare panels for long sessions", icon: "bi-moon-stars-fill" },
  { id: "system", label: "Match device", description: "Follows your OS setting", icon: "bi-laptop" },
];

const CORNER_OPTIONS = [
  { id: "sharp", label: "Sharp" },
  { id: "rounded", label: "Rounded" },
  { id: "soft", label: "Soft" },
];

const DENSITY_OPTIONS = [
  { id: "comfortable", label: "Comfortable" },
  { id: "compact", label: "Compact" },
];

const AUDIENCE_OPTIONS = [
  { id: "all", label: "Everyone" },
  { id: "trainers", label: "Trainers" },
  { id: "students", label: "Students" },
];

function ThemePreview({ mode, resolvedMode, accent, accents, accentGradient }) {
  const { stats, isLoading } = useAdminDashboard();
  const { data: ops } = useOperationalSummary();
  const preset = accents.find((a) => a.id === accent);
  const gradient = accentGradient || preset?.gradient;
  const label = mode === "system" ? "System" : mode === "dark" ? "Dark" : "Light";
  const accentLabel = accent === "custom" ? "Custom" : preset?.label;

  const students = stats?.students ?? 0;
  const batches = stats?.totalBatches ?? stats?.batches ?? 0;
  const attendance =
    ops?.totalSessionsConducted > 0 ? `${ops.overallAttendanceRate ?? 0}%` : "—";

  const previewStats = [
    { name: "Students", value: isLoading ? "…" : students },
    { name: "Batches", value: isLoading ? "…" : batches },
    { name: "Attendance", value: isLoading ? "…" : attendance },
  ];

  return (
    <div className={`as-preview ${resolvedMode === "dark" ? "is-dark" : ""}`}>
      <div className="as-preview-top">
        <span>Live preview</span>
        <strong>
          {label} · {accentLabel}
        </strong>
      </div>
      <div className="as-preview-board">
        <div className="as-preview-stats">
          {previewStats.map((item) => (
            <div key={item.name} className="as-preview-stat">
              <em>{item.name}</em>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
        <div className="as-preview-chart" style={{ background: gradient }} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="as-toggle-row">
      <span>
        <strong>{label}</strong>
        {description ? <em>{description}</em> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`as-switch ${checked ? "is-on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </label>
  );
}

function AppearancePanel() {
  const {
    mode,
    resolvedMode,
    accent,
    accents,
    accentGradient,
    customPrimary,
    customBright,
    corners,
    density,
    setMode,
    setAccent,
    setCustomAccent,
    setCorners,
    setDensity,
  } = useAdminTheme();

  return (
    <div className="as-panel-stack">
      <ThemePreview
        mode={mode}
        resolvedMode={resolvedMode}
        accent={accent}
        accents={accents}
        accentGradient={accentGradient}
      />

      <section className="as-block">
        <header className="as-block-head">
          <h2>Mode</h2>
          <p>Choose how the admin portal looks during the day and night.</p>
        </header>
        <div className="as-mode-grid" role="radiogroup" aria-label="Color mode">
          {MODE_OPTIONS.map((option) => {
            const selected = mode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`as-choice-card ${selected ? "is-selected" : ""}`}
                onClick={() => setMode(option.id)}
              >
                <span className="as-choice-icon" data-mode={option.id}>
                  <i className={`bi ${option.icon}`} aria-hidden="true" />
                </span>
                <span className="as-choice-copy">
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </span>
                {selected ? <i className="bi bi-check-circle-fill as-check" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="as-block">
        <header className="as-block-head">
          <h2>Accent colour</h2>
          <p>Pick a preset, or build your own with two colours.</p>
        </header>
        <div className="as-accent-grid" role="radiogroup" aria-label="Accent colour">
          {accents.map((item) => {
            const selected = accent === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`as-choice-card as-accent-card ${selected ? "is-selected" : ""}`}
                onClick={() => setAccent(item.id)}
              >
                <span className="as-swatch" style={{ background: item.gradient }} aria-hidden="true" />
                <span className="as-choice-copy">
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </span>
                {selected ? <i className="bi bi-check-circle-fill as-check" aria-hidden="true" /> : null}
              </button>
            );
          })}

          <button
            type="button"
            role="radio"
            aria-checked={accent === "custom"}
            className={`as-choice-card as-accent-card ${accent === "custom" ? "is-selected" : ""}`}
            onClick={() => setCustomAccent(customPrimary, customBright)}
          >
            <span
              className="as-swatch"
              style={{ background: accentGradient }}
              aria-hidden="true"
            />
            <span className="as-choice-copy">
              <strong>Custom</strong>
              <span>Your own primary + bright colours</span>
            </span>
            {accent === "custom" ? (
              <i className="bi bi-check-circle-fill as-check" aria-hidden="true" />
            ) : null}
          </button>
        </div>

        {accent === "custom" ? (
          <div className="as-custom-accent">
            <label className="as-color-field">
              <span>Deep / sidebar</span>
              <div className="as-color-row">
                <input
                  type="color"
                  value={customPrimary}
                  onChange={(e) => setCustomAccent(e.target.value, customBright)}
                  aria-label="Deep accent colour"
                />
                <input
                  type="text"
                  defaultValue={customPrimary}
                  key={`p-${customPrimary}`}
                  onBlur={(e) => setCustomAccent(e.target.value, customBright)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  spellCheck={false}
                  aria-label="Deep accent hex"
                />
              </div>
            </label>
            <label className="as-color-field">
              <span>Bright / buttons</span>
              <div className="as-color-row">
                <input
                  type="color"
                  value={customBright}
                  onChange={(e) => setCustomAccent(customPrimary, e.target.value)}
                  aria-label="Bright accent colour"
                />
                <input
                  type="text"
                  defaultValue={customBright}
                  key={`b-${customBright}`}
                  onBlur={(e) => setCustomAccent(customPrimary, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  spellCheck={false}
                  aria-label="Bright accent hex"
                />
              </div>
            </label>
            <div className="as-custom-preview" aria-hidden="true">
              <span className="as-custom-preview-bar" style={{ background: accentGradient }} />
              <em>Soft shades generate automatically for the whole admin UI.</em>
            </div>
          </div>
        ) : null}
      </section>

      <section className="as-block">
        <header className="as-block-head">
          <h2>Layout feel</h2>
          <p>Tune corners and spacing across the admin UI.</p>
        </header>
        <div className="as-segment-row">
          <span className="as-segment-label">Corners</span>
          <div className="as-segment" role="radiogroup" aria-label="Corner style">
            {CORNER_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={corners === option.id}
                className={corners === option.id ? "is-selected" : ""}
                onClick={() => setCorners(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="as-segment-row">
          <span className="as-segment-label">Density</span>
          <div className="as-segment" role="radiogroup" aria-label="Density">
            {DENSITY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={density === option.id}
                className={density === option.id ? "is-selected" : ""}
                onClick={() => setDensity(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function BrandingPanel() {
  const { branding, setBranding } = useAdminTheme();
  const [draft, setDraft] = useState(() => ({ ...branding }));
  const [dirty, setDirty] = useState(false);

  // Keep draft in sync if branding changes elsewhere (e.g. after save from another tab)
  useEffect(() => {
    if (!dirty) setDraft({ ...branding });
  }, [branding, dirty]);

  const patchDraft = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const onLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      patchDraft({ logoDataUrl: String(reader.result || "") });
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const saveChanges = () => {
    const next = {
      academyName: (draft.academyName || "").trim() || "ProgZ Academy",
      tagline: (draft.tagline || "").trim() || "Learn. Build. Grow.",
      supportEmail: (draft.supportEmail || "").trim(),
      logoDataUrl: draft.logoDataUrl || "",
    };
    setBranding(next);
    setDraft(next);
    setDirty(false);
    import("../../../utils/toast").then(({ showSuccess }) => {
      showSuccess("Branding saved — sidebar updated");
    });
  };

  const discardChanges = () => {
    setDraft({ ...branding });
    setDirty(false);
  };

  return (
    <div className="as-panel-stack">
      <section className="as-block">
        <header className="as-block-head">
          <h2>Academy identity</h2>
          <p>Shown in the admin sidebar after you save.</p>
        </header>
        <div className="as-form-grid">
          <label className="as-field">
            <span>Academy name</span>
            <input
              value={draft.academyName}
              onChange={(e) => patchDraft({ academyName: e.target.value })}
              placeholder="ProgZ Academy"
            />
          </label>
          <label className="as-field">
            <span>Tagline</span>
            <input
              value={draft.tagline}
              onChange={(e) => patchDraft({ tagline: e.target.value })}
              placeholder="Learn. Build. Grow."
            />
          </label>
          <label className="as-field as-field-wide">
            <span>Support email</span>
            <input
              type="email"
              value={draft.supportEmail}
              onChange={(e) => patchDraft({ supportEmail: e.target.value })}
              placeholder="support@youracademy.com"
            />
          </label>
        </div>
      </section>

      <section className="as-block">
        <header className="as-block-head">
          <h2>Logo</h2>
          <p>Optional mark for the admin sidebar header.</p>
        </header>
        <div className="as-logo-row">
          <div className="as-logo-preview" aria-hidden="true">
            {draft.logoDataUrl ? (
              <img src={draft.logoDataUrl} alt="" />
            ) : (
              <i className="bi bi-image" />
            )}
          </div>
          <div className="as-logo-actions">
            <label className="as-btn as-btn-primary">
              Upload logo
              <input type="file" accept="image/*" hidden onChange={onLogoChange} />
            </label>
            {draft.logoDataUrl ? (
              <button type="button" className="as-btn" onClick={() => patchDraft({ logoDataUrl: "" })}>
                Remove
              </button>
            ) : null}
            <p>PNG or SVG works best. Keep it simple and square.</p>
          </div>
        </div>
      </section>

      <section className="as-block as-brand-preview-block">
        <header className="as-block-head">
          <h2>Sidebar preview</h2>
          <p>How the brand will look after save.</p>
        </header>
        <div className="as-brand-preview">
          <div className="as-brand-preview-mark">
            {draft.logoDataUrl ? (
              <img src={draft.logoDataUrl} alt="" />
            ) : (
              <img src="/admin/logo.png" alt="" />
            )}
          </div>
          <div>
            <strong>{draft.academyName || "ProgZ Academy"}</strong>
            <span>{draft.tagline || "Learn. Build. Grow."}</span>
          </div>
        </div>
      </section>

      <div className="as-save-bar">
        {dirty ? <span className="as-save-hint">Unsaved changes</span> : <span className="as-save-hint is-clean">All changes saved</span>}
        <div className="as-save-actions">
          <button type="button" className="as-btn" onClick={discardChanges} disabled={!dirty}>
            Discard
          </button>
          <button type="button" className="as-btn as-btn-primary" onClick={saveChanges} disabled={!dirty}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function AnnouncementsPanel() {
  const {
    announcements,
    addAnnouncement,
    updateAnnouncement,
    removeAnnouncement,
    prefs,
    setPrefs,
  } = useAdminTheme();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [email, setEmail] = useState(prefs.lastAnnouncementEmail || "");

  const publish = () => {
    if (!title.trim()) return;
    if (!email.trim()) {
      import("../../../utils/toast").then(({ showError }) => {
        showError("Add an email address before publishing");
      });
      return;
    }

    addAnnouncement({
      title,
      body,
      audience,
      active: true,
      email: email.trim(),
      emailSent: false,
    });

    setPrefs({ lastAnnouncementEmail: email.trim() });
    setTitle("");
    setBody("");
    setAudience("all");

    import("../../../utils/toast").then(({ showSuccess }) => {
      showSuccess("Announcement saved (email send will be wired after Brevo setup)");
    });
  };

  return (
    <div className="as-panel-stack">
      <section className="as-block">
        <header className="as-block-head">
          <h2>New announcement</h2>
          <p>Compose a notice and set the email recipient. Sending will be enabled after Brevo is configured.</p>
        </header>
        <div className="as-form-grid">
          <label className="as-field as-field-wide">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Holiday schedule update" />
          </label>
          <label className="as-field as-field-wide">
            <span>Message</span>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share what people need to know…"
            />
          </label>
          <label className="as-field">
            <span>Audience</span>
            <select value={audience} onChange={(e) => setAudience(e.target.value)}>
              {AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="as-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@email.com"
              autoComplete="email"
            />
          </label>
        </div>
        <p className="as-help">
          UI only for now — Publish saves the announcement. Live email delivery comes after your team sets up Brevo.
        </p>
        <div className="as-block-actions">
          <button
            type="button"
            className="as-btn as-btn-primary"
            onClick={publish}
            disabled={!title.trim() || !email.trim()}
          >
            Publish announcement
          </button>
        </div>
      </section>

      <section className="as-block">
        <header className="as-block-head">
          <h2>Published</h2>
          <p>{announcements.length} announcement{announcements.length === 1 ? "" : "s"}</p>
        </header>
        {announcements.length === 0 ? (
          <div className="as-empty">No announcements yet. Publish one above.</div>
        ) : (
          <ul className="as-announce-list">
            {announcements.map((item) => (
              <li key={item.id} className={`as-announce-item ${item.active ? "" : "is-off"}`}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.body || "No message body"}</p>
                  <span>
                    {AUDIENCE_OPTIONS.find((a) => a.id === item.audience)?.label || "Everyone"} ·{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
                    {item.email ? ` · ${item.email}` : ""}
                    {item.emailSent ? " · sent" : " · draft saved"}
                  </span>
                </div>
                <div className="as-announce-actions">
                  <button
                    type="button"
                    className="as-btn"
                    onClick={() => updateAnnouncement(item.id, { active: !item.active })}
                  >
                    {item.active ? "Pause" : "Activate"}
                  </button>
                  <button type="button" className="as-btn as-btn-danger" onClick={() => removeAnnouncement(item.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DefaultsPanel() {
  const { prefs, setPrefs } = useAdminTheme();
  const [draft, setDraft] = useState(() => ({
    defaultBatchDurationMonths: prefs.defaultBatchDurationMonths,
    requireAttendance: prefs.requireAttendance,
    allowSelfEnroll: prefs.allowSelfEnroll,
  }));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (dirty) return;
    setDraft({
      defaultBatchDurationMonths: prefs.defaultBatchDurationMonths,
      requireAttendance: prefs.requireAttendance,
      allowSelfEnroll: prefs.allowSelfEnroll,
    });
  }, [prefs, dirty]);

  const patchDraft = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const saveChanges = () => {
    const next = {
      defaultBatchDurationMonths: Math.max(1, Math.min(24, Number(draft.defaultBatchDurationMonths) || 1)),
      requireAttendance: Boolean(draft.requireAttendance),
      allowSelfEnroll: Boolean(draft.allowSelfEnroll),
    };
    setPrefs(next);
    setDraft(next);
    setDirty(false);
    import("../../../utils/toast").then(({ showSuccess }) => {
      showSuccess("Defaults saved");
    });
  };

  const discardChanges = () => {
    setDraft({
      defaultBatchDurationMonths: prefs.defaultBatchDurationMonths,
      requireAttendance: prefs.requireAttendance,
      allowSelfEnroll: prefs.allowSelfEnroll,
    });
    setDirty(false);
  };

  return (
    <div className="as-panel-stack">
      <section className="as-block">
        <header className="as-block-head">
          <h2>New batch defaults</h2>
          <p>Applied when you create batches from the admin portal.</p>
        </header>
        <label className="as-field">
          <span>Default batch duration (months)</span>
          <input
            type="number"
            min={1}
            max={24}
            value={draft.defaultBatchDurationMonths}
            onChange={(e) =>
              patchDraft({ defaultBatchDurationMonths: Math.max(1, Number(e.target.value) || 1) })
            }
          />
        </label>
      </section>

      <section className="as-block">
        <header className="as-block-head">
          <h2>Enrollment rules</h2>
          <p>Starting behaviour for new batches and courses.</p>
        </header>
        <div className="as-toggle-list">
          <Toggle
            checked={draft.requireAttendance}
            onChange={(v) => patchDraft({ requireAttendance: v })}
            label="Require attendance tracking"
            description="New batches start with attendance enabled"
          />
          <Toggle
            checked={draft.allowSelfEnroll}
            onChange={(v) => patchDraft({ allowSelfEnroll: v })}
            label="Allow student self-enroll"
            description="Students can join open batches without admin enroll"
          />
        </div>
      </section>

      <div className="as-save-bar">
        {dirty ? (
          <span className="as-save-hint">Unsaved changes</span>
        ) : (
          <span className="as-save-hint is-clean">All changes saved</span>
        )}
        <div className="as-save-actions">
          <button type="button" className="as-btn" onClick={discardChanges} disabled={!dirty}>
            Discard
          </button>
          <button type="button" className="as-btn as-btn-primary" onClick={saveChanges} disabled={!dirty}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsPanel() {
  const { prefs, setPrefs } = useAdminTheme();
  const [draft, setDraft] = useState(() => ({
    emailDigest: prefs.emailDigest,
    batchReminders: prefs.batchReminders,
    approvalAlerts: prefs.approvalAlerts,
  }));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (dirty) return;
    setDraft({
      emailDigest: prefs.emailDigest,
      batchReminders: prefs.batchReminders,
      approvalAlerts: prefs.approvalAlerts,
    });
  }, [prefs, dirty]);

  const patchDraft = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const saveChanges = () => {
    const next = {
      emailDigest: Boolean(draft.emailDigest),
      batchReminders: Boolean(draft.batchReminders),
      approvalAlerts: Boolean(draft.approvalAlerts),
    };
    setPrefs(next);
    setDraft(next);
    setDirty(false);
    import("../../../utils/toast").then(({ showSuccess }) => {
      showSuccess("Notification preferences saved");
    });
  };

  const discardChanges = () => {
    setDraft({
      emailDigest: prefs.emailDigest,
      batchReminders: prefs.batchReminders,
      approvalAlerts: prefs.approvalAlerts,
    });
    setDirty(false);
  };

  return (
    <div className="as-panel-stack">
      <section className="as-block">
        <header className="as-block-head">
          <h2>Alert preferences</h2>
          <p>Choose which admin alerts you want to receive.</p>
        </header>
        <div className="as-toggle-list">
          <Toggle
            checked={draft.emailDigest}
            onChange={(v) => patchDraft({ emailDigest: v })}
            label="Weekly email digest"
            description="Summary of enrollments and batch activity"
          />
          <Toggle
            checked={draft.batchReminders}
            onChange={(v) => patchDraft({ batchReminders: v })}
            label="Batch reminders"
            description="Upcoming class and schedule nudges"
          />
          <Toggle
            checked={draft.approvalAlerts}
            onChange={(v) => patchDraft({ approvalAlerts: v })}
            label="Approval alerts"
            description="Notify when a new user needs review"
          />
        </div>
      </section>

      <div className="as-save-bar">
        {dirty ? (
          <span className="as-save-hint">Unsaved changes</span>
        ) : (
          <span className="as-save-hint is-clean">All changes saved</span>
        )}
        <div className="as-save-actions">
          <button type="button" className="as-btn" onClick={discardChanges} disabled={!dirty}>
            Discard
          </button>
          <button type="button" className="as-btn as-btn-primary" onClick={saveChanges} disabled={!dirty}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

const PANELS = {
  appearance: AppearancePanel,
  branding: BrandingPanel,
  announcements: AnnouncementsPanel,
  defaults: DefaultsPanel,
  notifications: NotificationsPanel,
};

const TITLES = {
  appearance: ["Appearance", "Theme, accent colour, and layout feel"],
  branding: ["Branding", "Academy name, tagline, and logo"],
  announcements: ["Announcements", "Portal-wide notices for trainers and students"],
  defaults: ["Batch and course defaults", "Starting rules for new batches"],
  notifications: ["Notifications", "Email and alert preferences"],
};

export default function Settings() {
  const [active, setActive] = useState("appearance");
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_GROUPS;
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q)
      ),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  const Panel = PANELS[active] || AppearancePanel;
  const [title, subtitle] = TITLES[active] || TITLES.appearance;

  return (
    <div className="admin-settings-shell">
      <aside className="as-nav" aria-label="Settings sections">
        <header className="as-nav-head">
          <h1>Settings</h1>
        </header>

        <nav className="as-nav-groups">
          {filteredGroups.map((group) => (
            <div key={group.id} className="as-nav-group">
              <p className="as-nav-group-label">{group.label}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`as-nav-item ${active === item.id ? "is-active" : ""}`}
                      onClick={() => setActive(item.id)}
                    >
                      <i className={`bi ${item.icon}`} aria-hidden="true" />
                      <span>
                        <strong>{item.label}</strong>
                        <em>{item.desc}</em>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <section className="as-main">
        <header className="as-main-top">
          <label className="as-search">
            <i className="bi bi-search" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search settings"
              aria-label="Search settings"
            />
          </label>
        </header>

        <div className="as-main-title">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <Panel />
      </section>
    </div>
  );
}
