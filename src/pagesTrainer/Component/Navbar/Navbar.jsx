import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { logout } from '../../../api/authApi';
import NotificationBell from '../../../components/common/NotificationBell/NotificationBell';

const Navbar = ({ activeTab, setActiveTab }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

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

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <nav className={`trainer-navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="trainer-nav-container">
                <div className="trainer-brand" onClick={() => handleTabClick('home')}>
                    <img src="/logo.png" alt="ProgZ" className="brand-logo" />
                </div>

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

                    <div className="nav-actions">
                        <span className="brand-badge">Trainer</span>
                        <button className="trainer-logout-btn" onClick={handleLogout}>
                            <span className="nav-icon"><i className="bi bi-box-arrow-right"></i></span>
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>

                <div className="header-end">
                    <NotificationBell />
                    <button
                        className={`trainer-menu-toggle ${isMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle navigation"
                    >
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </button>
                </div>

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
