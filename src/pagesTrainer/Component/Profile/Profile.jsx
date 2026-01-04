import React from 'react';
import {
    FaArrowLeft,
    FaCamera,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaUser,
    FaCalendarAlt,
    FaLock,
    FaGraduationCap,
    FaBriefcase,
    FaIdBadge,
    FaEdit
} from 'react-icons/fa';
import './Profile.css';
import { useTrainerProfile } from '../../../hooks/useTrainerProfile';
const Profile = ({ onEdit, onBack }) => {
    const { data: profileData, isLoading } = useTrainerProfile();


    if (isLoading) {
        return <p>Loading profile...</p>;
    }

    return (
        <div className="profile-wrapper">
            <div className="profile-container">
                <div className="profile-header">
                    <button className="back-btn" onClick={onBack}><FaArrowLeft /></button>
                    <h1>Profile</h1>
                </div>

                <div className="profile-card">
                    <div className="profile-sidebar">
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                
                                    <FaUser className="avatar-img"/>
                                
                                {/* <img src={personalDetails.avatar} alt="Avatar" className="avatar-img" /> */}
                            </div>
                            <h2 className="profile-name">{profileData.name}</h2>
                            <span className="profile-role-badge">{profileData.role}</span>
                            <div className="sidebar-info">
                                <div className="info-item">
                                    <FaEnvelope /> <span>{profileData.email}</span>
                                </div>
                                <div className="info-item">
                                    <FaPhone /> <span>{profileData.phone}</span>
                                </div>
                                <div className="info-item">
                                    <FaMapMarkerAlt /> <span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-main">
                        <section className="details-section bordered-section">
                            <div className="section-header">
                                <div className="section-title-group">
                                    <h2>Personal Details</h2>
                                    <p>Manage your personal information and address</p>
                                </div>
                                <button className="edit-profile-btn" onClick={onEdit}>
                                    <FaEdit /> Edit Profile
                                </button>
                            </div>

                            <div className="details-grid">
                                <div className="detail-box">
                                    <div className="detail-icon"><FaUser /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">Full Name</span>
                                        <span className="detail-value">{profileData.name}</span>
                                    </div>
                                </div>
                                <div className="detail-box">
                                    <div className="detail-icon"><FaEnvelope /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">Email Address</span>
                                        <span className="detail-value">{profileData.email}</span>
                                    </div>
                                </div>
                                <div className="detail-box">
                                    <div className="detail-icon"><FaPhone /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">Mobile Number</span>
                                        <span className="detail-value">{profileData.phone}</span>
                                    </div>
                                </div>
                                <div className="detail-box">
                                    <div className="detail-icon"><FaPhone /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">Alternate Mobile Number</span>
                                        <span className="detail-value"></span>
                                    </div>
                                </div>
                                <div className="detail-box">
                                    <div className="detail-icon"><FaCalendarAlt /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">Date of Birth</span>
                                        <span className="detail-value">yts</span>
                                    </div>
                                </div>
                                <div className="detail-box">
                                    <div className="detail-icon"><FaUser /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">Gender</span>
                                        <span className="detail-value">yts</span>
                                    </div>
                                </div>
                                <div className="detail-box address-box">
                                    <div className="detail-icon"><FaMapMarkerAlt /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">Address</span>
                                        <span className="detail-value">YTS</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="details-section bordered-section">
                            <div className="section-header">
                                <div className="section-title-group">
                                    <h2>Education & Employment Details</h2>
                                </div>
                            </div>

                            <div className="details-grid">
                                <div className="detail-box">
                                    <div className="detail-icon"><FaIdBadge /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">Role</span>
                                        <span className="detail-value">{profileData.role}</span>
                                    </div>
                                </div>
                                <div className="detail-box">
                                    <div className="detail-icon"><FaGraduationCap /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">Education</span>
                                        <span className="detail-value"></span>
                                    </div>
                                </div>
                                <div className="detail-box">
                                    <div className="detail-icon"><FaMapMarkerAlt /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">University/School</span>
                                        <span className="detail-value"></span>
                                    </div>
                                </div>
                                <div className="detail-box">
                                    <div className="detail-icon"><FaBriefcase /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">Profession</span>
                                        <span className="detail-value"></span>
                                    </div>
                                </div>
                                <div className="detail-box">
                                    <div className="detail-icon"><FaBriefcase /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">Experience</span>
                                        <span className="detail-value"></span>
                                    </div>
                                </div>
                                <div className="detail-box">
                                    <div className="detail-icon"><FaIdBadge /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">Employment Status</span>
                                        <span className="detail-value"></span>
                                    </div>
                                </div>
                                <div className="detail-box address-box">
                                    <div className="detail-icon"><FaEdit /></div>
                                    <div className="detail-content">
                                        <span className="detail-label">Skills</span>
                                        <span className="detail-value">YTS</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
