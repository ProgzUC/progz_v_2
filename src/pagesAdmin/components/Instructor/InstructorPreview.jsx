import React, { useState } from 'react';
import './InstructorPreview.css';
import { useLocation, useNavigate } from 'react-router-dom';

import { useUpdateUser } from '../../../hooks/useAdminUsers';
import Swal from 'sweetalert2';

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

    const mapToFormData = (data) => ({
        ...data,
        qualification: data.education || data.qualification || "",
    });

    const initialData = mapToFormData(instructor || instructorFromState || mockData);
    const initialEditMode = location.state?.initialEditMode || false;
    const [isEditing, setIsEditing] = useState(initialEditMode);
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});

    const { mutate: updateUser } = useUpdateUser();

    const handleCancel = () => {
        if (isEditing) {
            setIsEditing(false);
            setFormData(initialData);
            setErrors({});
        } else {
            if (onCancel) {
                onCancel();
            } else {
                navigate(-1);
            }
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name?.trim()) newErrors.name = "Full Name is required";
        
        if (!formData.email?.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (formData.password) {
            if (formData.password.length < 6) {
                newErrors.password = "Password must be at least 6 characters";
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        if (formData.phone?.trim() && !/^\+?\d{10,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
            newErrors.phone = "Invalid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        const payload = {
            ...formData,
            education: formData.qualification,
        };
        delete payload.qualification;

        updateUser(
            { id: formData._id || formData.id, data: payload },
            {
                onSuccess: () => {
                    Swal.fire("Success", "Instructor details updated successfully", "success");
                    setIsEditing(false);
                },
                onError: (err) => {
                    Swal.fire("Error", err.response?.data?.msg || "Failed to update instructor", "error");
                },
            }
        );
    };

    const handleDOBChange = (e) => {
        const { value } = e.target;
        const prevState = formData.dob || "";
        let digits = value.replace(/\D/g, "");

        // Detect deletion
        if (value.length < prevState.length) {
            const prevDigits = prevState.replace(/\D/g, "");
            if (digits.length === prevDigits.length && digits.length > 0) {
                digits = digits.slice(0, -1);
            }
        }

        digits = digits.slice(0, 8);

        if (digits.length === 0) {
            setFormData({ ...formData, dob: "" });
            return;
        }

        const template = "dd/mm/yyyy";
        let formatted = "";
        let dIdx = 0;
        for (let i = 0; i < template.length; i++) {
            if (template[i] === "/") {
                formatted += "/";
            } else {
                if (dIdx < digits.length) {
                    formatted += digits[dIdx++];
                } else {
                    formatted += template[i];
                }
            }
        }
        setFormData({ ...formData, dob: formatted });
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
                        <label>Full Name {isEditing && <span style={{color: 'red'}}>*</span>}</label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            readOnly={!isEditing}
                            className={`ip-input ${isEditing ? 'editable' : ''} ${errors.name ? 'input-error' : ''}`}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: null });
                            }}
                        />
                        {errors.name && <span className="ip-error-text" style={{color: 'red', fontSize: '12px'}}>{errors.name}</span>}
                    </div>
                    <div className="ip-form-group">
                        <label>Email {isEditing && <span style={{color: 'red'}}>*</span>}</label>
                        <input
                            type="email"
                            value={formData.email || ''}
                            readOnly={!isEditing}
                            className={`ip-input ${isEditing ? 'editable' : ''} ${errors.email ? 'input-error' : ''}`}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (errors.email) setErrors({ ...errors, email: null });
                            }}
                        />
                        {errors.email && <span className="ip-error-text" style={{color: 'red', fontSize: '12px'}}>{errors.email}</span>}
                    </div>
                    {isEditing && (
                        <>
                            <div className="ip-form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={formData.password || ''}
                                    placeholder="Leave blank to keep current"
                                    readOnly={!isEditing}
                                    className={`ip-input ${isEditing ? 'editable' : ''} ${errors.password ? 'input-error' : ''}`}
                                    onChange={(e) => {
                                        setFormData({ ...formData, password: e.target.value });
                                        if (errors.password) setErrors({ ...errors, password: null });
                                    }}
                                />
                                {errors.password && <span className="ip-error-text" style={{color: 'red', fontSize: '12px'}}>{errors.password}</span>}
                            </div>
                            <div className="ip-form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword || ''}
                                    placeholder="Confirm new password"
                                    onChange={(e) => {
                                        setFormData({ ...formData, confirmPassword: e.target.value });
                                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                                    }}
                                    readOnly={!isEditing}
                                    className={`ip-input ${isEditing ? 'editable' : ''} ${errors.confirmPassword ? 'input-error' : ''}`}
                                />
                                {errors.confirmPassword && <span className="ip-error-text" style={{color: 'red', fontSize: '12px'}}>{errors.confirmPassword}</span>}
                            </div>
                        </>
                    )}
                    <div className="ip-form-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            value={formData.phone || ''}
                            readOnly={!isEditing}
                            className={`ip-input ${isEditing ? 'editable' : ''} ${errors.phone ? 'input-error' : ''}`}
                            onChange={(e) => {
                                setFormData({ ...formData, phone: e.target.value });
                                if (errors.phone) setErrors({ ...errors, phone: null });
                            }}
                        />
                        {errors.phone && <span className="ip-error-text" style={{color: 'red', fontSize: '12px'}}>{errors.phone}</span>}
                    </div>
                    <div className="ip-form-group">
                        <label>Date of Birth</label>
                        <input
                            type="text"
                            value={formData.dob || ''}
                            readOnly={!isEditing}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            onChange={handleDOBChange}
                            placeholder="DD/MM/YYYY"
                            maxLength="15"
                        />
                    </div>
                    <div className="ip-form-group">
                        <label>Gender</label>
                        <input
                            type="text"
                            value={formData.gender || ''}
                            readOnly={!isEditing}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        />
                    </div>
                    <div className="ip-form-group">
                        <label>Alternate Phone No</label>
                        <input
                            type="text"
                            value={formData.altPhone || ''}
                            readOnly={!isEditing}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                        />
                    </div>
                    <div className="ip-form-group full-width">
                        <label>Address</label>
                        <textarea
                            className={`ip-input as-textarea ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                            value={formData.education || ''}
                            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ip-form-group">
                        <label>Profession</label>
                        <input
                            type="text"
                            value={formData.profession || ''}
                            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ip-form-group">
                        <label>Experience</label>
                        <input
                            type="text"
                            value={formData.experience || ''}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ip-form-group">
                        <label>Employment Status</label>
                        <div className="select-wrapper">
                            <input
                                type="text"
                                value={formData.employmentStatus || ''}
                                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                                className={`ip-input ${isEditing ? 'editable' : ''}`}
                                readOnly={!isEditing}
                            />

                        </div>
                    </div>
                    <div className="ip-form-group full-width">
                        <label>University/School</label>
                        <input
                            type="text"
                            value={formData.university || ''}
                            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ip-form-group full-width">
                        <label>Skills</label>
                        <textarea
                            className={`ip-input as-textarea ${isEditing ? 'editable' : ''}`}
                            value={formData.skills || ''}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            readOnly={!isEditing}
                        ></textarea>
                    </div>
                </div>

                {/* Additional Info */}
                {/* <h3 className="ip-section-title">Additional Info</h3>
                <div className="ip-grid">
                    <div className="ip-form-group">
                        <label>Zen Course Name</label>
                        <input
                            type="text"
                            value={formData.zenCourseName || ''}
                            onChange={(e) => setFormData({ ...formData, zenCourseName: e.target.value })}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ip-form-group">
                        <label>Zen Course Type</label>
                        <input
                            type="text"
                            value={formData.zenCourseType || ''}
                            onChange={(e) => setFormData({ ...formData, zenCourseType: e.target.value })}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="ip-form-group">
                        <label>Source</label>
                        <input
                            type="text"
                            value={formData.source || ''}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className={`ip-input ${isEditing ? 'editable' : ''}`}
                            readOnly={!isEditing}
                        />
                    </div>
                </div> */}

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
