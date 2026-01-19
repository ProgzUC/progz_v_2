import React, { useState } from "react";
import "./EnrollStudents.css";

const students = ["Sanjay", "Mezin", "Akshay", "Deepak"];
const courses = ["RPA", "AWS", "DevOps", "Azure"];
const instructors = ["John", "Mezin", "Akshay", "Deepak"];
const batches = ["Morning", "Afternoon", "Evening"];

const EnrollStudents = () => {
  const [courseSections, setCourseSections] = useState([{ id: 1 }]);
  const [batchList, setBatchList] = useState(batches);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: "",
    days: [],
    startTime: "",
    endTime: "",
    link: ""
  });

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const addCourse = () => {
    setCourseSections([...courseSections, { id: Date.now() }]);
  };

  const deleteCourse = (id) => {
    setCourseSections(courseSections.filter((sec) => sec.id !== id));
  };

  const handleModalChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setNewBatch(prev => {
        const newDays = checked
          ? [...prev.days, value]
          : prev.days.filter(d => d !== value);
        return { ...prev, days: newDays };
      });
    } else {
      setNewBatch(prev => ({ ...prev, [name]: value }));
    }
  };

  const createBatch = () => {
    if (newBatch.name) {
      setBatchList([...batchList, newBatch.name]);
      setIsModalOpen(false);
      setNewBatch({ name: "", days: [], startTime: "", endTime: "", link: "" });
    }
  };

  return (
    <div className="enroll-page">
      <div className="enroll-container">
        <h1 className="enroll-title">Enroll a Student</h1>

        {/* Student Info */}
        <div className="section">
          <h3 className="section-title">Students Information</h3>
          <select className="input-select">
            <option>Select student</option>
            {students.map((s, i) => (
              <option key={i}>{s}</option>
            ))}
          </select>
        </div>

        {/* Course Sections */}
        {courseSections.map((section, idx) => (
          <div key={section.id} className="section">

            <div className="title-row">
              <h3 className="section-title">Course Enrollment – {idx + 1}</h3>

              <div className="title-buttons">
                {idx === 0 && (
                  <button className="add-course-btn" onClick={addCourse}>
                    + Add Another Courses
                  </button>
                )}

                {idx !== 0 && (
                  <button
                    className="delete-icon-btn"
                    onClick={() => deleteCourse(section.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>

            <select className="input-select">
              <option>Select course</option>
              {courses.map((c, i) => (
                <option key={i}>{c}</option>
              ))}
            </select>

            <select className="input-select">
              <option>Select instructor</option>
              {instructors.map((ins, i) => (
                <option key={i}>{ins}</option>
              ))}
            </select>

            <div className="batch-container">
              <a
                href="#"
                className="create-batch-link"
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
              >
                Create new batch
              </a>

              <select className="input-select">
                <option>Select batch</option>
                {batchList.map((b, i) => (
                  <option key={i}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        ))}

        <div className="center-btn">
          <button className="enroll-btn">Enroll Student</button>
        </div>
      </div>

      {/* Create Batch Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Create New Batch</h3>

            <div className="modal-field">
              <label className="modal-label">Batch Name</label>
              <input
                type="text"
                name="name"
                className="modal-input"
                value={newBatch.name}
                onChange={handleModalChange}
                placeholder="Enter batch name"
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Select Days</label>
              <div className="days-checkbox-group">
                {weekDays.map(day => (
                  <label key={day} className="day-checkbox">
                    <input
                      type="checkbox"
                      name="days"
                      value={day}
                      checked={newBatch.days.includes(day)}
                      onChange={handleModalChange}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-field" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label className="modal-label">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  className="modal-input"
                  value={newBatch.startTime}
                  onChange={handleModalChange}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="modal-label">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  className="modal-input"
                  value={newBatch.endTime}
                  onChange={handleModalChange}
                />
              </div>
            </div>

            <div className="modal-field">
              <label className="modal-label">Gmeet Link</label>
              <input
                type="text"
                name="link"
                className="modal-input"
                value={newBatch.link}
                onChange={handleModalChange}
                placeholder="https://meet.google.com/..."
              />
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="create-btn" onClick={createBatch}>
                Create Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollStudents;
