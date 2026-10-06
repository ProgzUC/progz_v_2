import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { logout } from '../../../api/authApi';
import NotificationBell from '../../../components/common/NotificationBell/NotificationBell';
import { toast } from 'react-toastify';

const links = [
    { name: 'Dashboard', to: '/trainer-dashboard', end: true, icon: 'bi-grid-fill' },
    { name: 'My Batches', to: '/trainer-dashboard/batches', icon: 'bi-people-fill' },
    { name: 'My Courses', to: '/trainer-dashboard/courses', icon: 'bi-book-half' },
    { name: 'Profile', to: '/trainer-dashboard/profile', icon: 'bi-person-circle' },
];

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeMenu = () => {
        setIsMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successsfully");
        navigate('/');
    };

    return (
        <nav className={`trainer-navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="trainer-nav-container">
                <Link to="/trainer-dashboard" className="trainer-brand" onClick={closeMenu}>
                    <img src="/logo.png" alt="ProgZ" className="brand-logo" />
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
