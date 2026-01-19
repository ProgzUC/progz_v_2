import React, { useState } from "react";
import "./CourseUsers.css";
import { useParams, useNavigate } from "react-router-dom";

const CourseUsers = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const courseName = "RPA";

  const [instructors, setInstructors] = useState([]);

  const [availableInstructors] = useState([
    { id: "1", name: "John Doe", email: "john@example.com" },
    { id: "2", name: "Jane Smith", email: "jane@example.com" },
    { id: "3", name: "Pushparaj", email: "pushparajraje52141@gmail.com" },
    { id: "4", name: "Savitha J", email: "savitha.saviy@gmail.com" },
  ]);

  const [selectedInstructorId, setSelectedInstructorId] = useState("");

  const handleAddInstructor = () => {
    if (!selectedInstructorId) return;

    const instructorToAdd = availableInstructors.find(
      (inst) => inst.id === selectedInstructorId
    );

    if (
      instructorToAdd &&
      !instructors.some((i) => i.email === instructorToAdd.email)
    ) {
      setInstructors([...instructors, instructorToAdd]);
    }

    setSelectedInstructorId("");
  };

  const handleRemoveInstructor = (email) => {
    setInstructors(instructors.filter((i) => i.email !== email));
  };

  return (
    <div className="manage-instructors-container">
      <div className="manage-card">
        <button className="close-btn" onClick={() => navigate(-1)}>
          &times;
        </button>

        <h2 className="title">Manage Instructors</h2>
        <p className="subtitle">{courseName}</p>

        <div className="input-group">
          <label className="section-label">Add New Instructor</label>

          <div className="select-row">
            <div className="custom-select-wrapper">
              <select
                className={`custom-select ${!selectedInstructorId ? "placeholder" : ""}`}
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
              >
                <option value="" disabled>
                  Select an instructor
                </option>
                {availableInstructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.email})
                  </option>
                ))}
              </select>
              <i className="arrow-down"></i>
            </div>

            <button className="add-btn" onClick={handleAddInstructor}>
              Add
            </button>
          </div>
        </div>

        <div className="current-instructors-section">
          <label className="section-label">Current Instructors</label>

          {instructors.length === 0 ? (
            <p className="empty-msg">No instructors assigned to this course.</p>
          ) : (
            <ul className="instructor-list">
              {instructors.map((inst, idx) => (
                <li key={idx} className="instructor-item">
                  <div className="instructor-info">
                    <span className="instructor-name">{inst.name}</span>
                    <span className="instructor-email">{inst.email}</span>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveInstructor(inst.email)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-footer">
          <button className="done-btn" onClick={() => navigate(-1)}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseUsers;
