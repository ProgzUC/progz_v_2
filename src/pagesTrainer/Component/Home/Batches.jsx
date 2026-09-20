import React from 'react';
import './Batches.css';

function getBatchInitials(name = '') {
    const parts = String(name).trim().split(/[\s-_]+/).filter(Boolean);
    if (parts.length === 0) return 'B';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

const Active = ({ data, onViewBatch }) => {
    const batches = data.activeBatches || [];

    return (
        <section className="trainer-home-batches">
            <h2 className="batches-section-title">Active Batches</h2>

            <div className="container">
                <div className="batches-dashboard-layout">
                    <div className="batches-batch-grid">
                        {batches.map((batch) => {
                            const pct = Number(batch.completionPercentage) || 0;
                            const students = Number(batch.studentsCount) || 0;

                            return (
                                <button
                                    key={batch.batchId}
                                    type="button"
                                    className="batches-batch-card"
                                    onClick={() => onViewBatch?.(batch)}
                                    aria-label={`View ${batch.batchName}`}
                                >
                                    <div className="batches-batch-head">
                                        <span className="batches-batch-avatar" aria-hidden="true">
                                            {getBatchInitials(batch.batchName)}
                                        </span>
                                        <div className="batches-batch-copy">
                                            <h3 className="batches-batch-title">{batch.batchName}</h3>
                                            <div className="batches-batch-info-item">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                    <circle cx="9" cy="7" r="4" />
                                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                                </svg>
                                                <span>{students} {students === 1 ? 'Student' : 'Students'}</span>
                                            </div>
                                        </div>
                                        <span className="batches-arrow-btn" aria-hidden="true">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12h14" />
                                                <path d="M13 6l6 6-6 6" />
                                            </svg>
                                        </span>
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
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Active;
