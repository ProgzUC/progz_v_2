import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import { FaArrowLeft } from "react-icons/fa";

const CertificateView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { certData } = location.state || {};

    if (!certData) {
        return (
            <div className="certificate-view-page" style={{ padding: "50px", textAlign: "center" }}>
                <h2>No certificate data found.</h2>
                <button className="profile-cancel-btn" onClick={() => navigate("/student-dashboard/profile")}>
                    Back to Profile
                </button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="certificate-view-page">
            <div className="certificate-view-header">
                <button className="back-btn" onClick={() => navigate("/student-dashboard/profile")} title="Back to Profile">
                    <FaArrowLeft /> <span>Back to Profile</span>
                </button>
                <button className="profile-save-btn" onClick={handlePrint}>
                    🖨️ Download / Print Certificate
                </button>
            </div>

            <div className="certificate-paper-container" id="certificate-print-area">
                <div className="premium-cert-container">
                    <div className="cert-border-outer">
                        <div className="cert-border-inner">
                            <div className="cert-content">
                                <div className="cert-logo">
                                    <span className="logo-text">ProgZ</span>
                                    <span className="logo-dot">.</span>
                                </div>
                                <h1 className="cert-title">Certificate of Completion</h1>
                                <p className="cert-subtitle">This is to certify that</p>
                                <h2 className="student-name-display">{certData.studentName}</h2>
                                <p className="cert-body">
                                    has successfully completed the professional course in
                                </p>
                                <h3 className="course-name-display">{certData.courseName}</h3>

                                <div className="cert-dates-grid">
                                    <div className="date-item">
                                        <span className="date-label">Start Date</span>
                                        <span className="date-value">{certData.startDate}</span>
                                    </div>
                                    <div className="date-item">
                                        <span className="date-label">Completion Date</span>
                                        <span className="date-value">{certData.completionDate}</span>
                                    </div>
                                </div>

                                <div className="cert-footer-layout">
                                    <div className="signature-area">
                                        <div className="signature-line"></div>
                                        <span className="signature-label">Program Director</span>
                                    </div>
                                    <div className="progz-stamp">
                                        <div className="stamp-inner">
                                            <span>Trained with</span>
                                            <strong>ProgZ</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateView;
