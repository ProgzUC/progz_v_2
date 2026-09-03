import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { triggerManualSync } from "../../../api/userApi";
import { logout } from "../../../api/authApi";
import Swal from "sweetalert2";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/admin/overview", icon: "bi-grid", label: "Dashboard" },
  { to: "/admin/courses", icon: "bi-inbox", label: "Courses" },
  { to: "/admin/instructors", icon: "bi-person-video3", label: "Instructors" },
  { to: "/admin/students", icon: "bi-mortarboard", label: "Students" },
  { to: "/admin/batches", icon: "bi-layers", label: "Batches" },
  { to: "/admin/approve-users", icon: "bi-check-circle", label: "Approve Users" },
  { to: "/admin/recycle-bin", icon: "bi-trash", label: "Recycle Bin" },
  { to: "/admin/reports", icon: "bi-bar-chart-line", label: "Reports & Analytics" },
  { to: "/admin/monitoring", icon: "bi-activity", label: "Monitoring" },
];

const Sidebar = ({ mobileOpen = false, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
        navigate("/", { replace: true });
      }
    });
  };

  const handleSync = async () => {
    if (syncLoading) return;
    setSyncLoading(true);
    try {
      await triggerManualSync();
      Swal.fire({
        title: "Sync Completed",
        text: "Data synced successfully from Zen.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Sync failed:", error);
      Swal.fire({
        title: "Sync Failed",
        text: error.message || "Unable to sync data.",
        icon: "error",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  useEffect(() => {
    const layout = document.querySelector(".layout");
    if (!layout) return;

    if (collapsed) {
      layout.classList.add("sidebar-collapsed");
    } else {
      layout.classList.remove("sidebar-collapsed");
    }
  }, [collapsed]);

  const handleNavClick = () => {
    if (mobileOpen) onMobileClose?.();
  };

  return (
    <aside
      className={`admin-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      data-collapsed={collapsed}
    >
      <button
        className="collapse-btn"
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
      >
        <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`} aria-hidden="true" />
      </button>

      <div className="sidebar-header">
        <div className="sidebar-logo-text">
          <img src="/admin/logo.png" alt="ProgZ admin logo" />
        </div>
        {!collapsed && (
          <div className="sidebar-brand">
            <h3 className="sidebar-title">Portal</h3>
            <p className="sidebar-subtitle">Super Admin</p>
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
            end={item.to === "/admin/overview"}
            className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            onClick={handleNavClick}
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <i className={`bi ${item.icon}`} aria-hidden="true" />
                {!collapsed ? <span>{item.label}</span> : <span className="sr-only">{item.label}</span>}
                {isActive ? <span className="sr-only"> (current page)</span> : null}
              </>
            )}
          </NavLink>
        ))}

        <div className="menu-spacer" aria-hidden="true" />

        <div className="menu-divider" role="presentation" />

        <button
          type="button"
          className="menu-item"
          onClick={handleSync}
          disabled={syncLoading}
          aria-busy={syncLoading}
        >
          <i
            className={`bi ${syncLoading ? "bi-arrow-repeat spin-icon" : "bi-arrow-repeat"}`}
            aria-hidden="true"
          />
          {!collapsed ? (
            <span>{syncLoading ? "Syncing..." : "Sync from Zen"}</span>
          ) : (
            <span className="sr-only">{syncLoading ? "Syncing from Zen" : "Sync from Zen"}</span>
          )}
        </button>

        <button type="button" className="menu-item logout-item" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" aria-hidden="true" />
          {!collapsed ? <span>Logout</span> : <span className="sr-only">Logout</span>}
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
