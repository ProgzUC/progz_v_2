import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import SkipLink from "../../../components/common/SkipLink/SkipLink";
import NotificationBell from "../../../components/common/NotificationBell/NotificationBell";
import AdminAccountMenu from "../AdminAccountMenu/AdminAccountMenu";
import { AdminThemeProvider, useAdminTheme } from "../../context/AdminThemeContext";
import "../../styles/admin-theme.css";
import "./AdminLayout.css";

const AdminLayoutShell = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { resolvedMode, accent, corners, density, customAccentStyle } = useAdminTheme();
  const location = useLocation();
  const isOverview = /\/admin\/?(overview)?$/.test(location.pathname);

  useEffect(() => {
    document.body.classList.toggle("admin-no-scroll", mobileNavOpen);
    return () => document.body.classList.remove("admin-no-scroll");
  }, [mobileNavOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleChange = () => {
      if (!mediaQuery.matches) setMobileNavOpen(false);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <SkipLink targetId="admin-main-content" label="Skip to admin content" />
      <div
        className="layout"
        data-admin-mode={resolvedMode}
        data-admin-accent={accent}
        data-admin-corners={corners}
        data-admin-density={density}
        style={customAccentStyle}
      >
        <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

        {mobileNavOpen ? (
          <button
            type="button"
            className="admin-sidebar-backdrop"
            aria-label="Close navigation menu"
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}

        <div className="content">
          <header className="admin-mobile-header">
            <button
              type="button"
              className={`admin-menu-toggle ${mobileNavOpen ? "active" : ""}`}
              aria-expanded={mobileNavOpen}
              aria-controls="admin-sidebar-nav"
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              <span className="admin-menu-bar" aria-hidden="true" />
              <span className="admin-menu-bar" aria-hidden="true" />
              <span className="admin-menu-bar" aria-hidden="true" />
              <span className="sr-only">{mobileNavOpen ? "Close menu" : "Open menu"}</span>
            </button>
            <p className="admin-mobile-title">Admin Portal</p>
            <div className="admin-mobile-actions">
              <NotificationBell variant="admin" settingsHref="/admin/settings?section=notifications" />
              <AdminAccountMenu compact />
            </div>
          </header>

          {!isOverview ? (
            <div className="admin-notify-dock" aria-hidden={false}>
              <NotificationBell variant="admin" settingsHref="/admin/settings?section=notifications" />
              <AdminAccountMenu />
            </div>
          ) : null}

          <main id="admin-main-content" className="admin-page-body" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

const AdminLayout = ({ children }) => (
  <AdminThemeProvider>
    <AdminLayoutShell>{children}</AdminLayoutShell>
  </AdminThemeProvider>
);

export default AdminLayout;
