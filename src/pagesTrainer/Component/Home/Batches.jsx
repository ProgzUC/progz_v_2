import React from 'react';
import './Batches.css';

const Active = ({ data, onViewBatch }) => {
    const batches = data.activeBatches || [];

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
                </div>
            </div>
        </section >
    );
};

export default Active;
