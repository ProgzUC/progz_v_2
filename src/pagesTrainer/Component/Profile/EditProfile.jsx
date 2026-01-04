import React, { useState } from 'react';
import {
    FaArrowLeft,
    FaCamera,
    FaSave,
    FaTimes
} from 'react-icons/fa';
import './Profile.css';
const EditProfile = ({ profileData, onCancel, onSave, onBack }) => {
    const [formData, setFormData] = useState(profileData);
    const fileInputRef = React.useRef(null);

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    personalDetails: {
                        ...prev.personalDetails,
                        avatar: reader.result
                    }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

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
                            <div className="avatar-wrapper" onClick={handleImageClick} style={{ cursor: 'pointer' }}>
                                <img src={formData.personalDetails.avatar} alt="Avatar" className="avatar-img" />
                                <div className="edit-avatar-badge">
                                    <FaCamera size={12} />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <h2 className="profile-name">{formData.personalDetails.fullName}</h2>
                            <span className="profile-role-badge">{formData.personalDetails.role}</span>
                        </div>
                    </div>

                    <div className="profile-main">
                        <form onSubmit={handleSubmit} className="edit-form">
                            <section className="details-section bordered-section">
                                <div className="section-header">
                                    <div className="section-title-group">
                                        <h2>Personal Details</h2>
                                        <p>Update your personal information.</p>
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="personalDetails.fullName"
                                            value={formData.personalDetails.fullName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            name="personalDetails.email"
                                            value={formData.personalDetails.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mobile Number</label>
                                        <input
                                            type="text"
                                            name="personalDetails.mobileNumber"
                                            value={formData.personalDetails.mobileNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Alternate Mobile Number</label>
                                        <input
                                            type="text"
                                            name="personalDetails.alternateMobileNumber"
                                            value={formData.personalDetails.alternateMobileNumber || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <input
                                            type="date"
                                            name="personalDetails.dateOfBirth"
                                            value={formData.personalDetails.dateOfBirth}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            name="personalDetails.password"
                                            value={formData.personalDetails.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <input
                                            type="password"
                                            placeholder="************"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select
                                            name="personalDetails.gender"
                                            value={formData.personalDetails.gender}
                                            onChange={handleChange}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input
                                            type="text"
                                            name="personalDetails.address"
                                            value={formData.personalDetails.address}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            name="personalDetails.city"
                                            value={formData.personalDetails.city}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input
                                            type="text"
                                            name="personalDetails.state"
                                            value={formData.personalDetails.state}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <input
                                            type="text"
                                            name="personalDetails.country"
                                            value={formData.personalDetails.country}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="details-section bordered-section">
                                <div className="section-header">
                                    <div className="section-title-group">
                                        <h2>Education & Employment Details</h2>
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Education</label>
                                        <input
                                            type="text"
                                            name="educationEmployment.education"
                                            value={formData.educationEmployment.education}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>University/School</label>
                                        <input
                                            type="text"
                                            name="educationEmployment.university"
                                            value={formData.educationEmployment.university}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Profession</label>
                                        <input
                                            type="text"
                                            name="educationEmployment.profession"
                                            value={formData.educationEmployment.profession}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Skills</label>
                                        <input
                                            type="text"
                                            name="educationEmployment.skills"
                                            value={formData.educationEmployment.skills || ''}
                                            onChange={handleChange}
                                            placeholder="e.g. React, Node.js, UI/UX"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Experience</label>
                                        <input
                                            type="text"
                                            name="educationEmployment.experience"
                                            value={formData.educationEmployment.experience}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Employment Status</label>
                                        <select
                                            name="educationEmployment.employmentStatus"
                                            value={formData.educationEmployment.employmentStatus}
                                            onChange={handleChange}
                                        >
                                            <option value="Work">Work</option>
                                            <option value="Student">Student</option>
                                            <option value="Unemployed">Unemployed</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
                                <button type="submit" className="save-btn"><FaSave /> Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
