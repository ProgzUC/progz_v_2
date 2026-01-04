import React, { useState } from "react";
import "../Modal.css";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

const EditCourseModel = ({ course, onClose, onSave }) => {
  const [form, setForm] = useState({
    course: course.course || "",
    instructor: course.instructor || "",
    date: course.date || "",
  });

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-box"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="modal-header">
          <i className="bi bi-pencil-square modal-icon"></i>
          <h3>Edit Course</h3>
        </div>

        <label>Course Name</label>
        <input
          name="course"
          value={form.course}
          onChange={update}
          placeholder="Enter course name"
        />

        <label>Instructor</label>
        <input
          name="instructor"
          value={form.instructor}
          onChange={update}
          placeholder="Enter instructor name"
        />

        <label>Date</label>
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={update}
          className="date-input"
        />

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>

          <button
            className="save-btn"
            onClick={() => onSave({ ...course, ...form })}
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditCourseModel;
