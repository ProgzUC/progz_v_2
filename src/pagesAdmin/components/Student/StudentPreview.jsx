import React, { useState } from 'react';
import './StudentPreview.css';
import { useLocation, useNavigate } from 'react-router-dom';

import { useUpdateUser } from '../../../hooks/useAdminUsers';
import Swal from 'sweetalert2';

const StudentPreview = ({ student, onCancel }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const studentFromState = location.state?.student;

    const mockData = {
        name: "Alexa Rawles",
        email: "alexarawles@gmail.com",
        mobile: "+123456789",
        qualification: "Not specified",
        role: "Student",
        password: "password123",
    };

    // Map qualification to education if needed
    const mapToFormData = (data) => ({
        ...data,
        qualification: data.education || data.qualification || "",
    });

    const initialData = mapToFormData(student || studentFromState || mockData);
    const initialEditMode = location.state?.initialEditMode || false;
    const [isEditing, setIsEditing] = useState(initialEditMode);
    const [formData, setFormData] = useState(initialData);

    const { mutate: updateUser } = useUpdateUser();

    const handleCancel = () => {
        if (isEditing) {
            setIsEditing(false);
            setFormData(initialData); // Reset changes
        } else {
            if (onCancel) {
                onCancel();
            } else {
                navigate(-1);
            }
        }
    };

    const handleSave = () => {
        const payload = {
            ...formData,
            education: formData.qualification, // Map back to backend field
        };
        // Remove virtual/UI fields if any
        delete payload.qualification;

        updateUser(
            { id: formData._id || formData.id, data: payload },
            {
                onSuccess: () => {
                    Swal.fire("Success", "Student details updated successfully", "success");
                    setIsEditing(false);
                },
                onError: (err) => {
                    Swal.fire("Error", err.response?.data?.msg || "Failed to update student", "error");
                },
            }
        );
    };

    return (
        <div className="ep-container">
            {/* Top Green Gradient Bar */}
            <div className="ep-header-bar"></div>

            {/* Profile Section */}
            <div className="ep-profile-section">
                <div className="ep-profile-info">
                    <div className="ep-avatar-placeholder">
                        <i className="bi bi-person-fill"></i>
                    </div>
                    <div className="ep-user-text">
                        <h2>{formData.name}</h2>
                        <p>{formData.email}</p>
                    </div>
                </div>
                {!isEditing && (
                    <button className="ep-edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                )}
            </div>

            <div className="ep-form-content">

                {/* Personal Details */}
                <h3 className="ep-section-title">Personal Details</h3>
                <div className="ep-grid">
                    <div className="ep-form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            readOnly={!isEditing}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email || ''}
                            readOnly={!isEditing}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    {isEditing && (
                        <>
                            <div className="ep-form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={formData.password || ''}
                                    placeholder="Enter new password"
                                    readOnly={!isEditing}
                                    className={`ep-input ${isEditing ? 'editable' : ''}`}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="ep-form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword || ''}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    readOnly={!isEditing}
                                    className={`ep-input ${isEditing ? 'editable' : ''}`}
                                />
                            </div>
                        </>
                    )}
                    <div className="ep-form-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            value={formData.phone || ''}
                            readOnly={!isEditing}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Date of Birth</label>
                        <input
                            type="text"
                            value={formData.dob || ''}
                            readOnly={!isEditing}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            placeholder="DD/MM/YYYY"
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Gender</label>
                        <input // Using input for simplicity, could be select
                            type="text"
                            value={formData.gender || ''}
                            readOnly={!isEditing}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Alternate Phone No</label>
                        <input
                            type="text"
                            value={formData.altPhone || ''}
                            readOnly={!isEditing}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                        />
                    </div>
                    <div className="ep-form-group full-width">
                        <label>Address</label>
                        <textarea
                            className={`ep-input as-textarea ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        ></textarea>
                    </div>
                </div>

                {/* Role */}
                <h3 className="ep-section-title">Role</h3>
                <div className="ep-role-group">
                    <div className={`ep-role-option disabled`}>
                        <div className="ep-radio-custom"></div>
                        <span>Instructor</span>
                    </div>
                    <div className={`ep-role-option active`}>
                        <div className="ep-radio-custom"></div>
                        <span>Student</span>
                    </div>
                </div>

                {/* Education & Employment */}
                <h3 className="ep-section-title">Education & Employment</h3>
                <div className="ep-grid">
                    <div className="ep-form-group">
                        <label>Education</label>
                        <input
                            type="text"
                            value={formData.education || ''}
                            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Profession</label>
                        <input
                            type="text"
                            value={formData.profession || ''}
                            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Experience</label>
                        <input
                            type="text"
                            value={formData.experience || ''}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Employment Status</label>
                        <input
                            type="text"
                            value={formData.employmentStatus || ''}
                            onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ep-form-group full-width">
                        <label>University/School</label>
                        <input
                            type="text"
                            value={formData.university || ''}
                            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ep-form-group full-width">
                        <label>Skills</label>
                        <textarea
                            className={`ep-input as-textarea ${isEditing ? 'editable' : ''}`}
                            value={formData.skills || ''}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            readOnly={!isEditing}
                        ></textarea>
                    </div>
                </div>

                {/* Additional Info */}
                <h3 className="ep-section-title">Additional Info</h3>
                <div className="ep-grid">
                    <div className="ep-form-group">
                        <label>Zen Course Name</label>
                        <input
                            type="text"
                            value={formData.zenCourseName || ''}
                            onChange={(e) => setFormData({ ...formData, zenCourseName: e.target.value })}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Zen Course Type</label>
                        <input
                            type="text"
                            value={formData.zenCourseType || ''}
                            onChange={(e) => setFormData({ ...formData, zenCourseType: e.target.value })}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Source</label>
                        <input
                            type="text"
                            value={formData.source || ''}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                </div>

                {/* Footer buttons */}
                {isEditing ? (
                    <div className="ep-footer">
                        <button className="ep-cancel-btn" onClick={handleCancel}>Cancel</button>
                        <button className="ep-save-btn" onClick={handleSave}>Save</button>
                    </div>
                ) : (
                    <div className="ep-footer">
                        <button className="ep-cancel-btn" onClick={handleCancel}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentPreview;
