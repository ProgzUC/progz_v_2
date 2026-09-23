import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAllUsers } from "../../../hooks/useAdminUsers";
import { useEnrollStudent } from "../../../hooks/useBatches";
import AppSelect from "../../../components/common/AppSelect/AppSelect";
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
        if (!batch.course && !(Array.isArray(batch.courses) && batch.courses.length)) {
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
                            <AppSelect
                                className="modal-input"
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                aria-label="Select Student"
                                icon="bi-person"
                                options={[
                                    { value: "", label: "-- Choose Student --" },
                                    ...studentsList.map((s) => ({
                                        value: s._id,
                                        label: `${s.name} (${s.email})`,
                                    })),
                                ]}
                            />
                        </div>

                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted, #718096)" }}>
                            Need a college email list?{" "}
                            <Link
                                to={`/admin/enroll?tab=import&batchId=${batchId}`}
                                onClick={onClose}
                                style={{ color: "#10A879", fontWeight: 600 }}
                            >
                                Import & invite
                            </Link>
                            {" · "}
                            <Link
                                to={`/admin/enroll?tab=bulk&batchId=${batchId}`}
                                onClick={onClose}
                                style={{ color: "#10A879", fontWeight: 600 }}
                            >
                                Bulk select existing
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
