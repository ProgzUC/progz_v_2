import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildCustomAccentVars,
  customAccentGradient,
  isValidHex,
  normalizeHex,
} from "../utils/accentPalette";

const STORAGE_KEY = "progz-admin-theme";
const BRANDING_KEY = "progz-admin-branding";
const ANNOUNCEMENTS_KEY = "progz-admin-announcements";
const PREFS_KEY = "progz-admin-prefs";

export const ADMIN_ACCENTS = [
  {
    id: "emerald",
    label: "Emerald",
    description: "Default ProgZ green",
    gradient: "linear-gradient(135deg, #064E3B 0%, #10B981 100%)",
    swatch: ["#064E3B", "#10B981"],
  },
  {
    id: "ocean",
    label: "Ocean",
    description: "Cool blue tones",
    gradient: "linear-gradient(135deg, #0C4A6E 0%, #0EA5E9 100%)",
    swatch: ["#0C4A6E", "#0EA5E9"],
  },
  {
    id: "violet",
    label: "Violet",
    description: "Soft purple glow",
    gradient: "linear-gradient(135deg, #4C1D95 0%, #8B5CF6 100%)",
    swatch: ["#4C1D95", "#8B5CF6"],
  },
  {
    id: "sunset",
    label: "Sunset",
    description: "Warm orange energy",
    gradient: "linear-gradient(135deg, #9A3412 0%, #F97316 100%)",
    swatch: ["#9A3412", "#F97316"],
  },
  {
    id: "rose",
    label: "Rose",
    description: "Bold pink accent",
    gradient: "linear-gradient(135deg, #9F1239 0%, #F43F5E 100%)",
    swatch: ["#9F1239", "#F43F5E"],
  },
  {
    id: "slate",
    label: "Slate",
    description: "Neutral charcoal",
    gradient: "linear-gradient(135deg, #1E293B 0%, #64748B 100%)",
    swatch: ["#1E293B", "#64748B"],
  },
];

const ACCENT_IDS = new Set(ADMIN_ACCENTS.map((a) => a.id));
const MODE_IDS = new Set(["light", "dark", "system"]);
const CORNER_IDS = new Set(["sharp", "rounded", "soft"]);
const DENSITY_IDS = new Set(["comfortable", "compact"]);

const DEFAULT_CUSTOM = {
  primary: "#064E3B",
  bright: "#10B981",
};

const readJson = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

const getInitialTheme = () => {
  const parsed = readJson(STORAGE_KEY, {
    mode: "light",
    accent: "emerald",
    corners: "rounded",
    density: "comfortable",
    customPrimary: DEFAULT_CUSTOM.primary,
    customBright: DEFAULT_CUSTOM.bright,
  });
  const accentOk =
    ACCENT_IDS.has(parsed.accent) || parsed.accent === "custom"
      ? parsed.accent
      : "emerald";
  return {
    mode: MODE_IDS.has(parsed.mode) ? parsed.mode : "light",
    accent: accentOk,
    corners: CORNER_IDS.has(parsed.corners) ? parsed.corners : "rounded",
    density: DENSITY_IDS.has(parsed.density) ? parsed.density : "comfortable",
    customPrimary: isValidHex(parsed.customPrimary)
      ? normalizeHex(parsed.customPrimary)
      : DEFAULT_CUSTOM.primary,
    customBright: isValidHex(parsed.customBright)
      ? normalizeHex(parsed.customBright)
      : DEFAULT_CUSTOM.bright,
  };
};

const defaultBranding = {
  academyName: "ProgZ Academy",
  tagline: "Learn. Build. Grow.",
  supportEmail: "",
  logoDataUrl: "",
};

const defaultPrefs = {
  emailDigest: true,
  batchReminders: true,
  approvalAlerts: true,
  defaultBatchDurationMonths: 3,
  requireAttendance: true,
  allowSelfEnroll: false,
  lastAnnouncementEmail: "",
};

const resolveMode = (mode) => {
  if (mode !== "system") return mode === "dark" ? "dark" : "light";
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const AdminThemeContext = createContext(null);

export const AdminThemeProvider = ({ children }) => {
  const [settings, setSettings] = useState(getInitialTheme);
  const [branding, setBrandingState] = useState(() =>
    readJson(BRANDING_KEY, defaultBranding)
  );
  const [announcements, setAnnouncementsState] = useState(() =>
    readJson(ANNOUNCEMENTS_KEY, { items: [] })
  );
  const [prefs, setPrefsState] = useState(() => readJson(PREFS_KEY, defaultPrefs));
  const [resolvedMode, setResolvedMode] = useState(() => resolveMode(getInitialTheme().mode));

  useEffect(() => {
    writeJson(STORAGE_KEY, settings);
  }, [settings]);

  useEffect(() => {
    writeJson(BRANDING_KEY, branding);
  }, [branding]);

  useEffect(() => {
    writeJson(ANNOUNCEMENTS_KEY, announcements);
  }, [announcements]);

  useEffect(() => {
    writeJson(PREFS_KEY, prefs);
  }, [prefs]);

  useEffect(() => {
    const apply = () => setResolvedMode(resolveMode(settings.mode));
    apply();
    if (settings.mode !== "system") return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [settings.mode]);

  const setMode = useCallback((mode) => {
    if (!MODE_IDS.has(mode)) return;
    setSettings((prev) => ({ ...prev, mode }));
  }, []);

  const setAccent = useCallback((accent) => {
    if (!ACCENT_IDS.has(accent) && accent !== "custom") return;
    setSettings((prev) => ({ ...prev, accent }));
  }, []);

  const setCustomAccent = useCallback((primary, bright) => {
    const nextPrimary = normalizeHex(primary, DEFAULT_CUSTOM.primary);
    const nextBright = normalizeHex(bright, DEFAULT_CUSTOM.bright);
    setSettings((prev) => ({
      ...prev,
      accent: "custom",
      customPrimary: nextPrimary,
      customBright: nextBright,
    }));
  }, []);

  const setCorners = useCallback((corners) => {
    if (!CORNER_IDS.has(corners)) return;
    setSettings((prev) => ({ ...prev, corners }));
  }, []);

  const setDensity = useCallback((density) => {
    if (!DENSITY_IDS.has(density)) return;
    setSettings((prev) => ({ ...prev, density }));
  }, []);

  const toggleMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      mode: resolveMode(prev.mode) === "dark" ? "light" : "dark",
    }));
  }, []);

  const setBranding = useCallback((patch) => {
    setBrandingState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setPrefs = useCallback((patch) => {
    setPrefsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const addAnnouncement = useCallback((item) => {
    const entry = {
      id: `${Date.now()}`,
      title: item.title?.trim() || "Untitled",
      body: item.body?.trim() || "",
      audience: item.audience || "all",
      active: item.active !== false,
      createdAt: new Date().toISOString(),
      email: item.email || "",
      emailSent: Boolean(item.emailSent),
    };
    setAnnouncementsState((prev) => ({
      items: [entry, ...(prev.items || [])],
    }));
    return entry;
  }, []);

  const updateAnnouncement = useCallback((id, patch) => {
    setAnnouncementsState((prev) => ({
      items: (prev.items || []).map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }));
  }, []);

  const removeAnnouncement = useCallback((id) => {
    setAnnouncementsState((prev) => ({
      items: (prev.items || []).filter((item) => item.id !== id),
    }));
  }, []);

  const customPrimary = settings.customPrimary;
  const customBright = settings.customBright;
  const isCustom = settings.accent === "custom";

  const accentSwatch = useMemo(() => {
    if (isCustom) return [customPrimary, customBright];
    return (
      ADMIN_ACCENTS.find((a) => a.id === settings.accent)?.swatch || [
        DEFAULT_CUSTOM.primary,
        DEFAULT_CUSTOM.bright,
      ]
    );
  }, [isCustom, customPrimary, customBright, settings.accent]);

  const accentGradient = useMemo(() => {
    if (isCustom) return customAccentGradient(customPrimary, customBright);
    return (
      ADMIN_ACCENTS.find((a) => a.id === settings.accent)?.gradient ||
      customAccentGradient(DEFAULT_CUSTOM.primary, DEFAULT_CUSTOM.bright)
    );
  }, [isCustom, customPrimary, customBright, settings.accent]);

  const customAccentStyle = useMemo(() => {
    if (!isCustom) return undefined;
    return buildCustomAccentVars(customPrimary, customBright, resolvedMode === "dark");
  }, [isCustom, customPrimary, customBright, resolvedMode]);

  const value = useMemo(
    () => ({
      mode: settings.mode,
      resolvedMode,
      accent: settings.accent,
      customPrimary,
      customBright,
      accentSwatch,
      accentGradient,
      customAccentStyle,
      corners: settings.corners,
      density: settings.density,
      dark: resolvedMode === "dark",
      accents: ADMIN_ACCENTS,
      branding,
      announcements: announcements.items || [],
      prefs,
      setMode,
      setAccent,
      setCustomAccent,
      setCorners,
      setDensity,
      toggleMode,
      setBranding,
      setPrefs,
      addAnnouncement,
      updateAnnouncement,
      removeAnnouncement,
    }),
    [
      settings,
      resolvedMode,
      customPrimary,
      customBright,
      accentSwatch,
      accentGradient,
      customAccentStyle,
      branding,
      announcements,
      prefs,
      setMode,
      setAccent,
      setCustomAccent,
      setCorners,
      setDensity,
      toggleMode,
      setBranding,
      setPrefs,
      addAnnouncement,
      updateAnnouncement,
      removeAnnouncement,
    ]
  );

  return (
    <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminTheme = () => {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return ctx;
};
