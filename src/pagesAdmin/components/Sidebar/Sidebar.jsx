import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { runManualSyncAndWait } from "../../../api/userApi";
import { logout } from "../../../api/authApi";
import Swal from "sweetalert2";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/admin/overview", icon: "bi-grid", label: "Dashboard" },
  { to: "/admin/courses", icon: "bi-inbox", label: "Courses" },
  { to: "/admin/instructors", icon: "bi-person-video3", label: "Instructors" },
  { to: "/admin/students", icon: "bi-mortarboard", label: "Students" },
  { to: "/admin/batches", icon: "bi-layers", label: "Batches" },
  { to: "/admin/enroll", icon: "bi-person-plus", label: "Enroll Students" },
  { to: "/admin/approve-users", icon: "bi-check-circle", label: "Approve Users" },
  { to: "/admin/recycle-bin", icon: "bi-trash", label: "Recycle Bin" },
  { to: "/admin/reports", icon: "bi-bar-chart-line", label: "Reports & Analytics" },
  { to: "/admin/monitoring", icon: "bi-activity", label: "Monitoring" },
  { to: "/admin/settings", icon: "bi-gear", label: "Settings" },
];

const canHoverExpand = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const Sidebar = ({ mobileOpen = false, onMobileClose }) => {
  const [hoverOpen, setHoverOpen] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const navigate = useNavigate();
  const expanded = hoverOpen || mobileOpen;

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
      const result = await runManualSyncAndWait();
      if (result?.status === "failure") {
        const detail =
          Array.isArray(result.errorsList) && result.errorsList.length
            ? result.errorsList[0]
            : "Sync finished with errors.";
        Swal.fire({
          title: "Sync Failed",
          text: detail,
          icon: "error",
        });
        return;
      }
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
          <img src="/admin/logo.png" alt="ProgZ admin logo" />
        </div>
        {expanded && (
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

        <div className="menu-divider" role="presentation" />

        <button
          type="button"
          className="menu-item"
          onClick={handleSync}
          disabled={syncLoading}
          aria-busy={syncLoading}
          title={!expanded ? (syncLoading ? "Syncing from Zen" : "Sync from Zen") : undefined}
        >
          <i
            className={`bi ${syncLoading ? "bi-arrow-repeat spin-icon" : "bi-arrow-repeat"}`}
            aria-hidden="true"
          />
          {expanded ? (
            <span>{syncLoading ? "Syncing..." : "Sync from Zen"}</span>
          ) : (
            <span className="sr-only">{syncLoading ? "Syncing from Zen" : "Sync from Zen"}</span>
          )}
        </button>

        <button
          type="button"
          className="menu-item logout-item"
          onClick={handleLogout}
          title={!expanded ? "Logout" : undefined}
        >
          <i className="bi bi-box-arrow-right" aria-hidden="true" />
          {expanded ? <span>Logout</span> : <span className="sr-only">Logout</span>}
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
