import React from "react";
import "../Modal.css";
import { motion } from "framer-motion"; 

const StudentListModal = ({ students, onClose }) => {
  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-box"
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
      >
        <h3>Student List</h3>

        <div className="student-list">
          {students.map((s, i) => (
            <div key={i} className="student-row">
              <img src={s} alt="student" className="avatar" />
              <span>Student {i + 1}</span>
            </div>
          ))}
        </div>

        <button className="close-btn" onClick={onClose}>Close</button>
      </motion.div>
    </div>
  );
};

export default StudentListModal;
