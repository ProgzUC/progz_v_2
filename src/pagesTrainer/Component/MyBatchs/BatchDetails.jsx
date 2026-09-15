import React, { useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import './BatchDetails.css';
import { useTrainerBatchDetails, useToggleSectionCompletion } from '../../../hooks/useBatches';
import Loader from '../../../components/common/Loader/Loader';
import TrainerAttendancePanel from '../../components/attendance/TrainerAttendancePanel';
import AttendanceHistory from '../../components/attendance/AttendanceHistory';

const BatchDetails = ({ batch: initialBatch, onBack }) => {
    const [activeTab, setActiveTab] = useState('students');

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

    return (
        <BatchDetailsContent
            batch={batchDetails}
            batchId={batchId}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onBack={onBack}
            toggleSection={toggleSection}
            isToggling={isToggling}
            togglingVariables={togglingVariables}
        />
    );
};

const BatchDetailsContent = ({
    batch,
    batchId,
    activeTab,
    setActiveTab,
    onBack,
    toggleSection,
    isToggling,
    togglingVariables,
}) => {
    const students = batch.students || [];
    const assignedModules = batch.trainerAssignment?.assignedModules || [];
    const primaryCourseId = String(batch.primaryCourseId || "");

    const curricula = useMemo(() => {
        if (Array.isArray(batch.curricula) && batch.curricula.length) {
            return batch.curricula;
        }
        return [{
            courseId: batch.primaryCourseId,
            courseName: batch.courseName,
            modules: batch.curriculum || [],
        }];
    }, [batch]);

    const allSections = useMemo(() => {
        const rows = [];
        curricula.forEach((course) => {
            const courseId = String(course.courseId || "");
            const isPrimary = courseId && courseId === primaryCourseId;
            const modules = course.modules || [];

            modules.forEach((mod, modIdx) => {
                if (isPrimary && assignedModules.length > 0 && !assignedModules.includes(modIdx)) {
                    return;
                }

                (mod.sections || []).forEach((sec, secIdx) => {
                    const progress = (batch.sectionProgress || []).find((p) => {
                        if (Number(p.moduleIndex) !== modIdx || Number(p.sectionIndex) !== secIdx) {
                            return false;
                        }
                        const entryCourseId = p.courseId ? String(p.courseId) : null;
                        if (entryCourseId) return entryCourseId === courseId;
                        return isPrimary;
                    });

                    rows.push({
                        courseId,
                        courseName: course.courseName || "Course",
                        moduleIndex: modIdx,
                        sectionIndex: secIdx,
                        uniqueId: `${courseId}-m${modIdx}-s${secIdx}`,
                        title: sec.sectionName || sec.title,
                        moduleTitle: mod.title || mod.moduleName || `Module ${modIdx + 1}`,
                        completed: !!progress?.isCompleted,
                        date: progress?.completionTime
                            ? new Date(progress.completionTime).toLocaleDateString()
                            : null,
                    });
                });
            });
        });
        return rows;
    }, [curricula, assignedModules, batch.sectionProgress, primaryCourseId]);

    const totalSections = allSections.length;
    const completedSections = allSections.filter((s) => s.completed).length;
    const progressPercentage = totalSections > 0
        ? Math.round((completedSections / totalSections) * 100)
        : 0;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const moduleCount = curricula.reduce((acc, c) => acc + (c.modules?.length || 0), 0);

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
                            <span className="badge-outline">{moduleCount} Modules · {curricula.length} Courses</span>
                        </div>
                        <div className="curriculum-course-list">
                            {curricula.map((course) => (
                                <div key={String(course.courseId)} className="curriculum-course-card">
                                    <h3 className="curriculum-course-name">{course.courseName}</h3>
                                    <ul>
                                        {(course.modules || []).map((mod, idx) => (
                                            <li key={`${course.courseId}-mod-${idx}`}>
                                                {mod.title || mod.moduleName || `Module ${idx + 1}`}
                                                <span className="mod-sec-count">
                                                    {(mod.sections || []).length} sections
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sections-col">
                        <div className="sections-card">
                            <div className="column-header">
                                <div className="header-left">
                                    <div className="check-icon-bg">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <h2 className="section-title">Lock / Unlock Sections</h2>
                                </div>
                                <div className="header-right">
                                    <span className="percent-text">{progressPercentage}%</span>
                                    <span className="completed-label">Unlocked</span>
                                </div>
                            </div>
                            <p className="sections-help-text">
                                Tap the circle to unlock a section for students. Tap again to lock it.
                            </p>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                            </div>

                            <div className="section-items-list">
                                {allSections.length > 0 ? (
                                    allSections.map((item) => {
                                        const isThisSectionToggling =
                                            isToggling &&
                                            String(togglingVariables?.courseId || "") === String(item.courseId || "") &&
                                            togglingVariables?.moduleIndex === item.moduleIndex &&
                                            togglingVariables?.sectionIndex === item.sectionIndex;
                                        return (
                                            <div
                                                key={item.uniqueId}
                                                className={`section-item ${item.completed ? 'completed' : ''} ${isThisSectionToggling ? 'section-item-toggling' : ''}`}
                                            >
                                                <div
                                                    className="item-radio"
                                                    onClick={(e) => {
                                                        if (isThisSectionToggling) return;
                                                        e.stopPropagation();
                                                        toggleSection({
                                                            batchId,
                                                            courseId: item.courseId,
                                                            moduleIndex: item.moduleIndex,
                                                            sectionIndex: item.sectionIndex,
                                                        }, {
                                                            onError: (err) => {
                                                                alert(`Failed to toggle: ${err?.response?.data?.message || err?.message || 'Unknown error'}`);
                                                            }
                                                        });
                                                    }}
                                                    style={{ cursor: isThisSectionToggling ? 'wait' : 'pointer' }}
                                                    title={item.completed ? "Click to lock section" : "Click to unlock section"}
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
                                                    <span style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>
                                                        {item.courseName} · {item.moduleTitle}
                                                    </span>
                                                    <h3 className="item-title">{item.title}</h3>
                                                    <div className="completed-info">
                                                        <p className="completed-date">
                                                            {item.completed
                                                                ? `Unlocked${item.date ? ` on ${item.date}` : ""}`
                                                                : "Locked for students"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="empty-message">No sections found. Assign modules or add courses to this batch.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'attendance' && (
                <div className="attendance-tab-content">
                    <TrainerAttendancePanel batch={batch} />
                    <AttendanceHistory batchId={batchId} />
                </div>
            )}
        </div>
    );
};

export default BatchDetails;
