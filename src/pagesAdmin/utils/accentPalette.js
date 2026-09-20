/** Hex / RGB helpers for custom admin accents */

export function normalizeHex(value, fallback = "#064E3B") {
  const raw = String(value || "").trim();
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(raw);
  if (!m) return fallback;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return `#${h.toUpperCase()}`;
}

export function isValidHex(value) {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value || "").trim());
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function hexToRgb(hex) {
  const h = normalizeHex(hex).slice(1);
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function mix(a, b, t) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Build CSS custom properties for a custom accent pair.
 * @param {string} primaryHex deep / sidebar color
 * @param {string} brightHex bright / button highlight
 * @param {boolean} darkMode
 */
export function buildCustomAccentVars(primaryHex, brightHex, darkMode = false) {
  const primary = normalizeHex(primaryHex, "#064E3B");
  const bright = normalizeHex(brightHex, "#10B981");
  const p = hexToRgb(primary);
  const br = hexToRgb(bright);
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const gradient = `linear-gradient(135deg, ${primary} 0%, ${bright} 100%)`;

  if (!darkMode) {
    return {
      "--color-primary": primary,
      "--color-primary-hover": rgbToHex(mix(p, black, 0.14)),
      "--color-primary-active": rgbToHex(mix(p, black, 0.26)),
      "--color-primary-soft": rgbToHex(mix(br, white, 0.78)),
      "--color-primary-light": rgbToHex(mix(br, white, 0.9)),
      "--color-primary-muted": rgbToHex(mix(br, white, 0.4)),
      "--color-primary-bright": bright,
      "--color-primary-gradient": gradient,
      "--color-focus-ring": rgba(primary, 0.22),
      "--color-surface-dark": rgbToHex(mix(p, black, 0.12)),
      "--color-text-on-primary": "#FFFFFF",
      "--shadow-btn": `0 4px 14px ${rgba(bright, 0.28)}`,
      "--admin-primary": primary,
      "--admin-primary-bright": bright,
      "--admin-primary-light": rgbToHex(mix(br, white, 0.9)),
      "--admin-primary-soft": rgbToHex(mix(br, white, 0.78)),
      "--admin-primary-muted": rgbToHex(mix(br, white, 0.4)),
      "--admin-primary-hover": rgbToHex(mix(p, black, 0.14)),
      "--admin-primary-gradient": gradient,
    };
  }

  // Dark mode: lift bright tones for contrast on dark surfaces
  return {
    "--color-primary": bright,
    "--color-primary-hover": rgbToHex(mix(br, white, 0.22)),
    "--color-primary-active": primary,
    "--color-primary-soft": rgba(bright, 0.2),
    "--color-primary-light": rgba(bright, 0.12),
    "--color-primary-muted": rgbToHex(mix(br, white, 0.25)),
    "--color-primary-bright": bright,
    "--color-primary-gradient": gradient,
    "--color-focus-ring": rgba(bright, 0.4),
    "--color-surface-dark": "#0B0D14",
    "--color-text-on-primary": rgbToHex(mix(p, black, 0.35)),
    "--color-navbar-hover-bg": rgba(bright, 0.12),
    "--color-navbar-hover-text": bright,
    "--shadow-btn": `0 4px 14px ${rgba(bright, 0.3)}`,
    "--admin-primary": bright,
    "--admin-primary-bright": bright,
    "--admin-primary-light": rgba(bright, 0.12),
    "--admin-primary-soft": rgba(bright, 0.2),
    "--admin-primary-muted": rgbToHex(mix(br, white, 0.25)),
    "--admin-primary-hover": rgbToHex(mix(br, white, 0.22)),
    "--admin-primary-gradient": gradient,
  };
}

export function customAccentGradient(primaryHex, brightHex) {
  return `linear-gradient(135deg, ${normalizeHex(primaryHex)} 0%, ${normalizeHex(brightHex)} 100%)`;
}
