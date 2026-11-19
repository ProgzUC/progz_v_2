import React, { useState } from "react";
import "./InstructorPreview.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useUpdateUser } from "../../../hooks/useAdminUsers";
import { showError, showSuccess } from "../../../utils/toast";

const InstructorPreview = ({ instructor, onCancel }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const instructorFromState = location.state?.instructor;

  const mapToFormData = (data) => {
    if (!data) return {};
    return {
      ...data,
      qualification: data.education || data.qualification || "",
    };
  };

  const initialData = mapToFormData(instructor || instructorFromState || {});
  const initialEditMode = location.state?.initialEditMode || false;
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const { mutate: updateUser } = useUpdateUser();

  const isInstructorRole = (role) => {
    const r = String(role || "").toLowerCase();
    return r === "trainer" || r === "instructor";
  };

  const initials = String(formData.name || "I")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("") || "I";

  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false);
      setFormData(initialData);
      setErrors({});
    } else if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Full Name is required";
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    if (
      formData.phone?.trim() &&
      !/^\+?\d{10,15}$/.test(formData.phone.replace(/[\s-]/g, ""))
    ) {
      newErrors.phone = "Invalid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      ...formData,
      education: formData.qualification,
    };
    delete payload.qualification;

    updateUser(
      { id: formData._id || formData.id, data: payload },
      {
        onSuccess: () => {
          const becameStudent = String(payload.role || "").toLowerCase() === "student";
          showSuccess(
            becameStudent
              ? "User updated and role changed to Student"
              : "Instructor details updated successfully"
          );
          if (becameStudent) navigate("/admin/students");
          else setIsEditing(false);
        },
        onError: (err) => {
          showError(err.response?.data?.msg || "Failed to update instructor");
        },
      }
    );
  };

  const handleDOBChange = (e) => {
    const { value } = e.target;
    const prevState = formData.dob || "";
    let digits = value.replace(/\D/g, "");
    if (value.length < prevState.length) {
      const prevDigits = prevState.replace(/\D/g, "");
      if (digits.length === prevDigits.length && digits.length > 0) {
        digits = digits.slice(0, -1);
      }
    }
    digits = digits.slice(0, 8);
    if (digits.length === 0) {
      setFormData({ ...formData, dob: "" });
      return;
    }
    const template = "dd/mm/yyyy";
    let formatted = "";
    let dIdx = 0;
    for (let i = 0; i < template.length; i++) {
      if (template[i] === "/") formatted += "/";
      else if (dIdx < digits.length) formatted += digits[dIdx++];
      else formatted += template[i];
    }
    setFormData({ ...formData, dob: formatted });
  };

  const Field = ({ label, required, error, children, full = false }) => (
    <div className={`ip-field ${full ? "is-full" : ""}`}>
      <label>
        {label}
        {required && isEditing ? <span className="ip-req">*</span> : null}
      </label>
      {children}
      {error ? <span className="ip-error">{error}</span> : null}
    </div>
  );

  return (
    <div className="ip-page">
      <button type="button" className="ip-back" onClick={handleCancel}>
        <i className="bi bi-arrow-left" aria-hidden="true" />
        Back
      </button>

      <div className="ip-shell">
        <header className="ip-hero">
          <div className="ip-hero-main">
            <div className="ip-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="ip-hero-copy">
              <p className="ip-kicker">{isEditing ? "Editing instructor" : "Instructor profile"}</p>
              <h1>{formData.name || "Instructor"}</h1>
              <p className="ip-email">{formData.email || "—"}</p>
            </div>
          </div>
          <div className="ip-hero-actions">
            {!isEditing ? (
              <button type="button" className="ip-btn ip-btn-primary" onClick={() => setIsEditing(true)}>
                <i className="bi bi-pencil" aria-hidden="true" />
                Edit
              </button>
            ) : (
              <>
                <button type="button" className="ip-btn ip-btn-ghost" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="button" className="ip-btn ip-btn-primary" onClick={handleSave}>
                  Save changes
                </button>
              </>
            )}
          </div>
        </header>

        <section className="ip-card">
          <h2>Personal details</h2>
          <div className="ip-grid">
            <Field label="Full name" required error={errors.name}>
              <input
                type="text"
                value={formData.name || ""}
                readOnly={!isEditing}
                className={`ip-input ${isEditing ? "is-edit" : ""} ${errors.name ? "is-error" : ""}`}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
              />
            </Field>
            <Field label="Email" required error={errors.email}>
              <input
                type="email"
                value={formData.email || ""}
                readOnly={!isEditing}
                className={`ip-input ${isEditing ? "is-edit" : ""} ${errors.email ? "is-error" : ""}`}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
              />
            </Field>
            {isEditing ? (
              <>
                <Field label="New password" error={errors.password}>
                  <input
                    type="password"
                    value={formData.password || ""}
                    placeholder="Leave blank to keep current"
                    className={`ip-input is-edit ${errors.password ? "is-error" : ""}`}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: null });
                    }}
                  />
                </Field>
                <Field label="Confirm password" error={errors.confirmPassword}>
                  <input
                    type="password"
                    value={formData.confirmPassword || ""}
                    placeholder="Confirm new password"
                    className={`ip-input is-edit ${errors.confirmPassword ? "is-error" : ""}`}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                    }}
                  />
                </Field>
              </>
            ) : null}
            <Field label="Phone" error={errors.phone}>
              <input
                type="text"
                value={formData.phone || ""}
                readOnly={!isEditing}
                className={`ip-input ${isEditing ? "is-edit" : ""} ${errors.phone ? "is-error" : ""}`}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: null });
                }}
              />
            </Field>
            <Field label="Date of birth">
              <input
                type="text"
                value={formData.dob || ""}
                readOnly={!isEditing}
                className={`ip-input ${isEditing ? "is-edit" : ""}`}
                onChange={handleDOBChange}
                placeholder="DD/MM/YYYY"
                maxLength="15"
              />
            </Field>
            <Field label="Gender">
              <input
                type="text"
                value={formData.gender || ""}
                readOnly={!isEditing}
                className={`ip-input ${isEditing ? "is-edit" : ""}`}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              />
            </Field>
            <Field label="Alternate phone">
              <input
                type="text"
                value={formData.altPhone || ""}
                readOnly={!isEditing}
                className={`ip-input ${isEditing ? "is-edit" : ""}`}
                onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
              />
            </Field>
            <Field label="Address" full>
              <textarea
                className={`ip-input ip-textarea ${isEditing ? "is-edit" : ""}`}
                readOnly={!isEditing}
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </Field>
          </div>
        </section>

        <section className="ip-card">
          <h2>Role</h2>
          <div className="ip-role-row">
            <button
              type="button"
              className={`ip-role ${isInstructorRole(formData.role) ? "is-active" : ""}`}
              disabled={!isEditing}
              onClick={() => setFormData({ ...formData, role: "trainer" })}
            >
              Instructor
            </button>
            <button
              type="button"
              className={`ip-role ${String(formData.role || "").toLowerCase() === "student" ? "is-active" : ""}`}
              disabled={!isEditing}
              onClick={() => setFormData({ ...formData, role: "student" })}
            >
              Student
            </button>
          </div>
        </section>

        <section className="ip-card">
          <h2>Education & employment</h2>
          <div className="ip-grid">
            <Field label="Education">
              <input
                type="text"
                value={formData.education || ""}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className={`ip-input ${isEditing ? "is-edit" : ""}`}
                readOnly={!isEditing}
              />
            </Field>
            <Field label="Profession">
              <input
                type="text"
                value={formData.profession || ""}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                className={`ip-input ${isEditing ? "is-edit" : ""}`}
                readOnly={!isEditing}
              />
            </Field>
            <Field label="Experience">
              <input
                type="text"
                value={formData.experience || ""}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className={`ip-input ${isEditing ? "is-edit" : ""}`}
                readOnly={!isEditing}
              />
            </Field>
            <Field label="Employment status">
              <input
                type="text"
                value={formData.employmentStatus || ""}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                className={`ip-input ${isEditing ? "is-edit" : ""}`}
                readOnly={!isEditing}
              />
            </Field>
            <Field label="University / school" full>
              <input
                type="text"
                value={formData.university || ""}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className={`ip-input ${isEditing ? "is-edit" : ""}`}
                readOnly={!isEditing}
              />
            </Field>
            <Field label="Skills" full>
              <textarea
                className={`ip-input ip-textarea ${isEditing ? "is-edit" : ""}`}
                value={formData.skills || ""}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                readOnly={!isEditing}
                rows={3}
              />
            </Field>
          </div>
        </section>

        {isEditing ? (
          <div className="ip-sticky-actions">
            <button type="button" className="ip-btn ip-btn-ghost" onClick={handleCancel}>
              Cancel
            </button>
            <button type="button" className="ip-btn ip-btn-primary" onClick={handleSave}>
              Save changes
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default InstructorPreview;
