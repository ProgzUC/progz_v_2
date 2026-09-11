import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAllUsers } from "../../../hooks/useAdminUsers";
import { useEnrollStudent } from "../../../hooks/useBatches";
import "../Modal.css";

const AddStudentToBatchModal = ({ batch, isOpen, onClose }) => {
    const [selectedStudentId, setSelectedStudentId] = useState("");

    const { data: users, isLoading } = useAllUsers();
    const { mutate: enrollStudentMutation } = useEnrollStudent();

    if (!isOpen || !batch) return null;

    const batchId = batch._id || batch.id;
    const usersArray = Array.isArray(users) ? users : [];
    const studentsList = usersArray.filter((u) => (u.role || "").toLowerCase() === "student");

    const handleEnroll = () => {
        if (!selectedStudentId) {
            Swal.fire("Error", "Please select a student", "error");
            return;
        }
        if (!batch.course) {
            Swal.fire("Error", "Batch does not have a valid course linked", "error");
            return;
        }

        const payload = {
            batchId,
            studentId: selectedStudentId,
        };

        enrollStudentMutation(payload, {
            onSuccess: () => {
                Swal.fire("Success", "Student Added to Batch Successfully!", "success");
                onClose();
                setSelectedStudentId("");
            },
            onError: (err) => {
                Swal.fire(
                    "Error",
                    err.response?.data?.message || err.response?.data?.msg || "Enrollment failed",
                    "error"
                );
            },
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
                <h3 className="modal-title">Add Student to {batch.name}</h3>

                {isLoading ? (
                    <p>Loading data...</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <div className="modal-field">
                            <label className="modal-label">Select Student</label>
                            <select
                                className="modal-input"
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                                <option value="">-- Choose Student --</option>
                                {studentsList.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.name} ({s.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted, #6b7280)" }}>
                            Need to enroll many students or Zen CRM leads?{" "}
                            <Link
                                to={`/admin/enroll?tab=bulk&batchId=${batchId}`}
                                onClick={onClose}
                                style={{ color: "#0FA958", fontWeight: 600 }}
                            >
                                Open bulk enrollment
                            </Link>
                            {" "}or{" "}
                            <Link
                                to={`/admin/enroll?tab=csv&batchId=${batchId}`}
                                onClick={onClose}
                                style={{ color: "#0FA958", fontWeight: 600 }}
                            >
                                CSV import
                            </Link>
                            .
                        </p>

                        <div className="modal-actions">
                            <button type="button" className="cancel-btn" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="button" className="create-btn" onClick={handleEnroll}>
                                Add Student
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddStudentToBatchModal;
