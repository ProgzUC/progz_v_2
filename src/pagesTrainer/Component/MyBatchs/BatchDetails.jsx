import React, { useEffect, useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import './BatchDetails.css';
import { useTrainerBatchDetails, useToggleSectionCompletion } from '../../../hooks/useBatches';
import { useJoinClass } from '../../../hooks/useClassSession';
import Loader from '../../../components/common/Loader/Loader';
import TrainerAttendancePanel from '../../components/attendance/TrainerAttendancePanel';
import AttendanceHistory from '../../components/attendance/AttendanceHistory';
import Swal from 'sweetalert2';

const BatchDetails = ({ batch: initialBatch, onBack }) => {
    const [activeTab, setActiveTab] = useState('students');

    const batchId = initialBatch?._id || initialBatch?.id || initialBatch?.batchId;
    const { data: batchDetails, isLoading, isError, error } = useTrainerBatchDetails(batchId);
    const { mutate: toggleSection, isPending: isToggling, variables: togglingVariables } = useToggleSectionCompletion();
    const joinClassMutation = useJoinClass();

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
            joinClassMutation={joinClassMutation}
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
    joinClassMutation,
}) => {
    const students = batch.students || [];
    const assignedModules = batch.trainerAssignment?.assignedModules || [];
    const primaryCourseId = String(batch.primaryCourseId || "");
    const [selectedCourseId, setSelectedCourseId] = useState("");

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

    const courseOptions = useMemo(() => {
        return curricula
            .map((course) => ({
                courseId: String(course.courseId || ""),
                courseName: course.courseName || "Course",
            }))
            .filter((course) => course.courseId);
    }, [curricula]);

    useEffect(() => {
        if (!courseOptions.length) {
            setSelectedCourseId("");
            return;
        }
        const stillValid = courseOptions.some((c) => c.courseId === selectedCourseId);
        if (stillValid) return;
        const preferred = courseOptions.find((c) => c.courseId === primaryCourseId);
        setSelectedCourseId(preferred?.courseId || courseOptions[0].courseId);
    }, [courseOptions, primaryCourseId, selectedCourseId]);

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

    const filteredSections = useMemo(() => {
        if (!selectedCourseId) return allSections;
        return allSections.filter((s) => s.courseId === selectedCourseId);
    }, [allSections, selectedCourseId]);

    const sectionsByModule = useMemo(() => {
        const groups = [];
        const indexByModule = new Map();

        filteredSections.forEach((item) => {
            const key = `${item.courseId}-${item.moduleIndex}`;
            if (!indexByModule.has(key)) {
                indexByModule.set(key, groups.length);
                groups.push({
                    key,
                    moduleTitle: item.moduleTitle,
                    sections: [],
                });
            }
            groups[indexByModule.get(key)].sections.push(item);
        });

        return groups;
    }, [filteredSections]);

    const totalSections = filteredSections.length;
    const completedSections = filteredSections.filter((s) => s.completed).length;
    const progressPercentage = totalSections > 0
        ? Math.round((completedSections / totalSections) * 100)
        : 0;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleJoinClass = async (e) => {
        e.preventDefault();
        if (!batchId || joinClassMutation.isPending) return;

        try {
            const result = await joinClassMutation.mutateAsync(batchId);
            if (result?.meetLink) {
                window.open(result.meetLink, "_blank", "noopener,noreferrer");
            }
            setActiveTab("attendance");
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Could not join class",
                text: err.response?.data?.message || err.message || "Failed to join class",
            });
        }
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
                            <button
                                type="button"
                                className="join-class-btn"
                                onClick={handleJoinClass}
                                disabled={joinClassMutation.isPending}
                            >
                                <span className="btn-icon-wrapper">
                                    <i className="bi bi-camera-video-fill"></i>
                                </span>
                                {joinClassMutation.isPending ? "Joining..." : "Join Class"}
                            </button>
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
                    Lock / Unlock
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
                            <p className="section-subtitle">Everyone enrolled in this batch</p>
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
                                            <td data-label="Name">{student.name || student.firstName}</td>
                                            <td data-label="E-mail">{student.email}</td>
                                            <td data-label="Mobile">{student.phone || student.mobile || 'N/A'}</td>
                                            <td data-label="Qualification">
                                                <div className="qualification-col">
                                                    <span>{student.education || 'Not specified'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="students-empty-cell">
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
                <div className="sections-tab-layout sections-tab-layout--single">
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
                                Choose a course below, then tap the circle next to a lesson to unlock it for students. Tap again to lock it.
                            </p>

                            {courseOptions.length > 1 && (
                                <div className="section-course-filters" role="tablist" aria-label="Filter by course">
                                    {courseOptions.map((course) => (
                                        <button
                                            key={course.courseId}
                                            type="button"
                                            role="tab"
                                            aria-selected={selectedCourseId === course.courseId}
                                            className={`section-course-filter ${selectedCourseId === course.courseId ? 'active' : ''}`}
                                            onClick={() => setSelectedCourseId(course.courseId)}
                                        >
                                            {course.courseName}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                            </div>

                            <div className="section-items-list">
                                {sectionsByModule.length > 0 ? (
                                    sectionsByModule.map((group) => (
                                        <div key={group.key} className="section-module-group">
                                            <h3 className="section-module-heading">{group.moduleTitle}</h3>
                                            {group.sections.map((item) => {
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
                                                            <h3 className="item-title">{item.title}</h3>
                                                            <div className="completed-info">
                                                                <span className={`section-status-chip ${item.completed ? 'is-unlocked' : 'is-locked'}`}>
                                                                    {item.completed
                                                                        ? `Unlocked${item.date ? ` · ${item.date}` : ""}`
                                                                        : "Locked for students"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))
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
