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
    const previewBatches = batches.slice(0, 4);

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
        <section className="trainer-dashboard-stack">
            {/* 1. Featured Live Session */}
            <article className="td-live">
                <header className="td-live-head">
                    <div className="td-live-brand">
                        <span className="td-live-icon" aria-hidden="true">
                            <BiVideo />
                        </span>
                        <div>
                            <p className="td-eyebrow">Live session</p>
                            <h2 className="td-section-title">Next live class</h2>
                        </div>
                    </div>
                    {nextClass ? (
                        <span className="td-live-badge">
                            <span className="td-live-dot" />
                            Scheduled
                        </span>
                    ) : null}
                </header>

                {nextClass ? (
                    <div className="td-live-body">
                        <div className="td-live-info">
                            <span className="td-live-batch">{nextClass.batchName}</span>
                            {nextClass.courseName ? (
                                <p className="td-live-course" title={nextClass.courseName}>
                                    {nextClass.courseName}
                                </p>
                            ) : null}
                            <div className="td-live-schedule">
                                <HiOutlineClock aria-hidden="true" />
                                <div>
                                    <span className="td-live-schedule-label">Class schedule</span>
                                    <strong>{nextClass.timing || 'Daily Scheduled Session'}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="td-live-actions">
                            {nextClass.meetLink ? (
                                <a
                                    href={nextClass.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="td-btn td-btn-primary"
                                >
                                    <BiVideo aria-hidden="true" />
                                    Join live class
                                </a>
                            ) : (
                                <button type="button" className="td-btn td-btn-muted" disabled>
                                    <BiVideo aria-hidden="true" />
                                    Meet link not set
                                </button>
                            )}
                            <button
                                type="button"
                                className="td-btn td-btn-ghost"
                                onClick={handleCopyMeetLink}
                            >
                                <BiCopy aria-hidden="true" />
                                Copy link
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="td-live-empty">
                        <HiOutlineCalendar aria-hidden="true" />
                        <div>
                            <strong>No upcoming live class</strong>
                            <p>You’re clear for now. Scheduled sessions will show up here.</p>
                        </div>
                    </div>
                )}
            </article>

            {/* 2. Active Batches */}
            <section className="td-panel">
                <header className="td-panel-head">
                    <div>
                        <p className="td-eyebrow">In progress</p>
                        <h2 className="td-section-title">Active batches</h2>
                    </div>
                    <button
                        type="button"
                        className="td-link-btn"
                        onClick={() => navigate('/trainer-dashboard/batches')}
                    >
                        View all
                        <BsArrowRight aria-hidden="true" />
                    </button>
                </header>

                {previewBatches.length === 0 ? (
                    <p className="td-empty-copy">
                        No active batch yet. Assigned classes will appear here.
                    </p>
                ) : (
                    <div className="td-batch-grid">
                        {previewBatches.map((batch) => {
                            const pct = Number(batch.completionPercentage) || 0;
                            const students = Number(batch.studentsCount) || 0;

                            return (
                                <button
                                    key={batch.batchId}
                                    type="button"
                                    className="td-batch-card"
                                    onClick={() => {
                                        if (!batch.batchId) return;
                                        navigate(`/trainer-dashboard/batches/${batch.batchId}`);
                                    }}
                                    aria-label={`Open ${batch.batchName}`}
                                >
                                    <div className="td-batch-top">
                                        <span className="td-batch-avatar" aria-hidden="true">
                                            {getBatchInitials(batch.batchName)}
                                        </span>
                                        <div className="td-batch-copy">
                                            <div className="td-batch-title-row">
                                                <h3>{batch.batchName}</h3>
                                                <span className="td-status">Active</span>
                                            </div>
                                            {batch.courseName ? (
                                                <p title={batch.courseName}>{batch.courseName}</p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="td-batch-meta">
                                        <span>
                                            <BsPeople aria-hidden="true" />
                                            {students} {students === 1 ? 'student' : 'students'}
                                        </span>
                                        {batch.timing ? (
                                            <span>
                                                <HiOutlineClock aria-hidden="true" />
                                                {batch.timing}
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="td-batch-progress">
                                        <div className="td-batch-progress-label">
                                            <span>Completion</span>
                                            <strong>{pct}%</strong>
                                        </div>
                                        <div
                                            className="td-batch-bar"
                                            role="progressbar"
                                            aria-valuenow={pct}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        >
                                            <span style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>

                                    <span className="td-batch-go">
                                        Open batch
                                        <BsArrowRight aria-hidden="true" />
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* 3. Quick Actions */}
            <section className="td-panel td-actions-panel">
                <header className="td-panel-head td-panel-head--compact">
                    <div>
                        <p className="td-eyebrow">Shortcuts</p>
                        <h2 className="td-section-title">Quick actions</h2>
                    </div>
                </header>

                <div className="td-actions-grid">
                    <button
                        type="button"
                        className="td-action"
                        onClick={() => {
                            if (firstBatchId) navigate(`/trainer-dashboard/batches/${firstBatchId}`);
                            else navigate('/trainer-dashboard/batches');
                        }}
                    >
                        <span className="td-action-icon emerald"><BsCheck2Square /></span>
                        <span>
                            <strong>Mark attendance</strong>
                            <em>Update today’s presence</em>
                        </span>
                    </button>
                    <button
                        type="button"
                        className="td-action"
                        onClick={() => navigate('/trainer-dashboard/courses/new')}
                    >
                        <span className="td-action-icon violet"><BiPlus /></span>
                        <span>
                            <strong>Create course</strong>
                            <em>Start a new curriculum</em>
                        </span>
                    </button>
                    <button
                        type="button"
                        className="td-action"
                        onClick={() => navigate('/trainer-dashboard/courses')}
                    >
                        <span className="td-action-icon sky"><BiBookOpen /></span>
                        <span>
                            <strong>Course studio</strong>
                            <em>Browse your courses</em>
                        </span>
                    </button>
                    <button
                        type="button"
                        className="td-action"
                        onClick={handleCopyMeetLink}
                    >
                        <span className="td-action-icon teal"><BiCopy /></span>
                        <span>
                            <strong>Copy meet link</strong>
                            <em>Share class invite</em>
                        </span>
                    </button>
                </div>
            </section>

            {/* 4. Recent Course */}
            <section className="td-panel">
                <header className="td-panel-head">
                    <div>
                        <p className="td-eyebrow">Course studio</p>
                        <h2 className="td-section-title">Recent course</h2>
                    </div>
                    <button
                        type="button"
                        className="td-link-btn"
                        onClick={() => navigate('/trainer-dashboard/courses')}
                    >
                        All courses
                        <BsArrowRight aria-hidden="true" />
                    </button>
                </header>

                {recentCourse ? (
                    <div className="td-course">
                        <div className="td-course-main">
                            <span className="td-course-icon" aria-hidden="true">
                                <BiBookOpen />
                            </span>
                            <div>
                                <div className="td-course-tags">
                                    <span>Active curriculum</span>
                                    {recentCourse.category ? <span>{recentCourse.category}</span> : null}
                                </div>
                                <h3>{recentCourse.courseName}</h3>
                                {recentCourse.courseDescription ? (
                                    <p>
                                        {String(recentCourse.courseDescription)
                                            .replace(/<[^>]+>/g, '')
                                            .slice(0, 120)}
                                        …
                                    </p>
                                ) : null}
                                <div className="td-course-stats">
                                    <span><strong>{recentCourse.totalSections || 0}</strong> sections</span>
                                    <span><strong>{recentCourse.totalStudents || 0}</strong> students</span>
                                </div>
                            </div>
                        </div>
                        <div className="td-course-actions">
                            <button
                                type="button"
                                className="td-btn td-btn-primary"
                                onClick={() =>
                                    navigate(
                                        `/trainer-dashboard/courses/${recentCourse.courseId || recentCourse._id || recentCourse.id}`
                                    )
                                }
                            >
                                View course
                                <BsArrowRight aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                className="td-btn td-btn-ghost"
                                onClick={() =>
                                    navigate(
                                        `/trainer-dashboard/courses/${recentCourse.courseId || recentCourse._id || recentCourse.id}/edit`
                                    )
                                }
                            >
                                Edit curriculum
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="td-course-empty">
                        <BiBookOpen aria-hidden="true" />
                        <div>
                            <strong>No courses yet</strong>
                            <p>Create your first curriculum to get started.</p>
                        </div>
                        <button
                            type="button"
                            className="td-btn td-btn-primary"
                            onClick={() => navigate('/trainer-dashboard/courses/new')}
                        >
                            <BiPlus aria-hidden="true" />
                            Create course
                        </button>
                    </div>
                )}
            </section>
        </section>
    );
};

export default Active;
