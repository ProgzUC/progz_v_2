import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
import { getAuthData } from '../../utils/authStorage';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { useStudentCourses } from '../../hooks/useStudentCourses';

export default function Hero() {
    const navigate = useNavigate();
    const authData = getAuthData();
    const { data: profile } = useStudentProfile();
    const { data: coursesData } = useStudentCourses();

    const studentName = profile?.name || authData?.user?.name || 'Learner';
    const studentFirstName = studentName ? studentName.split(' ')[0] : 'Learner';

    const enrolledCourses = coursesData?.enrolledCourses || [];
    const enrolledCount = enrolledCourses.length;
    const completedLessons = enrolledCourses.reduce((acc, c) => acc + (c.completedLessons || 0), 0);
    const activeBatches = new Set(enrolledCourses.map((c) => c.batchId).filter(Boolean)).size || (enrolledCount > 0 ? 1 : 0);

    const scrollToContent = () => {
        const target = document.getElementById('student-courses-section');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
        }
    };

    return (
        <section className="student-hero landing-hero">
            {/* Subtle background ambient glows */}
            <div className="hero-ambient-glow glow-top" aria-hidden="true" />
            <div className="hero-ambient-glow glow-bottom" aria-hidden="true" />

            <div className="landing-hero-container">
                {/* Left Column: Heading, Subtitle, CTAs & Review/Rating Badge */}
                <div className="landing-hero-left">
                    <div className="landing-badge">
                        <span className="landing-badge-dot"></span>
                        <span>Student Portal</span>
                    </div>

                    <h1 className="landing-hero-title">
                        Empower Your Learning Journey to <span className="highlight-text">Elevate &amp; Transform</span>
                    </h1>

                    <p className="landing-hero-subtitle">
                        Welcome back, <strong>{studentFirstName}</strong>. Dive into hands-on lessons, join live interactive sessions, and master industry-ready tech skills with expert mentors.
                    </p>

                    <div className="landing-hero-actions">
                        <button
                            type="button"
                            className="landing-btn-primary"
                            onClick={() => navigate('/student-dashboard/my-courses')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                            </svg>
                            <span>Continue Learning</span>
                        </button>

                        <button
                            type="button"
                            className="landing-btn-secondary"
                            onClick={() => navigate('/student-dashboard/browse')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <span>Browse Courses</span>
                        </button>
                    </div>

                    {/* Social proof / Active learners rating pill */}
                    <div className="landing-social-proof">
                        <div className="avatar-stack">
                            <img src="/student/card/p1.jpg" alt="Learner" className="stack-avatar" />
                            <img src="/student/card/p2.jpg" alt="Learner" className="stack-avatar" />
                            <img src="/student/card/p3.jpg" alt="Learner" className="stack-avatar" />
                            <img src="/student/card/p4.jpg" alt="Learner" className="stack-avatar" />
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
                                <strong>4.9/5 Rating</strong> &bull; 1,200+ Active Learners
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

                    {/* Top Floating Badge: Verified / Top Mentorship */}
                    <div className="floating-badge badge-mentors">
                        <div className="badge-icon-circle mentor-circle">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <polyline points="17 11 19 13 23 9" />
                            </svg>
                        </div>
                        <div className="badge-text-group">
                            <span className="badge-label-small">PROGZ VERIFIED</span>
                            <span className="badge-label-title">Top Mentorship</span>
                        </div>
                    </div>

                    {/* Top Portrait: Curved Capsule */}
                    <div className="capsule-frame frame-top">
                        <img
                            src="/student/pexels-andrea-piacquadio-3769021.jpg"
                            alt="Student engaged in tech learning"
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
                            alt="Mentor and students in classroom session"
                            className="capsule-img"
                        />
                        <div className="capsule-overlay" />
                    </div>
                </div>
            </div>

            {/* Bottom Glass Stats Bar */}
            <div className="landing-stats-bar">
                <div className="landing-stat-box">
                    <span className="landing-stat-num">{enrolledCount}</span>
                    <span className="landing-stat-name">Enrolled Courses</span>
                </div>
                <div className="landing-stat-divider" />
                <button
                    type="button"
                    className="landing-stat-box landing-stat-box--link"
                    onClick={() => navigate('/student-dashboard/my-batches')}
                >
                    <span className="landing-stat-num">{activeBatches}</span>
                    <span className="landing-stat-name">Active Batches</span>
                </button>
                <div className="landing-stat-divider" />
                <div className="landing-stat-box">
                    <span className="landing-stat-num">{completedLessons}</span>
                    <span className="landing-stat-name">Completed Lessons</span>
                </div>
            </div>

            {/* Scroll Down Hint Button */}
            <button
                type="button"
                className="hero-scroll-hint"
                onClick={scrollToContent}
                aria-label="Scroll down to popular courses"
                title="Scroll down to popular courses"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
                <span>Scroll for courses</span>
            </button>
        </section>
    );
}
