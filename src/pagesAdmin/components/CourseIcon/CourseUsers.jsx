import React, { useState } from "react";
import "./CourseUsers.css";
import { useParams, useNavigate } from "react-router-dom";

const CourseUsers = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock Data
  const courseName = "RPA";
  const [instructors, setInstructors] = useState([]);

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="manage-instructors-container">
      <div className="manage-card">

        {/* CLOSE BUTTON */}
        <button className="close-btn" onClick={handleClose}>
          &times;
        </button>

        <h2 className="title">Manage Instructors</h2>
        <p className="subtitle">{courseName}</p>

        {/* INPUT SECTION */}
        <div className="input-group">
          <div className="label-row">
            <label>Select Instructor</label>
            <span className="add-link">+ Add</span>
          </div>

          <div className="custom-select-wrapper">
            <select className="custom-select" defaultValue="">
              <option value="" disabled>
                Select instructor
              </option>
              <option value="1">John Doe</option>
              <option value="2">Jane Smith</option>
            </select>
            <i className="arrow-down"></i>
          </div>
        </div>

        {/* CURRENT INSTRUCTORS */}
        <div className="current-instructors-section">
          <label>Current Instructors</label>

          {instructors.length === 0 ? (
            <p className="empty-msg">No instructors assigned to this course.</p>
          ) : (
            <ul className="instructor-list">
              {instructors.map((inst, idx) => (
                <li key={idx}>{inst.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* FOOTER */}
        <div className="card-footer">
          <button className="continue-btn" onClick={handleClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseUsers;
