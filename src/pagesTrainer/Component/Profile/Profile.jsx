import React from 'react';
import {
    FaArrowLeft,
    FaEnvelope,
    FaMapMarkerAlt,
    FaUser,
    FaCalendarAlt,
    FaGraduationCap,
    FaBriefcase,
    FaIdBadge,
    FaEdit
} from 'react-icons/fa';
import { MdPhone } from 'react-icons/md';
import './Profile.css';
import { useTrainerProfile } from '../../../hooks/useTrainerProfile';
import Loader from '../../../components/common/Loader/Loader';

const Profile = ({ onEdit, onBack }) => {
    const { data: profileData, isLoading, isError, error } = useTrainerProfile();


    if (isLoading) {
        return <Loader message="Loading profile..." />;
    }

    if (isError || !profileData) {
        return <div className="error-state">Error: {error?.message || "Failed to load profile"}</div>;
    }

    return (
        <div className="profile-wrapper">
            <div className="profile-container">
                <div className="profile-header">
                    <button className="back-btn" onClick={onBack} aria-label="Back"><FaArrowLeft /></button>
                </div>

                <div className="profile-hero-card">
                    <div className="hero-top">
                        <div className="avatar-wrapper">
                            {profileData.profileImage ? (
                                <img src={profileData.profileImage} alt={profileData.name} className="avatar-image" />
                            ) : (
                                <div className="avatar-initials">
                                    {profileData.name ? profileData.name.charAt(0) : 'T'}
                                </div>
                            )}
                        </div>

                        <div className="hero-identity">
                            <div className="hero-name-row">
                                <h2 className="profile-name">{profileData.name}</h2>
                            </div>

                            <div className="hero-contacts">
                                <div className="info-item">
                                    <FaEnvelope /> <span className="email-text">{profileData.email}</span>
                                </div>
                                <div className="info-item">
                                    <MdPhone /> <span>{profileData.phone}</span>
                                </div>
                            </div>
                        </div>

                        <button className="edit-profile-btn" onClick={onEdit}>
                            Edit Profile <FaEdit />
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="detail-icon tone-green"><FaIdBadge /></div>
                            <div className="detail-content">
                                <span className="detail-label">Role</span>
                                <span className="detail-value">{profileData.role}</span>
                            </div>
                        </div>
                        <div className="hero-stat">
                            <div className="detail-icon tone-purple"><FaEnvelope /></div>
                            <div className="detail-content">
                                <span className="detail-label">Email</span>
                                <span className="detail-value email-text">{profileData.email}</span>
                            </div>
                        </div>
                        <div className="hero-stat">
                            <div className="detail-icon tone-blue"><MdPhone /></div>
                            <div className="detail-content">
                                <span className="detail-label">Mobile</span>
                                <span className="detail-value">{profileData.phone}</span>
                            </div>
                        </div>
                        {profileData.address && (
                            <div className="hero-stat">
                                <div className="detail-icon tone-orange"><FaMapMarkerAlt /></div>
                                <div className="detail-content">
                                    <span className="detail-label">Location</span>
                                    <span className="detail-value">{profileData.address}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <section className="details-section">
                    <div className="section-header">
                        <div className="section-title-group">
                            <span className="section-title-icon"><FaUser /></span>
                            <h2>Personal Details</h2>
                        </div>
                    </div>

                    <div className="details-grid">
                        <div className="detail-box">
                            <div className="detail-icon tone-green"><FaUser /></div>
                            <div className="detail-content">
                                <span className="detail-label">Full Name</span>
                                <span className="detail-value">{profileData.name}</span>
                            </div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-icon tone-purple"><FaEnvelope /></div>
                            <div className="detail-content">
                                <span className="detail-label">Email Address</span>
                                <span className="detail-value email-text">{profileData.email}</span>
                            </div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-icon tone-blue"><MdPhone /></div>
                            <div className="detail-content">
                                <span className="detail-label">Mobile Number</span>
                                <span className="detail-value">{profileData.phone}</span>
                            </div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-icon tone-teal"><MdPhone /></div>
                            <div className="detail-content">
                                <span className="detail-label">Alternate Mobile Number</span>
                                <span className="detail-value">{profileData.altPhone || ''}</span>
                            </div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-icon tone-orange"><FaCalendarAlt /></div>
                            <div className="detail-content">
                                <span className="detail-label">Date of Birth</span>
                                <span className="detail-value">{profileData.dob || ''}</span>
                            </div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-icon tone-pink"><FaUser /></div>
                            <div className="detail-content">
                                <span className="detail-label">Gender</span>
                                <span className="detail-value">{profileData.gender || ''}</span>
                            </div>
                        </div>
                        <div className="detail-box address-box">
                            <div className="detail-icon tone-green"><FaMapMarkerAlt /></div>
                            <div className="detail-content">
                                <span className="detail-label">Address</span>
                                <span className="detail-value">{profileData.address || ''}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="details-section">
                    <div className="section-header">
                        <div className="section-title-group">
                            <span className="section-title-icon"><FaBriefcase /></span>
                            <h2>Education & Employment</h2>
                        </div>
                    </div>

                    <div className="details-grid">
                        <div className="detail-box">
                            <div className="detail-icon tone-green"><FaIdBadge /></div>
                            <div className="detail-content">
                                <span className="detail-label">Role</span>
                                <span className="detail-value">{profileData.role}</span>
                            </div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-icon tone-teal"><FaGraduationCap /></div>
                            <div className="detail-content">
                                <span className="detail-label">Education</span>
                                <span className="detail-value">{profileData.education || ''}</span>
                            </div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-icon tone-purple"><FaMapMarkerAlt /></div>
                            <div className="detail-content">
                                <span className="detail-label">University/School</span>
                                <span className="detail-value">{profileData.university || ''}</span>
                            </div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-icon tone-orange"><FaBriefcase /></div>
                            <div className="detail-content">
                                <span className="detail-label">Profession</span>
                                <span className="detail-value">{profileData.profession || ''}</span>
                            </div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-icon tone-blue"><FaBriefcase /></div>
                            <div className="detail-content">
                                <span className="detail-label">Experience</span>
                                <span className="detail-value">{profileData.experience || ''}</span>
                            </div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-icon tone-orange"><FaIdBadge /></div>
                            <div className="detail-content">
                                <span className="detail-label">Employment Status</span>
                                <span className="detail-value">{profileData.employmentStatus || ''}</span>
                            </div>
                        </div>
                        <div className="detail-box address-box">
                            <div className="detail-icon tone-pink"><FaEdit /></div>
                            <div className="detail-content">
                                <span className="detail-label">Skills</span>
                                <span className="detail-value">{profileData.skills || ''}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Profile;
