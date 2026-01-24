import React from "react";
import "./VersionHistory.css";
import Swal from "sweetalert2";

import { useCourseVersions } from "../../../hooks/useCourses";
import Loader from "../../../components/common/Loader/Loader";

const VersionHistory = ({ courseId, isOpen, onClose, onRollback }) => {
    const { data: versions, isLoading, isError } = useCourseVersions(courseId);

    if (!isOpen) return null;

    const handleRollbackClick = (version) => {
        Swal.fire({
            title: "Rollback to this version?",
            text: `Are you sure you want to revert to the version from ${new Date(version.createdAt).toLocaleString()}? Unsaved changes will be lost.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, rollback!",
            background: "#fff",
            color: "#333",
            borderRadius: "15px"
        }).then((result) => {
            if (result.isConfirmed) {
                onRollback(version._id); // Pass ID
                onClose();
            }
        });
    };

    return (
        <div className="vh-overlay" onClick={onClose}>
            <div className="vh-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="vh-header">
                    <h3>Version History</h3>
                    <button className="vh-close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="vh-list">
                    {isLoading ? (
                        <div style={{ padding: "20px" }}><Loader /></div>
                    ) : isError ? (
                        <div className="vh-empty">Error loading history</div>
                    ) : versions && versions.length > 0 ? (
                        versions.map((ver, idx) => (
                            <div key={ver._id} className={`vh-item ${idx === 0 ? "active" : ""}`}>
                                <div className="vh-timestamp">
                                    <i className="bi bi-clock-history"></i> {new Date(ver.snapshotDate || ver.createdAt).toLocaleString()}
                                </div>
                                <div className="vh-info">
                                    Version {ver.versionNumber}
                                </div>
                                <button
                                    className="vh-rollback-btn"
                                    onClick={() => handleRollbackClick(ver)}
                                >
                                    <i className="bi bi-arrow-counterclockwise"></i> Rollback
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="vh-empty">No history available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VersionHistory;
