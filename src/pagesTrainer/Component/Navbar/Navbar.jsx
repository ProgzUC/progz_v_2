import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { logout } from '../../../api/authApi';
import NotificationBell from '../../../components/common/NotificationBell/NotificationBell';
import { showSuccess } from '../../../utils/toast';
import { useTrainerBootstrap } from '../../../hooks/useTrainerBootstrap';

const links = [
    { name: 'Dashboard', to: '/trainer-dashboard', end: true, icon: 'bi-grid-fill' },
    { name: 'My Batches', to: '/trainer-dashboard/batches', icon: 'bi-people-fill' },
    { name: 'My Courses', to: '/trainer-dashboard/courses', icon: 'bi-book-half' },
];

const Navbar = () => {
    const { data } = useTrainerBootstrap();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setIsProfileOpen(false);
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Close profile dropdown on outside click or escape key
    useEffect(() => {
        if (!isProfileOpen) return;

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isProfileOpen]);

    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleGoProfile = () => {
        setIsProfileOpen(false);
        setIsMenuOpen(false);
        navigate('/trainer-dashboard/profile');
    };

    const handleLogout = async () => {
        setIsProfileOpen(false);
        setIsMenuOpen(false);
        try {
            await logout();
            showSuccess("Logged out successfully");
        } catch {
            showSuccess("Logged out successfully");
        } finally {
            navigate('/');
        }
    };

    const isProfileActive = location.pathname.startsWith('/trainer-dashboard/profile');

    return (
        <nav className={`trainer-navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="trainer-nav-container">
                <Link to="/trainer-dashboard" className="trainer-brand" onClick={closeMenu}>
                    <img src="/logo.png" alt="ProgZ" className="brand-logo" />
                    <span className="brand-text">ProgZ</span>
                </Link>

                <div className={`trainer-nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <div className="nav-items">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                                onClick={closeMenu}
                            >
                                <span className="nav-icon"><i className={`bi ${link.icon}`}></i></span>
                                {link.name}
                            </NavLink>
                        ))}
                    </div>

                    <div className="mobile-drawer-footer">
                        <div className="mobile-drawer-user">
                            <div className="trainer-avatar">
                                {data?.trainer?.profileImage ? (
                                    <img src={data.trainer.profileImage} alt="" className="avatar-img-circle" />
                                ) : (
                                    data?.trainer?.name?.charAt(0)?.toUpperCase() || 'T'
                                )}
                                <span className="trainer-status-dot"></span>
                            </div>
                            <div className="trainer-info">
                                <span className="trainer-name">{data?.trainer?.name || 'Trainer'}</span>
                                <span className="trainer-role-pill">Trainer</span>
                            </div>
                        </div>
                        <div className="mobile-drawer-actions">
                            <button
                                type="button"
                                className={`mobile-drawer-item ${isProfileActive ? 'active' : ''}`}
                                onClick={handleGoProfile}
                            >
                                <i className="bi bi-person-circle"></i>
                                <span>My Profile</span>
                            </button>
                            <button
                                type="button"
                                className="mobile-drawer-item logout"
                                onClick={handleLogout}
                            >
                                <i className="bi bi-box-arrow-right"></i>
                                <span>Log Out</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="header-end">
                    <NotificationBell settingsHref="/trainer-dashboard/profile?section=alerts" />

                    {/* Top-Right Profile Icon & Dropdown */}
                    <div className="trainer-profile-dropdown-wrapper" ref={dropdownRef}>
                        <button
                            type="button"
                            className={`trainer-profile-icon-btn ${isProfileOpen ? 'open' : ''} ${isProfileActive ? 'active' : ''}`}
                            onClick={() => {
                                setIsProfileOpen((prev) => !prev);
                                setIsMenuOpen(false);
                            }}
                            aria-expanded={isProfileOpen}
                            aria-haspopup="menu"
                            aria-label="Profile and account menu"
                            title="Profile & Account"
                        >
                            <i className="bi bi-person-circle"></i>
                        </button>

                        {isProfileOpen && (
                            <div className="trainer-profile-menu-dropdown" role="menu">
                                <div className="trainer-dropdown-header">
                                    <div className="trainer-dropdown-avatar">
                                        {data?.trainer?.profileImage ? (
                                            <img src={data.trainer.profileImage} alt={data.trainer.name} />
                                        ) : (
                                            <span>{data?.trainer?.name?.charAt(0)?.toUpperCase() || 'T'}</span>
                                        )}
                                        <span className="trainer-status-dot"></span>
                                    </div>
                                    <div className="trainer-dropdown-user-info">
                                        <span className="trainer-dropdown-name">{data?.trainer?.name || 'Trainer'}</span>
                                        {data?.trainer?.email && (
                                            <span className="trainer-dropdown-email">{data.trainer.email}</span>
                                        )}
                                        <span className="trainer-dropdown-role-badge">Trainer</span>
                                    </div>
                                </div>

                                <div className="trainer-dropdown-divider" />

                                <div className="trainer-dropdown-items">
                                    <button
                                        type="button"
                                        className={`trainer-dropdown-item ${isProfileActive ? 'active' : ''}`}
                                        role="menuitem"
                                        onClick={handleGoProfile}
                                    >
                                        <i className="bi bi-person-circle"></i>
                                        <span>My Profile</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="trainer-dropdown-item logout"
                                        role="menuitem"
                                        onClick={handleLogout}
                                    >
                                        <i className="bi bi-box-arrow-right"></i>
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className={`trainer-menu-toggle ${isMenuOpen ? 'active' : ''}`}
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen);
                            setIsProfileOpen(false);
                        }}
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
