import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

/** Global app stays light; admin appearance is handled by AdminThemeProvider. */
const applyLightTheme = () => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", "light");
  root.classList.remove("dark-mode");
  root.style.colorScheme = "light";
  try {
    localStorage.removeItem("progz-theme");
  } catch {
    /* ignore */
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme] = useState("light");

  useEffect(() => {
    applyLightTheme();
  }, []);

  const setTheme = useCallback(() => {
    /* no-op: theme switching is admin-only via Settings */
  }, []);

  const toggleTheme = useCallback(() => {
    /* no-op: theme switching is admin-only via Settings */
  }, []);

  const value = useMemo(
    () => ({
      theme,
      dark: false,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
};
