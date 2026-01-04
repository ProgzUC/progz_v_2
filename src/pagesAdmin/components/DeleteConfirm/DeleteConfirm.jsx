import React from "react";
import "../Modal.css";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

const DeleteConfirm = ({ item, onCancel, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-box"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h3>Delete Course?</h3>
        <p>Are you sure you want to delete <b>{item.course}</b>?</p>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="delete-btn" onClick={onConfirm}>Delete</button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteConfirm;
