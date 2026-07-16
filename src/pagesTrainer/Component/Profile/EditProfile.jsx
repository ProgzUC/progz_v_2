import React, { useState } from 'react';
import {
    FaArrowLeft,
    FaCamera,
    FaSave,
    FaTimes,
    FaUser,
    FaMapMarkerAlt
} from 'react-icons/fa';
import './Profile.css';
import { useTrainerProfile, useUpdateTrainerProfile } from '../../../hooks/useTrainerProfile';
import Loader from '../../../components/common/Loader/Loader';
import FileDropZone from '../../../components/common/FileDropZone/FileDropZone';
import { uploadToCloudinary } from '../../../utils/cloudinary';
import { showSuccess, showError } from '../../../utils/toast';

const EditProfile = ({ onCancel, onBack }) => {
    const { data: profileData, isLoading, isError, error } = useTrainerProfile();
    const updateProfile = useUpdateTrainerProfile();
    const [formData, setFormData] = useState(profileData || {});
    const [selectedFile, setSelectedFile] = useState(null);
    const [saving, setSaving] = useState(false);

    // Update formData when profileData loads
    React.useEffect(() => {
        if (profileData) {
            setFormData(profileData);
        }
    }, [profileData]);

    const handleImageFile = (file) => {
        if (!file) return;
        setSelectedFile(file);
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({
            ...prev,
            profileImage: previewUrl,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = { ...formData };
            delete payload._id;
            delete payload.__v;
            delete payload.createdAt;
            delete payload.updatedAt;

            if (selectedFile) {
                const uploaded = await uploadToCloudinary(selectedFile, "profiles");
                if (uploaded?.url) payload.profileImage = uploaded.url;
            } else if (formData.profileImage && !formData.profileImage.startsWith("blob:")) {
                payload.profileImage = formData.profileImage;
            } else {
                delete payload.profileImage;
            }

            updateProfile.mutate(payload, {
                onSuccess: () => {
                    showSuccess('Profile updated successfully!');
                    onCancel();
                },
                onError: (err) => showError(err?.message || 'Failed to update profile'),
                onSettled: () => setSaving(false),
            });
        } catch (uploadErr) {
            setSaving(false);
            console.error(uploadErr);
        }
    };

    if (isLoading) {
        return <Loader message="Loading profile..." />;
    }

    if (isError) {
        return <div className="error-state">Error: {error?.message || "Failed to load profile"}</div>;
    }

    return (
        <div className="profile-wrapper">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>Profile</h1>
                </div>

                <div className="profile-card">
                    <div className="profile-sidebar">
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt={formData.name} className="avatar-image" />
                                ) : (
                                    <div className="avatar-initials">
                                        {formData.name ? formData.name.charAt(0) : 'T'}
                                    </div>
                                )}
                            </div>
                            <h2 className="profile-name">{formData.name}</h2>
                            <span className="profile-role-badge">{formData.role || 'Trainer'}</span>
                            <div style={{ marginTop: '12px', width: '100%' }}>
                                <FileDropZone
                                    compact
                                    accept="image/*"
                                    hint="Drop profile photo"
                                    onFiles={handleImageFile}
                                />
                            </div>
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
                                        <div className="input-with-icon">
                                            <FaMapMarkerAlt />
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address || ''}
                                                onChange={handleChange}
                                                placeholder="Enter your address"
                                            />
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
                                <button type="submit" className="save-btn" disabled={saving || updateProfile.isPending}>
                                    <FaSave /> {saving || updateProfile.isPending ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
