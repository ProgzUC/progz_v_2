import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { triggerManualSync } from "../../../api/axiosInstance";
import Swal from "sweetalert2";
import "./Sidebar.css";

const Sidebar = () => {
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
      confirmButtonText: "Yes, logout!"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear(); // Clear all user data/tokens
        navigate("/", { replace: true }); // Redirect to login/home
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

  // Apply collapsed class to layout wrapper
  useEffect(() => {
    const layout = document.querySelector(".layout");
    if (!layout) return;

    if (collapsed) {
      layout.classList.add("sidebar-collapsed");
    } else {
      layout.classList.remove("sidebar-collapsed");
    }
  }, [collapsed]);

  return (
    <div
      className={`sidebar-container ${collapsed ? "collapsed" : ""}`}
      data-collapsed={collapsed}
    >
      {/* Collapse Button */}
      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
        <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
      </button>

      {/* Logo */}
      <div className="sidebar-header">
        {/* Assuming logo.png is the green circle logo as per previous context or generic placeholder. 
             If not, I might need to replace it, but I'll keep existing image tag for now. 
             The user image shows a green circle logo. */}
        <img src="/admin/logo.png" alt="logo" className="sidebar-logo" />
        {!collapsed && <h3 className="sidebar-title">Admin Portal</h3>}
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        <NavLink
          to="/admin/overview"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <i className="bi bi-grid"></i>
          {!collapsed && <span>Overview</span>}
        </NavLink>

        <NavLink
          to="/admin/courses"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <i className="bi bi-inbox"></i>
          {!collapsed && <span>Courses</span>}
        </NavLink>

        <NavLink
          to="/admin/enroll"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <i className="bi bi-calendar4"></i>
          {!collapsed && <span>Enroll Student</span>}
        </NavLink>

        <NavLink
          to="/admin/instructors"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <i className="bi bi-person-video3"></i>
          {!collapsed && <span>Instructors</span>}
        </NavLink>

        <NavLink
          to="/admin/students"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <i className="bi bi-mortarboard"></i>
          {!collapsed && <span>Students</span>}
        </NavLink>

        <NavLink
          to="/admin/batches"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <i className="bi bi-layers"></i>
          {!collapsed && <span>Batches</span>}
        </NavLink>

        <NavLink
          to="/admin/approve-users"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <i className="bi bi-check-circle"></i>
          {!collapsed && <span>Approve Users</span>}
        </NavLink>

        <NavLink
          to="/admin/recycle-bin"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <i className="bi bi-trash"></i>
          {!collapsed && <span>Recycle Bin</span>}
        </NavLink>

        <div className="menu-spacer"></div>

        <div className="menu-divider"></div>

        <div
          className="menu-item"
          onClick={handleSync}
          style={{ cursor: syncLoading ? "wait" : "pointer" }}
        >
          <i className={`bi ${syncLoading ? "bi-arrow-repeat spin-icon" : "bi-arrow-repeat"}`}></i>
          {!collapsed && <span>{syncLoading ? "Syncing..." : "Sync from Zen"}</span>}
        </div>

        <div
          className="menu-item"
          onClick={handleLogout}
          style={{ cursor: "pointer" }}
        >
          <i className="bi bi-box-arrow-right"></i>
          {!collapsed && <span>Logout</span>}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
