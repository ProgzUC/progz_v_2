import { useEffect, useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import SkipLink from "../../../components/common/SkipLink/SkipLink";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      <div className="layout">
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
          </header>

          <main id="admin-main-content" className="admin-page-body" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
