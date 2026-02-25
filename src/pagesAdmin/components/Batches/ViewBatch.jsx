import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBatch } from "../../../hooks/useBatches";
import { useCourse } from "../../../hooks/useCourses";
import Loader from "../../../components/common/Loader/Loader";
import { FaArrowLeft, FaUsers, FaChalkboardTeacher, FaBook, FaCalendar, FaClock, FaVideo, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./ViewBatch.css";

const ViewBatch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: batch, isLoading, isError } = useBatch(id);
    const { data: course } = useCourse(batch?.course?._id || batch?.course);

    const [expandedModules, setExpandedModules] = useState({});

    const toggleModule = (moduleIndex) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleIndex]: !prev[moduleIndex]
        }));
    };

    const getStatusClass = (status) => {
        const s = (status || "").toLowerCase();
        switch (s) {
            case "active": return "status-active";
            case "completed": return "status-completed";
            case "upcoming": return "status-upcoming";
            default: return "";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTrainerForModule = (moduleIndex) => {
        if (!batch?.trainers) return null;
        const trainer = batch.trainers.find(t =>
            t.assignedModules && t.assignedModules.includes(moduleIndex)
        );
        return trainer?.trainer;
    };

    const getSectionCompletion = (moduleIndex, sectionIndex) => {
        if (!batch?.sectionProgress) return null;
        return batch.sectionProgress.find(
            p => p.moduleIndex === moduleIndex && p.sectionIndex === sectionIndex
        );
    };

    const getTrainerName = (trainerId) => {
        if (!trainerId) return "Unknown";
        if (typeof trainerId === 'object') return trainerId.name || trainerId.email || "Unknown";
        // If it's just an ID, we'd need to look it up - for now return ID
        return trainerId;
    };

    if (isLoading) return <Loader />;
    if (isError || !batch) return <div className="error-message">Failed to load batch details.</div>;

    return (
        <div className="view-batch-page">
            {/* Header */}
            <div className="view-batch-header">
                <button className="back-btn" onClick={() => navigate('/admin/batches')}>
                    <FaArrowLeft /> Back to Batches
                </button>
                <div className="header-title">
                    <h1>{batch.name}</h1>
                    <span className={`status-badge ${getStatusClass(batch.status)}`}>
                        <span className="dot"></span>
                        {batch.status || "Unknown"}
                    </span>
                </div>
            </div>

            <div className="batch-cards-grid">
                {/* Batch Details Card */}
                <div className="view-batch-card">
                    <h2 className="card-title"><FaBook /> Batch Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Course:</span>
                            <span className="info-value">{batch.course?.courseName || "—"}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label"><FaCalendar /> Start Date:</span>
                            <span className="info-value">{formatDate(batch.startDate)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label"><FaCalendar /> End Date:</span>
                            <span className="info-value">{formatDate(batch.endDate)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label"><FaClock /> Class Timing:</span>
                            <span className="info-value">
                                {batch.classTiming?.startTime} - {batch.classTiming?.endTime}
                                {batch.classTiming?.timezone && ` (${batch.classTiming.timezone})`}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Days:</span>
                            <span className="info-value">
                                {batch.daysOfWeek?.join(", ") || "—"}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label"><FaVideo /> Meet Link:</span>
                            <span className="info-value">
                                {batch.meetLink ? (
                                    <a href={batch.meetLink} target="_blank" rel="noopener noreferrer">
                                        Join Meeting
                                    </a>
                                ) : "—"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Trainers Card */}
                <div className="view-batch-card">
                    <h2 className="card-title"><FaChalkboardTeacher /> Trainers</h2>
                    {batch.trainers && batch.trainers.length > 0 ? (
                        <div className="trainers-list">
                            {batch.trainers.map((t, idx) => (
                                <div key={idx} className="trainer-item">
                                    <div className="trainer-header">
                                        <div className="trainer-avatar">
                                            {getTrainerName(t.trainer).charAt(0).toUpperCase()}
                                        </div>
                                        <div className="trainer-info">
                                            <h3>{getTrainerName(t.trainer)}</h3>
                                            <div className="trainer-meta">
                                                {t.fromDate && <span>From: {formatDate(t.fromDate)}</span>}
                                                {t.toDate && <span>To: {formatDate(t.toDate)}</span>}
                                                {t.isCurrent && <span className="current-badge">Current</span>}
                                            </div>
                                        </div>
                                    </div>
                                    {t.assignedModules && t.assignedModules.length > 0 && course?.modules && (
                                        <div className="assigned-modules">
                                            <strong>Assigned Modules:</strong>
                                            <ul>
                                                {t.assignedModules.map(modIdx => (
                                                    <li key={modIdx}>
                                                        {course.modules[modIdx]?.title || `Module ${modIdx + 1}`}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-message">No trainers assigned yet.</p>
                    )}
                </div>
            </div>

            {/* Course Content Card */}
            {course?.modules && course.modules.length > 0 && (
                <div className="view-batch-card">
                    <h2 className="card-title"><FaBook /> Course Content & Progress</h2>
                    <div className="modules-list">
                        {course.modules.map((module, modIdx) => {
                            const trainer = getTrainerForModule(modIdx);
                            const isExpanded = expandedModules[modIdx];

                            return (
                                <div key={modIdx} className="module-item">
                                    <div
                                        className="module-header"
                                        onClick={() => toggleModule(modIdx)}
                                    >
                                        <div className="module-title-section">
                                            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                                            <h3>Module {modIdx + 1}: {module.title}</h3>
                                        </div>
                                        {trainer && (
                                            <div className="module-trainer">
                                                <FaChalkboardTeacher />
                                                <span>{getTrainerName(trainer)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {isExpanded && (
                                        <div className="module-content">
                                            {module.description && (
                                                <p className="module-description">{module.description}</p>
                                            )}

                                            {module.sections && module.sections.length > 0 && (
                                                <div className="sections-list">
                                                    <h4>Sections:</h4>
                                                    {module.sections.map((section, secIdx) => {
                                                        const completion = getSectionCompletion(modIdx, secIdx);
                                                        const isCompleted = completion?.isCompleted;
                                                        const sectionTitle = typeof section === 'object' ? (section.title || section.name || section.sectionName || "Untitled Section") : section;

                                                        return (
                                                            <div key={secIdx} className={`section-item ${isCompleted ? 'completed' : ''}`}>
                                                                <div className="section-header">
                                                                    <div className="section-title">
                                                                        {isCompleted ? (
                                                                            <FaCheckCircle className="status-icon completed" />
                                                                        ) : (
                                                                            <FaTimesCircle className="status-icon pending" />
                                                                        )}
                                                                        <span>{sectionTitle}</span>
                                                                    </div>
                                                                    {isCompleted && completion && (
                                                                        <div className="completion-info">
                                                                            <span className="completed-by">
                                                                                By: {getTrainerName(completion.completedBy)}
                                                                            </span>
                                                                            <span className="completed-date">
                                                                                {formatDateTime(completion.completionTime)}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Students Card */}
            <div className="view-batch-card">
                <h2 className="card-title"><FaUsers /> Enrolled Students ({batch.students?.length || 0})</h2>
                {batch.students && batch.students.length > 0 ? (
                    <div className="students-grid">
                        {batch.students.map((student, idx) => (
                            <div key={idx} className="student-card">
                                <div className="student-avatar">
                                    {(typeof student === 'object' ? student.name : 'S').charAt(0).toUpperCase()}
                                </div>
                                <div className="student-info">
                                    <h4>{typeof student === 'object' ? student.name : student}</h4>
                                    {typeof student === 'object' && student.email && (
                                        <span className="student-email">{student.email}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-message">No students enrolled yet.</p>
                )}
            </div>
        </div>
    );
};

export default ViewBatch;
