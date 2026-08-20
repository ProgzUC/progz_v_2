import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";
import { footerSocials, quickLinks, trendingCourses, kidsCourses, careerLinks } from "./FooterLinksConfig";
import {
    FaFacebook,
    FaInstagram,
    FaTwitter,
    FaLinkedin,
    FaYoutube,
    FaWhatsapp,
    FaPaperPlane,
    FaEnvelope
} from "react-icons/fa";
import Swal from "sweetalert2";

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
    const [email, setEmail] = useState("");

    const handleNavigation = (path, e) => {
        if (path.startsWith("http") || path === "#") return;
        if (e) e.preventDefault();
        navigate(path);
    };

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email) return;

        Swal.fire({
            icon: "success",
            title: "Subscribed!",
            text: "Thank you for subscribing to our newsletter.",
            confirmButtonColor: "#064E3B",
            timer: 3000,
            timerProgressBar: true,
        });

        setEmail("");
    };

    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-section brand-section">
                    <div className="footer-logo-container">
                        <img src="/logo.png" alt="ProgZ" className="footer-logo-img" />
                        <span className="footer-logo-text">ProgZ</span>
                    </div>

                    <p className="footer-description">
                        Empower your future with world-class courses and expert mentors.
                        Transform your career through our next-gen learning platform.
                    </p>

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

                <div className="footer-section links-section">
                    <p className="footer-heading">Quick Links</p>
                    <ul className="footer-links-list">
                        {quickLinks.map((link) => (
                            <li key={link.label}>
                                <a
                                    href={link.path}
                                    onClick={(e) => handleNavigation(link.path, e)}
                                    className="footer-link"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="footer-section categories-section">
                    <p className="footer-heading">Trending Courses</p>
                    <ul className="footer-links-list">
                        {trendingCourses.map((course) => (
                            <li key={course.label}>
                                <a
                                    href={course.path}
                                    onClick={(e) => handleNavigation(course.path, e)}
                                    className="footer-link"
                                >
                                    {course.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="footer-section kids-career-section">
                    <p className="footer-heading">Kids Courses</p>
                    <ul className="footer-links-list mb-3">
                        {kidsCourses.slice(0, 4).map((course) => (
                            <li key={course.label}>
                                <a
                                    href={course.path}
                                    onClick={(e) => handleNavigation(course.path, e)}
                                    className="footer-link"
                                >
                                    {course.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <p className="footer-heading footer-subheading">Careers</p>
                    <ul className="footer-links-list">
                        {careerLinks.map((link) => (
                            <li key={link.label}>
                                <a
                                    href={link.path}
                                    onClick={(e) => handleNavigation(link.path, e)}
                                    className="footer-link"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="footer-section newsletter-section">
                    <p className="footer-heading">Newsletter</p>
                    <p className="newsletter-description">
                        Sign up for our newsletter to get update information, news, insights, or promotions.
                    </p>
                    <form onSubmit={handleSubscribe} className="newsletter-form">
                        <div className="input-group-container">
                            <span className="input-icon"><FaEnvelope /></span>
                            <input
                                type="email"
                                placeholder="Email"
                                className="newsletter-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="newsletter-btn">
                            <FaPaperPlane className="btn-icon" /> Sign Up
                        </button>
                    </form>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-bottom-container">
                    <div className="copyright">
                        Copyright © 2025 ProgZ Edutech Solutions Private Limited. All rights reserved.
                    </div>

                    <div className="middle-link">
                        <a href="https://www.urbancode.in" target="_blank" rel="noopener noreferrer" className="website-link">
                            www.urbancode.in
                        </a>
                    </div>

                    <div className="legal-links">
                        <a href="/privacy-policy" className="legal-link">Terms of Service</a>
                        <span className="legal-separator">|</span>
                        <a href="/privacy-policy" className="legal-link">Privacy Policy</a>
                        <span className="legal-separator">|</span>
                        <a href="/privacy-policy" className="legal-link">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
