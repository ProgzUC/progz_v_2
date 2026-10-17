import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAllUsers } from "../../../hooks/useAdminUsers";
import { useEnrollStudent } from "../../../hooks/useBatches";
import AppSelect from "../../../components/common/AppSelect/AppSelect";
import ModalPortal from "../../../components/common/ModalPortal";
import "../Modal.css";

import { showError, showSuccess } from "../../../utils/toast";

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
            showError("Please select a student");
            return;
        }
        if (!batch.course && !(Array.isArray(batch.courses) && batch.courses.length)) {
            showError("Batch does not have a valid course linked");
            return;
        }

        const payload = {
            batchId,
            studentId: selectedStudentId,
        };

        enrollStudentMutation(payload, {
            onSuccess: () => {
                showSuccess("Student Added to Batch Successfully!");
                onClose();
                setSelectedStudentId("");
            },
            onError: (err) => {
                showError(err.response?.data?.message || err.response?.data?.msg || "Enrollment failed");
            },
        });
    };

    return (
        <ModalPortal>
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
        </ModalPortal>
    );
};

export default AddStudentToBatchModal;
