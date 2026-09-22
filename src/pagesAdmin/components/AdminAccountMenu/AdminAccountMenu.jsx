import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { logout } from "../../../api/authApi";
import { getStoredUser } from "../../../utils/authStorage";
import "./AdminAccountMenu.css";

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const formatRole = (role) => {
  if (!role) return "Admin";
  const value = String(role).trim();
  if (/^admin$/i.test(value)) return "Admin";
  if (/^(super[_-]?admin|superadmin)$/i.test(value)) return "Admin";
  return value.replace(/^\w/, (c) => c.toUpperCase());
};

const AdminAccountMenu = ({ compact = false, className = "" }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
  const navigate = useNavigate();
  const user = getStoredUser();
  const displayName = user?.name?.trim() || "Admin";
  const roleLabel = formatRole(user?.role);
  const initials = getInitials(displayName);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSignOut = () => {
    setOpen(false);
    Swal.fire({
      title: "Sign out?",
      text: "Are you sure you want to sign out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, sign out",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      await logout();
      navigate("/", { replace: true });
    });
  };

  const goPreferences = () => {
    setOpen(false);
    navigate("/admin/settings");
  };

  return (
    <div
      className={`admin-account-menu ${compact ? "is-compact" : ""} ${open ? "is-open" : ""} ${className}`.trim()}
      ref={rootRef}
    >
      <button
        type="button"
        className="admin-account-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="admin-account-avatar" aria-hidden="true">
          {initials}
        </span>
        {!compact ? (
          <span className="admin-account-meta">
            <strong className="admin-account-name">{displayName}</strong>
            <span className="admin-account-role">{roleLabel}</span>
          </span>
        ) : (
          <span className="sr-only">{displayName}, {roleLabel}</span>
        )}
        <i
          className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"} admin-account-chevron`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={menuId}
          className="admin-account-dropdown"
          role="menu"
          aria-label="Account"
        >
          <p className="admin-account-section" id={`${menuId}-label`}>
            Account
          </p>
          <button
            type="button"
            className="admin-account-item"
            role="menuitem"
            onClick={goPreferences}
          >
            Profile &amp; preferences
          </button>
          <button
            type="button"
            className="admin-account-item"
            role="menuitem"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default AdminAccountMenu;
