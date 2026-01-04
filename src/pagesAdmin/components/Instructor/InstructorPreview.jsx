import React, { useState } from 'react';
import './InstructorPreview.css';
import { useLocation, useNavigate } from 'react-router-dom';

const InstructorPreview = ({ instructor, onCancel }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const instructorFromState = location.state?.instructor;

    const mockData = {
        name: "Instructor Name",
        email: "instructor@example.com",
        mobile: "+123456789",
        qualification: "PhD in Computer Science\n10 years experience",
        role: "Instructor",
        password: "password123",
    };

    const initialData = instructor || instructorFromState || mockData;
    const initialEditMode = location.state?.initialEditMode || false;
    const [isEditing, setIsEditing] = useState(initialEditMode);
    const [formData, setFormData] = useState(initialData);

    const handleCancel = () => {
        if (isEditing) {
            setIsEditing(false);
        } else {
            if (onCancel) {
                onCancel();
            } else {
                navigate(-1);
            }
        }
    };

    const handleSave = () => {
        setIsEditing(false);
    };

    return (
        <div className="ip-container">
            {/* Top Green Gradient Bar */}
            <div className="ip-header-bar"></div>

            {/* Profile Section */}
            <div className="ip-profile-section">
                <div className="ip-profile-info">
                    <div className="ip-avatar-placeholder">
                        <i className="bi bi-person-fill"></i>
                    </div>
                    <div className="ip-user-text">
                        <h2>{formData.name}</h2>
                        <p>{formData.email}</p>
                    </div>
                </div>
                {!isEditing && (
                    <button className="ip-edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                )}
            </div>

            <div className="ip-form-content">

                {/* Personal Details */}
                <h3 className="ip-section-title">Personal Details</h3>
                <div className="ip-grid">
                    <div className="ip-form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            readOnly={!isEditing}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="ip-form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            readOnly={!isEditing}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="ip-form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value=""
                            placeholder=""
                            readOnly={!isEditing}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                        />
                    </div>
                    <div className="ip-form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value=""
                            readOnly={!isEditing}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                        />
                    </div>
                    <div className="ip-form-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            value={formData.mobile}
                            readOnly={!isEditing}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        />
                    </div>
                    <div className="ip-form-group">
                        <label>Date of Birth</label>
                        <input
                            type="text"
                            value=""
                            readOnly={!isEditing}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                        />
                    </div>
                    <div className="ip-form-group full-width">
                        <label>Alternate Phone No</label>
                        <input
                            type="text"
                            value=""
                            readOnly={!isEditing}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                        />
                    </div>
                    <div className="ip-form-group full-width">
                        <label>Address</label>
                        <textarea
                            className={`ip-input as-textarea ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                            defaultValue=""
                        ></textarea>
                    </div>
                </div>

                {/* Role */}
                <h3 className="ip-section-title">Role</h3>
                <div className="ip-role-group">
                    <div className={`ip-role-option active`}>
                        <div className="ip-radio-custom"></div>
                        <span>Instructor</span>
                    </div>
                    <div className={`ip-role-option disabled`}>
                        <div className="ip-radio-custom"></div>
                        <span>Student</span>
                    </div>
                </div>

                {/* Education & Employment */}
                <h3 className="ip-section-title">Education & Employment</h3>
                <div className="ip-grid">
                    <div className="ip-form-group">
                        <label>Education</label>
                        <input
                            type="text"
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ip-form-group">
                        <label>Profession</label>
                        <input type="text" className={`ip-input ${isEditing ? 'editable' : ''}`} readOnly={!isEditing} />
                    </div>
                    <div className="ip-form-group">
                        <label>Experience</label>
                        <input type="text" className={`ip-input ${isEditing ? 'editable' : ''}`} readOnly={!isEditing} />
                    </div>
                    <div className="ip-form-group">
                        <label>Employment Status</label>
                        <div className="select-wrapper">
                            <input type="text" className={`ip-input ${isEditing ? 'editable' : ''}`} readOnly={!isEditing} />
                            <i className="bi bi-chevron-down select-icon"></i>
                        </div>
                    </div>
                    <div className="ip-form-group full-width">
                        <label>University/School</label>
                        <input type="text" className={`ip-input ${isEditing ? 'editable' : ''}`} readOnly={!isEditing} />
                    </div>
                </div>

                {/* Footer buttons */}
                {isEditing ? (
                    <div className="ip-footer">
                        <button className="ip-cancel-btn" onClick={handleCancel}>Cancel</button>
                        <button className="ip-save-btn" onClick={handleSave}>Save</button>
                    </div>
                ) : (
                    <div className="ip-footer">
                        <button className="ip-cancel-btn" onClick={handleCancel}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorPreview;
