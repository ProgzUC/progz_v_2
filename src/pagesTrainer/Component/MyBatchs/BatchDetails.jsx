import React from 'react';
import './BatchDetails.css';

const BatchDetails = ({ batch, onBack }) => {
    // Placeholder data based on screenshot
    const students = [
        { id: 1, batch: '01)', name: 'Tharun', email: 'tharun@progz.tech', mobile: '9176612167', qualification: 'Not specified', exp: 'N/A • 0 years' },
        { id: 2, batch: '01)', name: 'Tharun', email: 'tharun@progz.tech', mobile: '9176612167', qualification: 'Not specified', exp: 'N/A • 0 years' },
        { id: 3, batch: '01)', name: 'Tharun', email: 'tharun@progz.tech', mobile: '9176612167', qualification: 'Not specified', exp: 'N/A • 0 years' },
        { id: 4, batch: '01)', name: 'Tharun', email: 'tharun@progz.tech', mobile: '9176612167', qualification: 'Not specified', exp: 'N/A • 0 years' },
        { id: 5, batch: '01)', name: 'Tharun', email: 'tharun@progz.tech', mobile: '9176612167', qualification: 'Not specified', exp: 'N/A • 0 years' },
        { id: 6, batch: '01)', name: 'Tharun', email: 'tharun@progz.tech', mobile: '9176612167', qualification: 'Not specified', exp: 'N/A • 0 years' },
    ];

    const modules = [
        { id: 1, title: 'Module 1: Course Introduction & Basics', subtitle: 'Foundational concepts and setting up the development environment.' },
        { id: 2, title: 'Module 1: Course Introduction & Basics', subtitle: 'Foundational concepts and setting up the development environment.' },
    ];

    const sections = [
        { id: 1, title: 'Introduction to Modern Web Development', completed: true, date: 'Completed on Dec 16, 12:00 PM', instructor: 'Completed by Savitha' },
        { id: 2, title: 'CSS3 Fundamentals & Flexbox', completed: false },
        { id: 3, title: 'Setting up VS Code & Git', completed: false },
        { id: 4, title: 'Introduction to Modern Web Development', completed: false },
        { id: 5, title: 'HTML5 Semantic Structure', completed: false },
        { id: 6, title: 'Setting up VS Code & Git', completed: false },
        { id: 7, title: 'CSS3 Fundamentals & Flexbox', completed: false },
        { id: 8, title: 'HTML5 Semantic Structure', completed: false },
    ];

    return (
        <div className="batch-details-container">
            <header className="details-header">
                <button className="back-btn" onClick={onBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h1 className="header-title">{batch?.title || 'Frontend Development Batch A'}</h1>
                <span className="status-badge active">Active</span>
            </header>

            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon-container date">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Start Date</span>
                        <span className="stat-value">{batch?.date?.replace('Starts ', '') || 'Oct 12, 2024'}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-container schedule">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Schedule</span>
                        <span className="stat-value">Mon, Wed, Fri</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-container students">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Students</span>
                        <span className="stat-value">24 Enrolled</span>
                    </div>
                </div>
            </div>

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
                                <th>Batch</th>
                                <th>Student</th>
                                <th>E-mail</th>
                                <th>Mobile No</th>
                                <th>Qualification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td>{student.batch}</td>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>{student.mobile}</td>
                                    <td>
                                        <div className="qualification-col">
                                            <span>{student.qualification}</span>
                                            <span className="exp-text">{student.exp}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="content-grid">
                <div className="curriculum-col">
                    <div className="column-header">
                        <h2 className="section-title">Curriculum</h2>
                        <span className="badge-outline">8 Modules Total</span>
                    </div>
                    <div className="module-list">
                        {modules.map(module => (
                            <div key={module.id} className="module-item">
                                <div className="module-main">
                                    <div className="module-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                    </div>
                                    <div className="module-info">
                                        <h3 className="module-title">{module.title}</h3>
                                        <p className="module-subtitle">{module.subtitle}</p>
                                    </div>
                                    <div className="module-arrow">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                </div>
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
                                <h2 className="section-title">Sections</h2>
                            </div>
                            <div className="header-right">
                                <span className="percent-text">13 %</span>
                                <span className="completed-label">Completed</span>
                            </div>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: '13%' }}></div>
                        </div>

                        <div className="section-items-list">
                            {sections.map(item => (
                                <div key={item.id} className={`section-item ${item.completed ? 'completed' : ''}`}>
                                    <div className="item-radio">
                                        {item.completed ? (
                                            <div className="radio-check active">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </div>
                                        ) : (
                                            <div className="radio-check"></div>
                                        )}
                                    </div>
                                    <div className="item-content">
                                        <h3 className="item-title">{item.title}</h3>
                                        {item.completed && (
                                            <div className="completed-info">
                                                <p className="completed-date">{item.date}</p>
                                                <p className="completed-by">( {item.instructor} )</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchDetails;
