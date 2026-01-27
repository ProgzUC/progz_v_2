import React, { useState, useEffect } from "react";
import "./Header.css";
import { FiMenu, FiX } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";


export default function Header({ onLogout }) {
    const [activeIndex, setActiveIndex] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    /* ----------------------------- NAVIGATION LINKS ----------------------------- */
    const links = [
        { name: "Home", href: "/student-dashboard/" },
        { name: "My Courses", href: "/student-dashboard/my-courses" },
        { name: "Browse", href: "/student-dashboard/browse" },
        { name: "Profile", href: "/student-dashboard/profile" },
    ];

    // Set active link based on current URL
    useEffect(() => {
        const currentPath = location.pathname;
        const foundIndex = links.findIndex(link => link.href === currentPath);
        setActiveIndex(foundIndex !== -1 ? foundIndex : null);
    }, [location.pathname]);

    /* ----------------------------- MENU TOGGLE HANDLER ----------------------------- */
    const toggleMenu = () => setMenuOpen(!menuOpen);

    /* ----------------------------- BODY SCROLL HANDLING ----------------------------- */
    useEffect(() => {
        if (menuOpen) document.body.classList.add("no-scroll");
        else document.body.classList.remove("no-scroll");

        return () => document.body.classList.remove("no-scroll");
    }, [menuOpen]);

    return (
        <header className="header-container">
            <div className="header-inner">

                {/* ----------------------------- BRAND / LOGO SECTION ----------------------------- */}
                <Link to="/student-dashboard/" className="logo-link">
                    <div className="header-logo">ProgZ</div>
                </Link>

                {/* ----------------------------- HAMBURGER MENU ICON ----------------------------- */}
                <div className="hamburger" onClick={toggleMenu}>
                    {menuOpen ? <FiX /> : <FiMenu />}
                </div>

                {/* ----------------------------- NAVIGATION + LOGOUT GROUP ----------------------------- */}
                <div className={`nav-group ${menuOpen ? "open" : ""}`}>

                    {/* ----------------------------- NAVIGATION LINKS LOOP ----------------------------- */}
                    <div className="nav-links">
                        {links.map((item, index) => (
                            <Link
                                key={index}
                                to={item.href}
                                className={activeIndex === index ? "active" : ""}
                                onClick={() => {
                                    setMenuOpen(false);
                                }}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* ----------------------------- LOGOUT BUTTON (DYNAMIC FUNCTION) ----------------------------- */}
                    <button
                        className="logout-btn"
                        onClick={onLogout}  // Calls parent function dynamically
                    >
                        Log Out
                    </button>
                </div>

            </div>
        </header>
    );
}
