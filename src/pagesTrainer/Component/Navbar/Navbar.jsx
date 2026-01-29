import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ activeTab, setActiveTab }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setIsMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = () => {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <nav className={`trainer-navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="trainer-nav-container">

                {/* 1. BRAND LOGO */}
                <div className="trainer-brand" onClick={() => handleTabClick('home')}>
                    <span className="brand-text">ProgZ</span>
                    <span className="brand-badge">Trainer</span>
                </div>

                {/* 2. MOBILE TOGGLE */}
                <button
                    className={`trainer-menu-toggle ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle navigation"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>

                {/* 3. NAVIGATION LINKS */}
                <div className={`trainer-nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <div className="nav-items">
                        <button
                            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                            onClick={() => handleTabClick('home')}
                        >
                            <span className="nav-icon"><i className="bi bi-grid-fill"></i></span>
                            Dashboard
                        </button>

                        <button
                            className={`nav-item ${activeTab === 'batches' ? 'active' : ''}`}
                            onClick={() => handleTabClick('batches')}
                        >
                            <span className="nav-icon"><i className="bi bi-people-fill"></i></span>
                            My Batches
                        </button>

                        <button
                            className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
                            onClick={() => handleTabClick('courses')}
                        >
                            <span className="nav-icon"><i className="bi bi-book-half"></i></span>
                            My Courses
                        </button>

                        <button
                            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => handleTabClick('profile')}
                        >
                            <span className="nav-icon"><i className="bi bi-person-circle"></i></span>
                            Profile
                        </button>
                    </div>

                    {/* 4. LOGOUT BUTTON (Inside menu for mobile, Flexed on desktop) */}
                    <div className="nav-actions">
                        <button className="trainer-logout-btn" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right"></i>
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Overlay */}
                {isMenuOpen && (
                    <div
                        className="trainer-nav-overlay"
                        onClick={() => setIsMenuOpen(false)}
                    />
                )}
            </div>
        </nav>
    );
};

export default Navbar;
