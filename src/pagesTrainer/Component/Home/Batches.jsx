import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPeople, BsArrowRight, BsCheck2Square } from 'react-icons/bs';
import { BiVideo, BiCopy, BiPlus, BiBookOpen } from 'react-icons/bi';
import { HiOutlineClock, HiOutlineCalendar } from 'react-icons/hi';
import { useTrainerCourses } from '../../../hooks/useTrainerCourses';
import { showSuccess, showInfo } from '../../../utils/toast';
import './Batches.css';

function getBatchInitials(name = '') {
    const parts = String(name).trim().split(/[\s-_]+/).filter(Boolean);
    if (parts.length === 0) return 'B';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

const Active = ({ data }) => {
    const navigate = useNavigate();
    const batches = data?.activeBatches || [];
    const { data: courses } = useTrainerCourses();

    const recentCourse = (courses && courses.length > 0) ? courses[0] : null;

    // Pick upcoming class from data.upcomingClasses, or fall back to the first active batch
    const nextClass = (data?.upcomingClasses && data.upcomingClasses.length > 0)
        ? data.upcomingClasses[0]
        : (batches.length > 0 ? {
            batchId: batches[0].batchId,
            batchName: batches[0].batchName,
            courseName: batches[0].courseName,
            timing: batches[0].timing || 'Scheduled Session',
            meetLink: batches[0].meetLink,
            nextClassAt: null,
        } : null);

    const firstBatchId = batches[0]?.batchId;

    const handleCopyMeetLink = () => {
        const meetLink = nextClass?.meetLink || batches[0]?.meetLink;
        if (meetLink) {
            if (navigator?.clipboard?.writeText) {
                navigator.clipboard.writeText(meetLink)
                    .then(() => showSuccess('Meet link copied to clipboard!'))
                    .catch(() => showSuccess(`Meet link: ${meetLink}`));
            } else {
                showSuccess(`Meet link: ${meetLink}`);
            }
        } else {
            showInfo('No meet link available for active batch.');
        }
    };

    return (
        <section className="trainer-dashboard-split-layout">
            {/* Left Side (65% width): Active Batches + Recent Course Overview */}
            <div className="trainer-split-main">
                {/* Active Batches Section */}
                <div className="trainer-home-batches-card">
                    <div className="batches-head">
                        <div>
                            <p className="batches-kicker">In progress</p>
                            <h2 className="batches-title">Active batches</h2>
                        </div>
                        <button
                            type="button"
                            className="batches-view-all"
                            onClick={() => navigate('/trainer-dashboard/batches')}
                        >
                            View all
                        </button>
                    </div>

                    {batches.length === 0 ? (
                        <p className="batches-empty">No active batch yet. They will appear here once a class is assigned to you.</p>
                    ) : (
                        <div className="batches-batch-grid">
                            {batches.map((batch) => {
                                const pct = Number(batch.completionPercentage) || 0;
                                const students = Number(batch.studentsCount) || 0;

                                return (
                                    <div
                                        key={batch.batchId}
                                        className="batches-batch-card"
                                        onClick={() => {
                                            if (!batch.batchId) return;
                                            navigate(`/trainer-dashboard/batches/${batch.batchId}`);
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                navigate(`/trainer-dashboard/batches/${batch.batchId}`);
                                            }
                                        }}
                                        aria-label={`View ${batch.batchName}`}
                                    >
                                        <div className="batches-batch-head">
                                            <span className="batches-batch-avatar" aria-hidden="true">
                                                {getBatchInitials(batch.batchName)}
                                            </span>
                                            <div className="batches-batch-copy">
                                                <div className="batches-title-row">
                                                    <h3 className="batches-batch-title">{batch.batchName}</h3>
                                                    <span className="batches-status-pill active">
                                                        <span className="batches-status-dot" />
                                                        {batch.status ? batch.status.toUpperCase() : 'ACTIVE'}
                                                    </span>
                                                </div>
                                                {batch.courseName ? (
                                                    <p className="batches-course-name" title={batch.courseName}>{batch.courseName}</p>
                                                ) : null}
                                                <div className="batches-meta-row">
                                                    <div className="batches-batch-info-item">
                                                        <BsPeople className="meta-icon" />
                                                        <span>{students} {students === 1 ? 'Student' : 'Students'}</span>
                                                    </div>
                                                    {batch.timing && (
                                                        <div className="batches-batch-info-item">
                                                            <HiOutlineClock className="meta-icon" />
                                                            <span>{batch.timing}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="batches-progress-container">
                                            <div className="batches-progress-label">
                                                <span>Avg. Completion</span>
                                                <span className="batches-progress-value">{pct}%</span>
                                            </div>
                                            <div className="batches-progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                                                <div className="batches-progress-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>

                                        <div className="batches-card-footer">
                                            <span className="batches-open-btn">
                                                <span>Open batch</span>
                                                <BsArrowRight />
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Course Overview Section */}
                <div className="trainer-overview-card recent-course-card">
                    <div className="overview-card-head">
                        <div>
                            <p className="overview-kicker">Course studio</p>
                            <h3 className="overview-title">Recent Course Overview</h3>
                        </div>
                        <button
                            type="button"
                            className="overview-link-btn"
                            onClick={() => navigate('/trainer-dashboard/courses')}
                        >
                            <span>All courses</span>
                            <BsArrowRight />
                        </button>
                    </div>

                    {recentCourse ? (
                        <div className="recent-course-body">
                            <div className="recent-course-main">
                                <div className="recent-course-icon-box">
                                    <BiBookOpen className="recent-course-icon" />
                                </div>
                                <div className="recent-course-details">
                                    <div className="recent-course-badge-row">
                                        <span className="recent-course-tag">Active Curriculum</span>
                                        {recentCourse.category && <span className="recent-course-cat">{recentCourse.category}</span>}
                                    </div>
                                    <h4 className="recent-course-title">{recentCourse.courseName}</h4>
                                    {recentCourse.courseDescription && (
                                        <p className="recent-course-desc">
                                            {String(recentCourse.courseDescription).replace(/<[^>]+>/g, '').slice(0, 110)}...
                                        </p>
                                    )}
                                    <div className="recent-course-stats-row">
                                        <span className="rc-stat-item">
                                            <strong className="rc-stat-num">{recentCourse.totalSections || 0}</strong> Sections
                                        </span>
                                        <span className="rc-stat-dot">•</span>
                                        <span className="rc-stat-item">
                                            <strong className="rc-stat-num">{recentCourse.totalStudents || 0}</strong> Students enrolled
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="recent-course-actions">
                                <button
                                    type="button"
                                    className="rc-action-btn primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/trainer-dashboard/courses/${recentCourse.courseId || recentCourse._id || recentCourse.id}`);
                                    }}
                                >
                                    <span>View Course</span>
                                    <BsArrowRight />
                                </button>
                                <button
                                    type="button"
                                    className="rc-action-btn secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/trainer-dashboard/courses/${recentCourse.courseId || recentCourse._id || recentCourse.id}/edit`);
                                    }}
                                >
                                    Edit Curriculum
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="recent-course-empty">
                            <div className="rc-empty-icon">
                                <BiBookOpen />
                            </div>
                            <div className="rc-empty-copy">
                                <h4>No courses created yet</h4>
                                <p>Build your first curriculum and start organizing modules for your batches.</p>
                            </div>
                            <button
                                type="button"
                                className="rc-create-btn"
                                onClick={() => navigate('/trainer-dashboard/courses/new')}
                            >
                                <BiPlus /> <span>Create Course</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side (35% width - Trainer Sidebar Widget): Widget 1 + Widget 2 */}
            <aside className="trainer-split-sidebar">
                {/* Widget 1: Next Live Class */}
                <div className="trainer-sidebar-widget next-class-widget">
                    <div className="widget-header">
                        <div className="widget-header-title">
                            <span className="widget-icon-pill video-pill">
                                <BiVideo />
                            </span>
                            <div>
                                <span className="widget-kicker">Live Session</span>
                                <h3 className="widget-title">Next Live Class</h3>
                            </div>
                        </div>
                        {nextClass && (
                            <span className="live-status-pill">
                                <span className="live-pulse-dot" />
                                Scheduled
                            </span>
                        )}
                    </div>

                    {nextClass ? (
                        <div className="next-class-content">
                            <div className="next-class-top-row">
                                <span className="next-class-batch-badge">{nextClass.batchName}</span>
                            </div>
                            {nextClass.courseName && (
                                <h4 className="next-class-topic" title={nextClass.courseName}>
                                    {nextClass.courseName}
                                </h4>
                            )}
                            <div className="next-class-time-box">
                                <HiOutlineClock className="time-box-icon" />
                                <div className="time-box-details">
                                    <span className="time-box-label">Class Schedule</span>
                                    <span className="time-box-value">{nextClass.timing || 'Daily Scheduled Session'}</span>
                                </div>
                            </div>

                            {nextClass.meetLink ? (
                                <a
                                    href={nextClass.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="join-meet-btn active"
                                >
                                    <BiVideo className="btn-icon" />
                                    <span>Join Live Class</span>
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    className="join-meet-btn disabled"
                                    disabled
                                    title="No Google Meet / Zoom link configured for this batch"
                                >
                                    <BiVideo className="btn-icon" />
                                    <span>Join Class (No Link)</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="next-class-empty">
                            <div className="empty-calendar-icon">
                                <HiOutlineCalendar />
                            </div>
                            <p className="empty-title">No upcoming live classes</p>
                            <p className="empty-sub">All clear for today. New scheduled classes will appear here automatically.</p>
                        </div>
                    )}
                </div>

                {/* Widget 2: Quick Actions */}
                <div className="trainer-sidebar-widget quick-actions-widget">
                    <div className="widget-header">
                        <div className="widget-header-title">
                            <span className="widget-icon-pill lightning-pill">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                            </span>
                            <div>
                                <span className="widget-kicker">Shortcuts</span>
                                <h3 className="widget-title">Quick Actions</h3>
                            </div>
                        </div>
                    </div>

                    <div className="quick-actions-grid">
                        <button
                            type="button"
                            className="quick-action-item"
                            onClick={() => {
                                if (firstBatchId) {
                                    navigate(`/trainer-dashboard/batches/${firstBatchId}`);
                                } else {
                                    navigate('/trainer-dashboard/batches');
                                }
                            }}
                        >
                            <div className="action-icon-wrap emerald">
                                <BsCheck2Square />
                            </div>
                            <div className="action-copy">
                                <span className="action-title">Mark Attendance</span>
                                <span className="action-desc">Update daily presence</span>
                            </div>
                            <span className="action-arrow">
                                <BsArrowRight />
                            </span>
                        </button>

                        <button
                            type="button"
                            className="quick-action-item"
                            onClick={() => navigate('/trainer-dashboard/courses/new')}
                        >
                            <div className="action-icon-wrap violet">
                                <BiPlus />
                            </div>
                            <div className="action-copy">
                                <span className="action-title">Create Course</span>
                                <span className="action-desc">Add new curriculum</span>
                            </div>
                            <span className="action-arrow">
                                <BsArrowRight />
                            </span>
                        </button>

                        <button
                            type="button"
                            className="quick-action-item"
                            onClick={() => navigate('/trainer-dashboard/courses')}
                        >
                            <div className="action-icon-wrap sky">
                                <BiBookOpen />
                            </div>
                            <div className="action-copy">
                                <span className="action-title">Course Studio</span>
                                <span className="action-desc">Browse all courses</span>
                            </div>
                            <span className="action-arrow">
                                <BsArrowRight />
                            </span>
                        </button>

                        <button
                            type="button"
                            className="quick-action-item"
                            onClick={handleCopyMeetLink}
                        >
                            <div className="action-icon-wrap teal">
                                <BiCopy />
                            </div>
                            <div className="action-copy">
                                <span className="action-title">Copy Meet Link</span>
                                <span className="action-desc">Share class invite</span>
                            </div>
                            <span className="action-arrow">
                                <BsArrowRight />
                            </span>
                        </button>
                    </div>
                </div>
            </aside>
        </section>
    );
};

export default Active;
