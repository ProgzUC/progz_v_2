import React, { useState, useEffect, useRef } from "react";
import "./Header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BiGridAlt, BiBookOpen, BiSearch, BiUserCircle, BiLogOut, BiCalendarCheck, BiLayer } from "react-icons/bi";
import NotificationBell from "../../../components/common/NotificationBell/NotificationBell";
import { getAuthData } from "../../../utils/authStorage";
import { useStudentProfile } from "../../../hooks/useStudentProfile";

function HeaderContent({ onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const accountRef = useRef(null);
    const authData = getAuthData();
    const { data: profile } = useStudentProfile();

    const studentName = profile?.name || authData?.user?.name || "Student";
    const studentEmail = profile?.email || "";

    const links = [
        { name: "Home", href: "/student-dashboard/", icon: <BiGridAlt /> },
        { name: "My Batches", href: "/student-dashboard/my-batches", icon: <BiLayer /> },
        { name: "My Courses", href: "/student-dashboard/my-courses", icon: <BiBookOpen /> },
        { name: "Courses", href: "/student-dashboard/browse", icon: <BiSearch /> },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (isMenuOpen) document.body.classList.add("no-scroll");
        else document.body.classList.remove("no-scroll");
        return () => document.body.classList.remove("no-scroll");
    }, [isMenuOpen]);

    useEffect(() => {
        if (!isAccountOpen) return;

        const handleClickOutside = (event) => {
            if (accountRef.current && !accountRef.current.contains(event.target)) {
                setIsAccountOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") setIsAccountOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isAccountOpen]);

    const path = location.pathname.replace(/\/$/, "") || "/";
    const isAccountActive =
        path === "/student-dashboard/profile" ||
        path === "/student-dashboard/certificate" ||
        path === "/student-dashboard/my-attendance";

    const goTo = (href) => {
        setIsAccountOpen(false);
        setIsMenuOpen(false);
        navigate(href);
    };

    return (
        <nav className={`student-navbar ${scrolled ? "scrolled" : ""}`}>
            <div className="student-nav-container">
                <Link to="/student-dashboard/" className="student-brand" onClick={() => setIsMenuOpen(false)}>
                    <img src="/logo.png" alt="ProgZ" className="brand-logo" />
                    <span className="brand-text">ProgZ</span>
                </Link>

                <div className={`student-nav-menu ${isMenuOpen ? "active" : ""}`}>
                    <div className="nav-items">
                        {links.map((link, index) => {
                            const path = location.pathname.replace(/\/$/, "") || "/";
                            const target = link.href.replace(/\/$/, "") || "/";
                            const isHome = target.endsWith("/student-dashboard");
                            const isActive = isHome
                                ? path === "/student-dashboard"
                                : target.endsWith("/browse")
                                    ? path === target || path.includes("/course-details")
                                    : path === target;

                            return (
                                <Link
                                    key={index}
                                    to={link.href}
                                    state={link.name === "My Courses" ? { reset: true } : {}}
                                    className={`student-nav-item ${isActive ? "active" : ""}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="nav-icon">{link.icon}</span>
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                </div>

                <div className="header-end">
                    <NotificationBell />
                    <div className="student-account-menu" ref={accountRef}>
                        <button
                            type="button"
                            className={`student-account-btn ${isAccountOpen ? "open" : ""} ${isAccountActive ? "active" : ""}`}
                            onClick={() => {
                                setIsAccountOpen((open) => !open);
                                setIsMenuOpen(false);
                            }}
                            aria-expanded={isAccountOpen}
                            aria-haspopup="menu"
                            aria-label="Account menu"
                            title="Account"
                        >
                            <BiUserCircle />
                        </button>

                        {isAccountOpen && (
                            <div className="student-account-dropdown" role="menu">
                                <div className="student-account-header">
                                    <div className="student-account-avatar-lg">
                                        <BiUserCircle />
                                    </div>
                                    <div className="student-account-meta">
                                        <span className="student-account-name">{studentName}</span>
                                        {studentEmail ? (
                                            <span className="student-account-email">{studentEmail}</span>
                                        ) : null}
                                        <span className="student-account-role">Student</span>
                                    </div>
                                </div>

                                <div className="student-account-divider" />

                                <button
                                    type="button"
                                    className={`student-account-item ${path === "/student-dashboard/my-attendance" ? "active" : ""}`}
                                    role="menuitem"
                                    onClick={() => goTo("/student-dashboard/my-attendance")}
                                >
                                    <BiCalendarCheck />
                                    <span>Attendance</span>
                                </button>
                                <button
                                    type="button"
                                    className={`student-account-item ${path === "/student-dashboard/profile" || path === "/student-dashboard/certificate" ? "active" : ""}`}
                                    role="menuitem"
                                    onClick={() => goTo("/student-dashboard/profile")}
                                >
                                    <BiUserCircle />
                                    <span>Profile</span>
                                </button>
                                <button
                                    type="button"
                                    className="student-account-item logout"
                                    role="menuitem"
                                    onClick={() => {
                                        setIsAccountOpen(false);
                                        onLogout();
                                    }}
                                >
                                    <BiLogOut />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        className={`student-menu-toggle ${isMenuOpen ? "active" : ""}`}
                        onClick={() => {
                            setIsMenuOpen((open) => !open);
                            setIsAccountOpen(false);
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
