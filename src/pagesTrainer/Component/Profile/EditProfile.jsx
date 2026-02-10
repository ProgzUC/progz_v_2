import React, { useState } from 'react';
import {
    FaArrowLeft,
    FaCamera,
    FaSave,
    FaTimes,
    FaUser
} from 'react-icons/fa';
import './Profile.css';
import { useTrainerProfile, useUpdateTrainerProfile } from '../../../hooks/useTrainerProfile';
import Loader from '../../../components/common/Loader/Loader';

const EditProfile = ({ onCancel, onBack }) => {
    const { data: profileData, isLoading } = useTrainerProfile();
    const updateProfile = useUpdateTrainerProfile();
    const [formData, setFormData] = useState(profileData || {});
    const fileInputRef = React.useRef(null);

    // Update formData when profileData loads
    React.useEffect(() => {
        if (profileData) {
            setFormData(profileData);
        }
    }, [profileData]);

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
                    avatar: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfile.mutate(formData, {
            onSuccess: () => {
                onCancel(); // Close edit mode on success
            }
        });
    };

    if (isLoading) {
        return <Loader message="Loading profile..." />;
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
                                <div className="avatar-initials">
                                    {formData.name ? formData.name.charAt(0) : 'T'}
                                </div>
                            </div>
                            <h2 className="profile-name">{formData.name}</h2>
                            <span className="profile-role-badge">{formData.role || 'Trainer'}</span>
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
                                            name="name"
                                            value={formData.name || ''}
                                            disabled
                                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                        />
                                        <small style={{ color: '#666', fontSize: '12px' }}>Only admin can edit this field</small>
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email || ''}
                                            disabled
                                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                        />
                                        <small style={{ color: '#666', fontSize: '12px' }}>Only admin can edit this field</small>
                                    </div>
                                    <div className="form-group">
                                        <label>Mobile Number</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone || ''}
                                            disabled
                                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                        />
                                        <small style={{ color: '#666', fontSize: '12px' }}>Only admin can edit this field</small>
                                    </div>

                                    <div className="form-group">
                                        <label>Alternate Mobile Number</label>
                                        <input
                                            type="text"
                                            name="altPhone"
                                            value={formData.altPhone || ''}
                                            onChange={handleChange}
                                            placeholder="Enter alternate phone"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select
                                            name="gender"
                                            value={formData.gender || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address || ''}
                                            onChange={handleChange}
                                            placeholder="Enter your address"
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
                                        <label>Role</label>
                                        <input
                                            type="text"
                                            name="role"
                                            value={formData.role || ''}
                                            disabled
                                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                        />
                                        <small style={{ color: '#666', fontSize: '12px' }}>Only admin can edit this field</small>
                                    </div>
                                    <div className="form-group">
                                        <label>Education</label>
                                        <input
                                            type="text"
                                            name="education"
                                            value={formData.education || ''}
                                            onChange={handleChange}
                                            placeholder="e.g. B.Tech in Computer Science"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>University/School</label>
                                        <input
                                            type="text"
                                            name="university"
                                            value={formData.university || ''}
                                            onChange={handleChange}
                                            placeholder="Enter university name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Profession</label>
                                        <input
                                            type="text"
                                            name="profession"
                                            value={formData.profession || ''}
                                            onChange={handleChange}
                                            placeholder="e.g. Software Developer"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Experience</label>
                                        <input
                                            type="text"
                                            name="experience"
                                            value={formData.experience || ''}
                                            onChange={handleChange}
                                            placeholder="e.g. 5 years"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Employment Status</label>
                                        <select
                                            name="employmentStatus"
                                            value={formData.employmentStatus || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Work">Work</option>
                                            <option value="Student">Student</option>
                                            <option value="Unemployed">Unemployed</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Skills</label>
                                        <input
                                            type="text"
                                            name="skills"
                                            value={formData.skills || ''}
                                            onChange={handleChange}
                                            placeholder="e.g. React, Node.js, Python"
                                        />
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
