import React from 'react';
import './Batches.css';

const Active = ({ data, onViewBatch }) => {
    const batches = data.activeBatches;
    // const batches = [
    //     {
    //         id: 1,
    //         tag: "Frontend",
    //         title: "Introduction to React",
    //         students: 342,
    //         engaged: 92,
    //         completion: 78,
    //         tagType: "frontend"
    //     },
    //     {
    //         id: 2,
    //         tag: "Advanced",
    //         title: "Advanced JavaScript Patterns",
    //         students: 128,
    //         engaged: 88,
    //         completion: 45,
    //         tagType: "advanced"
    //     },
    //     {
    //         id: 3,
    //         tag: "Design",
    //         title: "UI Design Fundamentals",
    //         students: 560,
    //         engaged: 95,
    //         completion: 92,
    //         tagType: "design"
    //     },
    //     {
    //         id: 4,
    //         tag: "Backend",
    //         title: "Node.js & Express",
    //         students: 215,
    //         engaged: 81,
    //         completion: 64,
    //         tagType: "backend"
    //     }
    // ];

    const upcomingClasses = data.upcomingClasses;

    const istDateTime = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        return date.toLocaleDateString('en-US', options) + ' ' + time;
    };

    const formatClassTiming = (timing) => {
        if (!timing) return "";
        if (typeof timing === 'object') {
            const { startTime, endTime, timezone } = timing;
            // E.g. "10:00 - 12:00 (Asia/Kolkata)" or just times if timezone is implied
            // Let's include timezone if present to be precise, or just times.
            // User requested support for the object.
            return `${startTime} - ${endTime} ${timezone ? `(${timezone})` : ''}`;
        }
        return timing;
    };

    return (
        <section className="trainer-home-batches">
            <h2 className="batches-section-title ">Active Batches</h2>

            <div className="container">

                <div className="batches-dashboard-layout">
                    <div className="batches-batch-grid">
                        {batches.map(batch => (
                            <div key={batch.batchId} className="batches-batch-card">
                                <span className="batches-batch-tag">{batch.courseName}</span>
                                <h3 className="batches-batch-title">{batch.batchName}</h3>
                                <div className="batches-batch-info-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                    <span>{batch.studentsCount} Students</span>
                                </div>
                                <div className="batches-progress-container">
                                    <div className="batches-progress-label">
                                        <span>Avg. Completion</span>
                                        <span>{batch.completionPercentage}%</span>
                                    </div>
                                    <div className="batches-progress-bar">
                                        <div className="batches-progress-fill" style={{ width: `${batch.completionPercentage}%` }}></div>
                                    </div>
                                </div>
                                <div className="batches-arrow-wrap">
                                    <button
                                        type="button"
                                        className="batches-arrow-btn"
                                        aria-label={`View ${batch.batchName}`}
                                        onClick={() => onViewBatch?.(batch)}
                                    >
                                        -&gt;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* <aside className="batches-sidebar">
                        <div className="batches-sidebar-card">
                            <h3 className="batches-sidebar-title">Upcoming Classes</h3>
                            {upcomingClasses.map(cls => (
                                <div key={cls.batchId} className={`batches-class-card ${cls.isLive ? 'live' : 'upcoming'}`}>
                                    <div className="batches-class-header">
                                        <span className={`batches-status-tag ${cls.isLive ? 'live' : 'upcoming'}`}>
                                            {cls.isLive && <span className="batches-dot" aria-hidden></span>}
                                            {cls.isLive ? 'Live Now' : 'Upcoming'}
                                        </span>
                                        <span className="batches-student-count">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                            {cls.studentsCount}
                                        </span>
                                    </div>
                                    <h4 className="batches-class-title">{cls.batchName}</h4>
                                    <div className="batches-class-footer">
                                        <div className="batches-class-time">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                            {formatClassTiming(cls.timing || cls.classTiming)}
                                        </div>
                                        <button type="button" className={`batches-join-btn ${cls.isLive ? 'active' : 'disabled'}`} disabled={!cls.isLive}>
                                            Join Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside> */}
                </div>
            </div>
        </section >
    );
};

export default Active;
