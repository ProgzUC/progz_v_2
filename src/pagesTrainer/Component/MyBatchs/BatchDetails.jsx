import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import './BatchDetails.css';
import { useTrainerBatchDetails, useToggleSectionCompletion } from '../../../hooks/useBatches';
import Loader from '../../../components/common/Loader/Loader';
import TrainerAttendancePanel from '../../components/attendance/TrainerAttendancePanel';
import AttendanceHistory from '../../components/attendance/AttendanceHistory';

const BatchDetails = ({ batch: initialBatch, onBack }) => {
    const [activeTab, setActiveTab] = useState('students');

    // Determine the ID to fetch. initialBatch might be the full object or just have an ID.
    // Different endpoints return different field names: _id, id, or batchId
    const batchId = initialBatch?._id || initialBatch?.id || initialBatch?.batchId;
    const { data: batchDetails, isLoading, isError, error } = useTrainerBatchDetails(batchId);
    const { mutate: toggleSection, isPending: isToggling, variables: togglingVariables } = useToggleSectionCompletion();

    if (!batchId) {
        return (
            <div className="batch-details-container">
                <div className="error-message">
                    <p>No batch ID found.</p>
                    <p>Received batch object: {JSON.stringify(initialBatch)}</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="batch-details-container">
                <Loader message="Loading batch details..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="batch-details-container">
                <div className="error-message">
                    <p>Error loading batch details.</p>
                    <p>Batch ID: {batchId}</p>
                    <p>Error: {error?.message || 'Unknown error'}</p>
                </div>
            </div>
        );
    }

    if (!batchDetails) {
        return (
            <div className="batch-details-container">
                <div className="error-message">
                    <p>Batch not found.</p>
                    <p>Batch ID: {batchId}</p>
                </div>
            </div>
        );
    }

    // Handle response structure from getTrainerBatchDetails controller
    // Response is flat: { batchId, batchName, curriculum, students, ... }
    const batch = batchDetails;

    // Controller returns 'students' and 'curriculum' (modules) at root level
    const students = batch.students || [];
    const modules = batch.curriculum || [];

    // Get trainer's assigned modules
    const assignedModules = batch.trainerAssignment?.assignedModules || [];

    // Controller doesn't return 'course' object, but 'courseName'
    // So we don't need 'const course = ...' anymore for modules

    // Flatten sections for the right column view and map progress
    // FILTER: Only show sections from modules assigned to this trainer
    const allSections = [];
    modules.forEach((mod, modIdx) => {
        // Only include modules assigned to this trainer
        if (!assignedModules.includes(modIdx)) return;

        (mod.sections || []).forEach((sec, secIdx) => {
            // Find progress
            const progress = batch.sectionProgress?.find(
                p => p.moduleIndex === modIdx && p.sectionIndex === secIdx
            );

            allSections.push({
                moduleIndex: modIdx,
                sectionIndex: secIdx,
                uniqueId: `m${modIdx}-s${secIdx}`,
                title: sec.sectionName || sec.title,
                moduleTitle: mod.title,
                completed: progress?.isCompleted || false,
                date: progress?.completionTime ? new Date(progress.completionTime).toLocaleDateString() : null,
                instructor: progress?.completedBy || null
            });
        });
    });

    // Calculate progress
    const totalSections = allSections.length;
    const completedSections = allSections.filter(s => s.completed).length;
    const progressPercentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="batch-details-container">
            <header className="details-header">
                <button type="button" className="trainer-back-btn" onClick={onBack}>
                    <span className="trainer-back-btn-circle"><FaArrowLeft /></span>
                    <span className="trainer-back-btn-label">Back to Batches</span>
                </button>
                <div className="details-header-row">
                    <h1 className="header-title">{batch.batchName}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {batch.meetLink && (
                            <a 
                                href={batch.meetLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="join-class-btn"
                            >
                                <span className="btn-icon-wrapper">
                                    <i className="bi bi-camera-video-fill"></i>
                                </span>
                                Join Class
                            </a>
                        )}
                        <span className={`status-badge ${batch.status?.toLowerCase() || 'active'}`}>{batch.status || 'Active'}</span>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="batch-tabs">
                <button
                    className={`batch-tab ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                >
                    <i className="bi bi-people-fill"></i>
                    Students
                </button>
                <button
                    className={`batch-tab ${activeTab === 'sections' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sections')}
                >
                    <i className="bi bi-journal-text"></i>
                    Sections
                </button>
                <button
                    className={`batch-tab ${activeTab === 'attendance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('attendance')}
                >
                    <i className="bi bi-calendar-check"></i>
                    Attendance
                </button>
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon-container date">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Start Date</span>
                        <span className="stat-value">{formatDate(batch.startDate)}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-container schedule">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Schedule</span>
                        <div className="stat-value">
                            {batch.daysOfWeek && batch.daysOfWeek.length > 0 
                                ? batch.daysOfWeek.map(d => d.substring(0, 3)).join(', ') 
                                : 'No schedule set'}
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-container students">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Students</span>
                        <span className="stat-value">{students.length} Enrolled</span>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'students' && (
                <section className="students-section">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Batch Students</h2>
                            <p className="section-subtitle">Manage student details and attendance</p>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>E-mail</th>
                                    <th>Mobile No</th>
                                    <th>Qualification</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? (
                                    students.map((student, idx) => (
                                        <tr key={student._id || idx}>
                                            <td>{student.name || student.firstName}</td>
                                            <td>{student.email}</td>
                                            <td>{student.phone || student.mobile || 'N/A'}</td>
                                            <td>
                                                <div className="qualification-col">
                                                    <span>{student.education || 'Not specified'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                            No students enrolled yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeTab === 'sections' && (
                <div className="sections-tab-layout">
                    <div className="curriculum-col">
                        <div className="column-header">
                            <h2 className="section-title">Curriculum</h2>
                            <span className="badge-outline">{modules.length} Modules Total</span>
                        </div>
                    </div>

                    <div className="sections-col">
                        <div className="sections-card">
                            <div className="column-header">
                                <div className="header-left">
                                    <div className="check-icon-bg">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <h2 className="section-title">Sections</h2>
                                </div>
                                <div className="header-right">
                                    <span className="percent-text">{progressPercentage}%</span>
                                    <span className="completed-label">Completed</span>
                                </div>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                            </div>

                            <div className="section-items-list">
                                {allSections.length > 0 ? (
                                    allSections.map((item) => {
                                        const isThisSectionToggling = isToggling && togglingVariables?.moduleIndex === item.moduleIndex && togglingVariables?.sectionIndex === item.sectionIndex;
                                        return (
                                        <div key={item.uniqueId} className={`section-item ${item.completed ? 'completed' : ''} ${isThisSectionToggling ? 'section-item-toggling' : ''}`}>
                                            <div
                                                className="item-radio"
                                                onClick={(e) => {
                                                    if (isThisSectionToggling) return;
                                                    e.stopPropagation();
                                                    toggleSection({
                                                        batchId,
                                                        moduleIndex: item.moduleIndex,
                                                        sectionIndex: item.sectionIndex
                                                    }, {
                                                        onError: (error) => {
                                                            alert(`Failed to toggle: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
                                                        }
                                                    });
                                                }}
                                                style={{ cursor: isThisSectionToggling ? 'wait' : 'pointer' }}
                                            >
                                                {isThisSectionToggling ? (
                                                    <div className="item-radio-loader" aria-hidden="true"></div>
                                                ) : item.completed ? (
                                                    <div className="radio-check active">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    </div>
                                                ) : (
                                                    <div className="radio-check"></div>
                                                )}
                                            </div>
                                            <div className="item-content">
                                                <span style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>{item.moduleTitle}</span>
                                                <h3 className="item-title">{item.title}</h3>
                                                {item.completed && (
                                                    <div className="completed-info">
                                                        <p className="completed-date">Completed on {item.date}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        );
                                    })
                                ) : (
                                    <p className="empty-message">No sections found in your assigned modules.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'attendance' && (
                <div className="attendance-tab-content">
                    <TrainerAttendancePanel batch={batchDetails} />
                    <AttendanceHistory batchId={batchId} />
                </div>
            )}
        </div>
    );
};

export default BatchDetails;

