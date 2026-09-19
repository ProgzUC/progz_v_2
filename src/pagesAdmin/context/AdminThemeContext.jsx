import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "progz-admin-theme";

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

const getInitialSettings = () => {
  const defaults = { mode: "light", accent: "emerald" };
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      mode: parsed.mode === "dark" ? "dark" : "light",
      accent: ACCENT_IDS.has(parsed.accent) ? parsed.accent : "emerald",
    };
  } catch {
    return defaults;
  }
};

const AdminThemeContext = createContext(null);

export const AdminThemeProvider = ({ children }) => {
  const [settings, setSettings] = useState(getInitialSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  const setMode = useCallback((mode) => {
    setSettings((prev) => ({
      ...prev,
      mode: mode === "dark" ? "dark" : "light",
    }));
  }, []);

  const setAccent = useCallback((accent) => {
    if (!ACCENT_IDS.has(accent)) return;
    setSettings((prev) => ({ ...prev, accent }));
  }, []);

  const toggleMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      mode: prev.mode === "dark" ? "light" : "dark",
    }));
  }, []);

  const value = useMemo(
    () => ({
      mode: settings.mode,
      accent: settings.accent,
      dark: settings.mode === "dark",
      accents: ADMIN_ACCENTS,
      setMode,
      setAccent,
      toggleMode,
    }),
    [settings, setMode, setAccent, toggleMode]
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
