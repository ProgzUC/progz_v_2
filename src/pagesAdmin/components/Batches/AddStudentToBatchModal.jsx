import React, { useState } from "react";
import Swal from "sweetalert2";
import { useAllUsers } from "../../../hooks/useAdminUsers";
import { useEnrollStudent } from "../../../hooks/useBatches";
import "../Modal.css";

const AddStudentToBatchModal = ({ batch, isOpen, onClose }) => {
    const [selectedStudentId, setSelectedStudentId] = useState("");

    // Fetch users for the student dropdown
    const { data: users, isLoading } = useAllUsers();

    const { mutate: enrollStudentMutation } = useEnrollStudent();

    if (!isOpen || !batch) return null;

    // Filter students
    const usersArray = Array.isArray(users) ? users : [];
    const studentsList = usersArray.filter(u => (u.role || "").toLowerCase() === "student");

    const handleEnroll = () => {
        if (!selectedStudentId) {
            Swal.fire("Error", "Please select a student", "error");
            return;
        }
        if (!batch.course) {
            Swal.fire("Error", "Batch does not have a valid course linked", "error");
            return;
        }

        // Simplified payload for updated API
        const payload = {
            batchId: batch._id || batch.id,
            studentId: selectedStudentId
        };

        enrollStudentMutation(payload, {
            onSuccess: () => {
                Swal.fire("Success", "Student Added to Batch Successfully!", "success");
                onClose();
                setSelectedStudentId("");
            },
            onError: (err) => {
                Swal.fire("Error", err.response?.data?.message || "Enrollment failed", "error");
            }
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <h3 className="modal-title">Add Student to {batch.name}</h3>

                {isLoading ? (
                    <p>Loading data...</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="modal-field">
                            <label className="modal-label">Select Student</label>
                            <select
                                className="modal-input"
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                                <option value="">-- Choose Student --</option>
                                {studentsList.map(s => (
                                    <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={onClose}>Cancel</button>
                            <button className="create-btn" onClick={handleEnroll}>
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
