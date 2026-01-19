import React, { useState } from 'react';
import './StudentPreview.css';
import { useLocation, useNavigate } from 'react-router-dom';

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

    const initialData = student || studentFromState || mockData;
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
                            value={formData.name}
                            readOnly={!isEditing}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            readOnly={!isEditing}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value="" // Empty in screenshot usually or hidden
                            placeholder="" // Screenshot shows blank grey input
                            readOnly={!isEditing}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value=""
                            readOnly={!isEditing}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            value={formData.mobile}
                            readOnly={!isEditing}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Date of Birth</label>
                        <input
                            type="text"
                            value="" // Empty in screenshot
                            readOnly={!isEditing}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                        />
                    </div>
                    <div className="ep-form-group full-width">
                        <label>Alternate Phone No</label>
                        <input
                            type="text"
                            value=""
                            readOnly={!isEditing}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                        />
                    </div>
                    <div className="ep-form-group full-width">
                        <label>Address</label>
                        <textarea
                            className={`ep-input as-textarea ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                            defaultValue=""
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
                            value={formData.qualification || ''}
                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                            className={`ep-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ep-form-group">
                        <label>Profession</label>
                        <input type="text" className={`ep-input ${isEditing ? 'editable' : ''}`} readOnly={!isEditing} />
                    </div>
                    <div className="ep-form-group">
                        <label>Experience</label>
                        <input type="text" className={`ep-input ${isEditing ? 'editable' : ''}`} readOnly={!isEditing} />
                    </div>
                    <div className="ep-form-group">
                        <label>Employment Status</label>
                        <div className="select-wrapper">
                            <input type="text" className={`ep-input ${isEditing ? 'editable' : ''}`} readOnly={!isEditing} />
                            <i className="bi bi-chevron-down select-icon"></i>
                        </div>
                    </div>
                    <div className="ep-form-group full-width">
                        <label>University/School</label>
                        <input type="text" className={`ep-input ${isEditing ? 'editable' : ''}`} readOnly={!isEditing} />
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
