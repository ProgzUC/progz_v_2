import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./UserDetailView.css";

const UserDetailView = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = location.state?.user || {
    name: "Ram",
    email: "ram@gmail.com",
    phone: "8220807628",
    alternatePhone: "8220807628",
    altPhone: "8220807628",
    dob: "26/11/2026",
    address: "456 Elm Street, Suite 3 Los Angeles, CA 90001, USA",
    role: "Student",
    education: "Bsc",
    university: "Harvard University, Stanford",
    profession: "N/A",
    experience: "0",
    employmentStatus: "N/A",
    skills: "",
    zenCourseName: "",
    zenCourseType: "",
  };

  const initials = String(user.name || "U")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("") || "U";

  const Field = ({ label, value, full = false }) => (
    <div className={`ud-field ${full ? "is-full" : ""}`}>
      <label>{label}</label>
      <p>{value || "—"}</p>
    </div>
  );

  return (
    <div className="ud-page">
      <button type="button" className="ud-back" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left" aria-hidden="true" />
        Back
      </button>

      <div className="ud-shell">
        <header className="ud-hero">
          <div className="ud-avatar" aria-hidden="true">
            {initials}
          </div>
          <div>
            <p className="ud-kicker">Pending approval</p>
            <h1>{user.name || "User"}</h1>
            <p className="ud-email">{user.email || "—"}</p>
          </div>
        </header>

        <section className="ud-card">
          <h2>Personal details</h2>
          <div className="ud-grid">
            <Field label="Name" value={user.name} />
            <Field label="Email" value={user.email} />
            <Field label="Phone" value={user.phone} />
            <Field label="Alternate phone" value={user.alternatePhone || user.altPhone} />
            <Field label="Date of birth" value={user.dob} />
            <Field label="Gender" value={user.gender} />
            <Field label="Address" value={user.address} full />
          </div>
        </section>

        <section className="ud-card">
          <h2>Role</h2>
          <div className="ud-grid">
            <Field label="Requested role" value={user.role} />
          </div>
        </section>

        <section className="ud-card">
          <h2>Education & employment</h2>
          <div className="ud-grid">
            <Field label="Education" value={user.education} />
            <Field label="Profession" value={user.profession} />
            <Field label="Experience" value={user.experience} />
            <Field label="Employment status" value={user.employmentStatus} />
            <Field label="University / school" value={user.university} full />
            <Field label="Skills" value={user.skills} full />
          </div>
        </section>

        <section className="ud-card">
          <h2>Zen course details</h2>
          <div className="ud-grid">
            <Field label="Zen course name" value={user.zenCourseName} />
            <Field label="Zen course type" value={user.zenCourseType} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserDetailView;
