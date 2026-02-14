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
    dob: "26/11/2026",
    address: "456 Elm Street, Suite 3 Los Angeles, CA 90001, USA",
    role: "Student",
    education: "Bsc",
    university: "Harvard University, Stanford",
    profession: "N/A",
    experience: "0",
    employmentStatus: "N/A",
  };

  return (
    <div className="ud-container">

      {/* BACK BUTTON */}
      <div className="ud-back" onClick={() => navigate(-1)}>
        <i className="bi bi-chevron-left"></i> Back
      </div>

      {/* ---------- PERSONAL DETAILS ---------- */}
      <h3 className="ud-section-title">Personal Details</h3>

      <div className="ud-row">
        <div className="ud-field">
          <label>Name</label>
          <p>{user.name}</p>
        </div>

        <div className="ud-field">
          <label>E-mail</label>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="ud-row">
        <div className="ud-field">
          <label>Phone Number</label>
          <p>{user.phone}</p>
        </div>

        <div className="ud-field">
          <label>Alternative Number</label>
          <p>{user.alternatePhone}</p>
        </div>
      </div>

      <div className="ud-row">
        <div className="ud-field">
          <label>Date of Birth</label>
          <p>{user.dob}</p>
        </div>
      </div>

      <div className="ud-row">
        <div className="ud-field full">
          <label>Address</label>
          <p>{user.address || "N/A"}</p>
        </div>
      </div>

      <div className="ud-row">
        <div className="ud-field">
          <label>Gender</label>
          <p>{user.gender || "N/A"}</p>
        </div>
        <div className="ud-field">
          <label>Source</label>
          <p>{user.source || "N/A"}</p>
        </div>
      </div>

      {/* ---------- ROLE ---------- */}
      <h3 className="ud-section-title">Role</h3>

      <div className="ud-row">
        <div className="ud-field">
          <label>Role</label>
          <p>{user.role}</p>
        </div>
      </div>

      {/* ---------- EDUCATION ---------- */}
      <h3 className="ud-section-title">Education & Employment Details</h3>

      <div className="ud-row">
        <div className="ud-field">
          <label>Education</label>
          <p>{user.education || user.qualification || "N/A"}</p>
        </div>

        <div className="ud-field">
          <label>University/School</label>
          <p>{user.university || "N/A"}</p>
        </div>
      </div>

      <div className="ud-row">
        <div className="ud-field">
          <label>Profession</label>
          <p>{user.profession || "N/A"}</p>
        </div>

        <div className="ud-field">
          <label>Experience</label>
          <p>{user.experience || "N/A"}</p>
        </div>
      </div>

      <div className="ud-row">
        <div className="ud-field full">
          <label>Employment Status</label>
          <p>{user.employmentStatus || "N/A"}</p>
        </div>
      </div>

      <div className="ud-row">
        <div className="ud-field full">
          <label>Skills</label>
          <p>{user.skills || "N/A"}</p>
        </div>
      </div>

      {/* ---------- ZEN COURSE ---------- */}
      <h3 className="ud-section-title">Zen Course Details</h3>
      <div className="ud-row">
        <div className="ud-field">
          <label>Zen Course Name</label>
          <p>{user.zenCourseName || "N/A"}</p>
        </div>

        <div className="ud-field">
          <label>Zen Course Type</label>
          <p>{user.zenCourseType || "N/A"}</p>
        </div>
      </div>

    </div>
  );
};

export default UserDetailView;
