import React, { useState, useEffect } from "react";
import "./Header.css";
import { Link, useLocation } from "react-router-dom";
import { BiGridAlt, BiBookOpen, BiSearch, BiUserCircle, BiLogOut, BiMenu } from "react-icons/bi";

function HeaderContent({ onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    const links = [
        { name: "Home", href: "/student-dashboard/", icon: <BiGridAlt /> },
        { name: "My Courses", href: "/student-dashboard/my-courses", icon: <BiBookOpen /> },
        { name: "Browse", href: "/student-dashboard/browse", icon: <BiSearch /> },
        { name: "Profile", href: "/student-dashboard/profile", icon: <BiUserCircle /> },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isMenuOpen) document.body.classList.add("no-scroll");
        else document.body.classList.remove("no-scroll");
        return () => document.body.classList.remove("no-scroll");
    }, [isMenuOpen]);

    return (
        <nav className={`student-navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="student-nav-container">

                <Link to="/student-dashboard/" className="student-brand">
                    <span className="brand-text">ProgZ</span>
                    <span className="brand-badge">Student</span>
                </Link>

                <button
                    className={`student-menu-toggle ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle navigation"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>

                <div className={`student-nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <div className="nav-items">
                        {links.map((link, index) => (
                            <Link
                                key={index}
                                to={link.href}
                                state={link.name === "My Courses" ? { reset: true } : {}}
                                className={`student-nav-item ${location.pathname === link.href ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="nav-icon">{link.icon}</span>
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="nav-actions">
                        <button className="student-logout-btn" onClick={onLogout}>
                            <span className="nav-icon"><BiLogOut /></span>
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div
                        className="student-nav-overlay"
                        onClick={() => setIsMenuOpen(false)}
                    />
                )}
            </div>
        </nav>
    );
}

export default function Header({ onLogout }) {
    const location = useLocation();
    return <HeaderContent key={location.pathname} onLogout={onLogout} />;
}
