import React from "react";
import "./Footer.css";

// Social media icons
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

// Contact icons
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";

/* -----------------------------------------
   SOCIAL MEDIA LINKS (Dynamic with Array)
   -----------------------------------------
------------------------------------------ */
const socialLinks = [
    { name: "Facebook", icon: <FaFacebook />, href: "#" },
    { name: "Instagram", icon: <FaInstagram />, href: "#" },
    { name: "Twitter", icon: <FaTwitter />, href: "#" },
    { name: "LinkedIn", icon: <FaLinkedin />, href: "#" },
];

const Footer = () => {
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
                        {socialLinks.map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                className="social-icon"
                                aria-label={item.name}
                            >
                                {/* Social platform icon */}
                                {item.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* -------- Footer Quick Navigation Links -------- */}
                <div className="footer-section links-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Courses</a></li>
                        <li><a href="#">Students Reviews</a></li>
                        <li><a href="#">Instructors</a></li>
                    </ul>
                </div>

                {/* ----------- Course Categories Section ----------- */}
                <div className="footer-section categories-section">
                    <h3>Popular Categories</h3>
                    <ul>
                        <li><a href="#">Web Development</a></li>
                        <li><a href="#">Data Science</a></li>
                        <li><a href="#">AI & Machine Learning</a></li>
                        <li><a href="#">Cyber Security</a></li>
                    </ul>
                </div>

                {/* -------- Contact Information Section -------- */}
                <div className="footer-section contact-section">
                    <h3>Stay Connected</h3>

                    <ul>
                        {/* Email Row */}
                        <li>
                            <span className="icon">
                                <FiMail className="contact-icon" />
                            </span>
                            <span>admin@urbancode.in</span>
                        </li>

                        {/* Phone Row */}
                        <li>
                            <span className="icon">
                                <FiPhone className="contact-icon" />
                            </span>
                            <span>+91 98787 98797</span>
                        </li>

                        {/* Location Row */}
                        <li>
                            <span className="icon">
                                <FiMapPin className="contact-icon" />
                            </span>
                            <span>Velachery | Pallikaranai | Chennai</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* ----------- Bottom Footer Legal Section ----------- */}
            <div className="footer-bottom">
                {/* Copyright */}
                <div className="copyright">
                    &copy; 2023 ProgZ Inc.
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
