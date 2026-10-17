import React from "react";
import "./VersionHistory.css";
import { confirmAction } from "../../../utils/confirmAction";
import ModalPortal from "../../../components/common/ModalPortal";

import { useCourseVersions } from "../../../hooks/useCourses";
import Loader from "../../../components/common/Loader/Loader";

const VersionHistory = ({ courseId, isOpen, onClose, onRollback }) => {
    const { data: versions, isLoading, isError } = useCourseVersions(courseId);

    if (!isOpen) return null;

    const handleRollbackClick = async (version) => {
        const ok = await confirmAction({
            title: "Rollback to this version?",
            text: `Are you sure you want to revert to the version from ${new Date(version.createdAt).toLocaleString()}? Unsaved changes will be lost.`,
            icon: "warning",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Yes, rollback!",
        });
        if (!ok) return;
        onRollback(version._id);
        onClose();
    };

    return (
        <ModalPortal>
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
        </ModalPortal>
    );
};

export default VersionHistory;
