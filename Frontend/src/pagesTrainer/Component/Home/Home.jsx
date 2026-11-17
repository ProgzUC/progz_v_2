import React from 'react';
import './Home.css';

const Home = ({ trainer, stats, onNavigateToCreateCourse, onNavigateToMyCourses }) => {
    const scrollToContent = () => {
        const target = document.getElementById('trainer-content-section');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
        }
    };

    const trainerFirstName = trainer?.name ? trainer.name.split(' ')[0] : 'Trainer';

    return (
        <section className="trainer-home landing-hero">
            {/* Subtle background ambient glows */}
            <div className="hero-ambient-glow glow-top" aria-hidden="true" />
            <div className="hero-ambient-glow glow-bottom" aria-hidden="true" />

            <div className="container landing-hero-container">
                {/* Left Column: Heading, Subtitle, CTAs & Review/Rating Badge */}
                <div className="landing-hero-left">
                    <div className="landing-badge">
                        <span className="landing-badge-dot"></span>
                        <span>Trainer Studio</span>
                    </div>

                    <h1 className="landing-hero-title">
                        Empower Your Teaching Journey to <span className="highlight-text">Elevate &amp; Transform</span>
                    </h1>

                    <p className="landing-hero-subtitle">
                        Welcome back, <strong>{trainerFirstName}</strong>. Lead your batches, inspire curious minds, and deliver industry-ready skills with powerful teaching tools.
                    </p>

                    <div className="landing-hero-actions">
                        <button
                            type="button"
                            className="landing-btn-primary"
                            onClick={onNavigateToCreateCourse}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span>Create New Course</span>
                        </button>

                        <button
                            type="button"
                            className="landing-btn-secondary"
                            onClick={onNavigateToMyCourses}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                            <span>My Courses</span>
                        </button>
                    </div>

                    {/* Social proof / Active students rating pill */}
                    <div className="landing-social-proof">
                        <div className="avatar-stack">
                            <img src="/student/card/p1.jpg" alt="Student" className="stack-avatar" />
                            <img src="/student/card/p2.jpg" alt="Student" className="stack-avatar" />
                            <img src="/student/card/p3.jpg" alt="Student" className="stack-avatar" />
                            <img src="/student/card/p4.jpg" alt="Student" className="stack-avatar" />
                        </div>
                        <div className="social-proof-info">
                            <div className="stars-row">
                                <span className="star-icon">&#9733;</span>
                                <span className="star-icon">&#9733;</span>
                                <span className="star-icon">&#9733;</span>
                                <span className="star-icon">&#9733;</span>
                                <span className="star-icon">&#9733;</span>
                            </div>
                            <span className="social-proof-text">
                                <strong>{stats?.totalStudents || 0}+ Students</strong> mentored
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visual Composition with Pill Badges & Star Accents */}
                <div className="landing-hero-right" aria-hidden="true">
                    {/* Star Accents */}
                    <svg className="decorative-star star-top" width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" fill="#a7f3d0" opacity="0.85" />
                    </svg>

                    <svg className="decorative-star star-bottom" width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" fill="#6ee7b7" opacity="0.6" />
                    </svg>

                    {/* Top Floating Badge: BEST Mentors / Verified Trainer */}
                    <div className="floating-badge badge-mentors">
                        <div className="badge-icon-circle mentor-circle">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <polyline points="17 11 19 13 23 9" />
                            </svg>
                        </div>
                        <div className="badge-text-group">
                            <span className="badge-label-small">PROGZ VERIFIED</span>
                            <span className="badge-label-title">Top Mentor</span>
                        </div>
                    </div>

                    {/* Top Portrait: Curved Capsule */}
                    <div className="capsule-frame frame-top">
                        <img
                            src="/student/pexels-andrea-piacquadio-3769021.jpg"
                            alt="Academy mentor and students"
                            className="capsule-img"
                        />
                        <div className="capsule-overlay" />
                    </div>

                    {/* Bottom Floating Badge: Live Video Lessons */}
                    <div className="floating-badge badge-lessons">
                        <div className="badge-icon-circle lesson-circle">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="23 7 16 12 23 17 23 7" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                        </div>
                        <div className="badge-text-group">
                            <span className="badge-label-small">INTERACTIVE</span>
                            <span className="badge-label-title">Live Sessions</span>
                        </div>
                    </div>

                    {/* Bottom Portrait: Arch Frame */}
                    <div className="capsule-frame frame-bottom">
                        <img
                            src="/trainer/home.jpg"
                            alt="Lead instructor mentoring"
                            className="capsule-img"
                        />
                        <div className="capsule-overlay" />
                    </div>
                </div>
            </div>

            {/* Bottom Glass Stats Bar */}
            <div className="landing-stats-bar">
                <div className="landing-stat-box">
                    <span className="landing-stat-num">{stats?.totalStudents ?? 0}</span>
                    <span className="landing-stat-name">Total Students</span>
                </div>
                <div className="landing-stat-divider" />
                <div className="landing-stat-box">
                    <span className="landing-stat-num">{stats?.activeBatches ?? 0}</span>
                    <span className="landing-stat-name">Active Batches</span>
                </div>
                <div className="landing-stat-divider" />
                <div className="landing-stat-box">
                    <span className="landing-stat-num">{stats?.completedBatches ?? 0}</span>
                    <span className="landing-stat-name">Completed Batches</span>
                </div>
            </div>

            {/* Scroll Down Hint Button */}
            <button
                type="button"
                className="hero-scroll-hint"
                onClick={scrollToContent}
                aria-label="Scroll down to active batches"
                title="Scroll down to active batches"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
                <span>Scroll for batches</span>
            </button>
        </section>
    );
};

export default Home;
