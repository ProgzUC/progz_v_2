import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Perform any cleanup here if needed (e.g., localStorage.clear())
    navigate("/login");
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

        <div className="menu-spacer"></div>

        <div className="menu-divider"></div>

        <NavLink
          to="/admin/sync"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <i className="bi bi-arrow-repeat"></i>
          {!collapsed && <span>Sync from Zen</span>}
        </NavLink>

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
