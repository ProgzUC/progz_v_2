import React from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";
import { footerSocials, quickLinks, trendingCourses, kidsCourses, careerLinks } from "./FooterLinksConfig";

// Social media icons
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaWhatsapp } from "react-icons/fa";

/* -----------------------------------------
   SOCIAL MEDIA ICONS MAPPING
   ----------------------------------------- */
const socialIcons = {
    facebook: <FaFacebook />,
    instagram: <FaInstagram />,
    twitter: <FaTwitter />,
    linkedin: <FaLinkedin />,
    youtube: <FaYoutube />,
    whatsapp: <FaWhatsapp />
};

const Footer = () => {
    const navigate = useNavigate();

    const handleNavigation = (path, e) => {
        if (path.startsWith("http") || path === "#") return;
        if (e) e.preventDefault();
        navigate(path);
    };

    return (
        <footer className="student-footer">
            {/* ------------ MAIN FOOTER CONTENT -------------- */}
            <div className="footer-content">

                {/* -------- Brand Information Section -------- */}
                <div className="footer-section brand-section">
                    <h2 className="footer-logo">ProgZ</h2>

                    <p className="footer-description">
                        Empower your future with world-class courses and expert mentors.
                        Transform your career through our next-gen learning platform.
                    </p>

                    {/* ---- Dynamic Social Media Icons Rendering ---- */}
                    <div className="social-icons">
                        {footerSocials.map((social) => (
                            <a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-icon"
                                aria-label={social.name}
                            >
                                {socialIcons[social.name.toLowerCase()] || <FaFacebook />}
                            </a>
                        ))}
                    </div>
                </div>

                {/* -------- Quick Links Section -------- */}
                <div className="footer-section links-section">
                    <h3>Quick Links</h3>
                    <ul>
                        {quickLinks.map((link) => (
                            <li key={link.path}>
                                <a
                                    href={link.path}
                                    onClick={(e) => handleNavigation(link.path, e)}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ----------- Trending Software Courses Section ----------- */}
                <div className="footer-section categories-section">
                    <h3>Trending Software Courses</h3>
                    <ul>
                        {trendingCourses.map((course) => (
                            <li key={course.path}>
                                <a
                                    href={course.path}
                                    onClick={(e) => handleNavigation(course.path, e)}
                                >
                                    {course.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ----------- Kids Courses Section ----------- */}
                <div className="footer-section kids-section">
                    <h3>Kids Courses</h3>
                    <ul>
                        {kidsCourses.map((course) => (
                            <li key={course.path}>
                                <a
                                    href={course.path}
                                    onClick={(e) => handleNavigation(course.path, e)}
                                >
                                    {course.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* -------- Career Section -------- */}
                <div className="footer-section career-section">
                    <h3>Career</h3>
                    <ul>
                        {careerLinks.map((link) => (
                            <li key={link.path}>
                                <a
                                    href={link.path}
                                    onClick={(e) => handleNavigation(link.path, e)}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* ----------- Bottom Footer Legal Section ----------- */}
            <div className="footer-bottom">
                {/* Copyright */}
                <div className="copyright">
                    Copyright © 2025 ProgZ Edutech Solutions Private Limited. All rights reserved.
                </div>

                {/* Legal Links */}
                <div className="legal-links">
                    <a href="#">Terms of Service</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Cookies</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;


