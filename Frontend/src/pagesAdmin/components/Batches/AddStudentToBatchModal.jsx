import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAllUsers } from "../../../hooks/useAdminUsers";
import { useEnrollStudent } from "../../../hooks/useBatches";
import ModalPortal from "../../../components/common/ModalPortal";
import StudentCombobox from "./StudentCombobox";
import "../Modal.css";
import "./AddStudentToBatchModal.css";

import { showError, showSuccess } from "../../../utils/toast";

const AddStudentToBatchModal = ({ batch, isOpen, onClose }) => {
    const [selectedStudentId, setSelectedStudentId] = useState("");

    const { data: users, isLoading } = useAllUsers();
    const { mutate: enrollStudentMutation, isPending } = useEnrollStudent();

    useEffect(() => {
        if (!isOpen) setSelectedStudentId("");
    }, [isOpen]);

    const studentsList = useMemo(() => {
        const usersArray = Array.isArray(users) ? users : [];
        return usersArray.filter((u) => (u.role || "").toLowerCase() === "student");
    }, [users]);

    if (!isOpen || !batch) return null;

    const batchId = batch._id || batch.id;

    const handleEnroll = () => {
        if (!selectedStudentId) {
            showError("Please select a student");
            return;
        }
        if (!batch.course && !(Array.isArray(batch.courses) && batch.courses.length)) {
            showError("Batch does not have a valid course linked");
            return;
        }

        enrollStudentMutation(
            { batchId, studentId: selectedStudentId },
            {
                onSuccess: () => {
                    showSuccess("Student Added to Batch Successfully!");
                    onClose();
                    setSelectedStudentId("");
                },
                onError: (err) => {
                    showError(
                        err.response?.data?.message ||
                            err.response?.data?.msg ||
                            "Enrollment failed"
                    );
                },
            }
        );
    };

    return (
        <ModalPortal>
            <div className="modal-overlay" onClick={onClose}>
                <div
                    className="modal-content asb-modal"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="asb-header">
                        <div>
                            <p className="asb-eyebrow">Enroll student</p>
                            <h3 className="modal-title asb-title">{batch.name}</h3>
                        </div>
                        <button
                            type="button"
                            className="modal-close-btn"
                            aria-label="Close"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>

                    {isLoading ? (
                        <p className="asb-loading">Loading students…</p>
                    ) : (
                        <div className="asb-body">
                            <div className="asb-field">
                                <label className="modal-label" htmlFor="asb-combo-input">
                                    Student
                                </label>
                                <StudentCombobox
                                    id="asb-combo-input"
                                    students={studentsList}
                                    value={selectedStudentId}
                                    onChange={setSelectedStudentId}
                                    placeholder="Search by name or email…"
                                />
                            </div>

                            <p className="asb-hint">
                                Need a college email list?{" "}
                                <Link
                                    to={`/admin/enroll?tab=import&batchId=${batchId}`}
                                    onClick={onClose}
                                >
                                    Import & invite
                                </Link>
                                {" · "}
                                <Link
                                    to={`/admin/enroll?tab=bulk&batchId=${batchId}`}
                                    onClick={onClose}
                                >
                                    Bulk select existing
                                </Link>
                            </p>

                            <div className="asb-actions">
                                <button type="button" className="asb-btn asb-btn-ghost" onClick={onClose}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="asb-btn asb-btn-primary"
                                    onClick={handleEnroll}
                                    disabled={!selectedStudentId || isPending}
                                >
                                    {isPending ? "Adding…" : "Add to batch"}
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
