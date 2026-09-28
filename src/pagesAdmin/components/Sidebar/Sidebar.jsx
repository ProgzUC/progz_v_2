import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAdminTheme } from "../../context/AdminThemeContext";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/admin/overview", icon: "bi-grid", label: "Dashboard", end: true },
  { to: "/admin/courses", icon: "bi-book", label: "Courses" },
  { to: "/admin/instructors", icon: "bi-person-video3", label: "Instructors" },
  { to: "/admin/students", icon: "bi-mortarboard", label: "Students" },
  { to: "/admin/batches", icon: "bi-layers", label: "Batches" },
  { to: "/admin/enroll", icon: "bi-person-plus", label: "Enroll Students" },
  { to: "/admin/approve-users", icon: "bi-check-circle", label: "Approve Users" },
  { to: "/admin/recycle-bin", icon: "bi-trash", label: "Recycle Bin" },
  { to: "/admin/reports", icon: "bi-pie-chart", label: "Reports & Analytics", end: true },
  { to: "/admin/reports/attendance", icon: "bi-calendar-check", label: "Attendance Reports" },
  { to: "/admin/monitoring", icon: "bi-activity", label: "Monitoring" },
];

const FOOTER_ITEMS = [
  { to: "/admin/sync", icon: "bi-arrow-repeat", label: "Sync from Zen" },
  { to: "/admin/settings", icon: "bi-gear", label: "Settings" },
];

const canHoverExpand = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const Sidebar = ({ mobileOpen = false, onMobileClose }) => {
  const [hoverOpen, setHoverOpen] = useState(false);
  const expanded = hoverOpen || mobileOpen;
  const { branding } = useAdminTheme();
  const academyName = branding?.academyName?.trim() || "ProgZ Academy";
  const tagline = branding?.tagline?.trim() || "Super Admin";
  const logoSrc = branding?.logoDataUrl || "/admin/logo.png";

  useEffect(() => {
    const layout = document.querySelector(".layout");
    if (!layout) return undefined;

    layout.classList.add("sidebar-collapsed");
    layout.classList.toggle("sidebar-hover-expanded", hoverOpen && !mobileOpen);

    return () => {
      layout.classList.remove("sidebar-collapsed");
      layout.classList.remove("sidebar-hover-expanded");
    };
  }, [hoverOpen, mobileOpen]);

  const handleNavClick = () => {
    if (mobileOpen) onMobileClose?.();
  };

  const handleMouseEnter = () => {
    if (mobileOpen) return;
    if (canHoverExpand()) setHoverOpen(true);
  };

  const handleMouseLeave = () => {
    setHoverOpen(false);
  };

  return (
    <aside
      className={`admin-sidebar collapsed ${hoverOpen ? "hover-open" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo-text">
          <img src={logoSrc} alt={`${academyName} logo`} />
        </div>
        {expanded && (
          <div className="sidebar-brand">
            <h3 className="sidebar-title">{academyName}</h3>
            <p className="sidebar-subtitle">{tagline}</p>
          </div>
        )}
      </div>

      <nav
        id="admin-sidebar-nav"
        className="sidebar-menu"
        aria-label="Admin navigation"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={Boolean(item.end)}
            className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            onClick={handleNavClick}
            title={!expanded ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <i className={`bi ${item.icon}`} aria-hidden="true" />
                {expanded ? <span>{item.label}</span> : <span className="sr-only">{item.label}</span>}
                {isActive ? <span className="sr-only"> (current page)</span> : null}
              </>
            )}
          </NavLink>
        ))}

        <div className="menu-spacer" aria-hidden="true" />

        <div className="sidebar-footer">
          {FOOTER_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
              onClick={handleNavClick}
              title={!expanded ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                  {expanded ? <span>{item.label}</span> : <span className="sr-only">{item.label}</span>}
                  {isActive ? <span className="sr-only"> (current page)</span> : null}
                </>
              )}
            </NavLink>
          ))}

        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
