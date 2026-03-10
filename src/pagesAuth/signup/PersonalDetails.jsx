import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './PersonalDetails.css';

const PersonalDetails = ({ onNext, onCancel }) => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        altPhone: '',
        dob: '',
        address: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const formFields = [
        { id: 'name', label: 'Name', type: 'text', placeholder: 'Enter your name' },
        { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
        { id: 'password', label: 'Password', type: 'password', placeholder: 'Enter password' },
        { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Confirm password' },
        { id: 'phone', label: 'Phone', type: 'tel', placeholder: 'Enter phone number' },

        /* ✅ Moved BEFORE Date of Birth */
        { id: 'altPhone', label: 'Alternate Phone No (Optional)', type: 'tel', placeholder: 'Enter alternate phone number' },

        { id: 'dob', label: 'Date of Birth', type: 'date', placeholder: '' },

        /* ✅ Address full width & height increased */
        { id: 'address', label: 'Address', type: 'textarea', placeholder: 'Enter address', fullWidth: true },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;

        formFields.forEach(field => {
            const value = formData[field.id]?.trim();
            if (!value) {
                // altPhone is NOT mandatory
                if (field.id !== 'altPhone') {
                    newErrors[field.id] = `${field.label} is required`;
                    isValid = false;
                }
            } else {
                if (field.id === 'email' && !emailRegex.test(value)) {
                    newErrors[field.id] = "Invalid email format (needs @ and domain)";
                    isValid = false;
                }

                if (field.type === 'tel' && !phoneRegex.test(value)) {
                    newErrors[field.id] = "Must be exactly 10 digits";
                    isValid = false;
                }

                if (field.id === 'address' && value.length < 10) {
                    newErrors[field.id] = "Address must be at least 10 characters";
                    isValid = false;
                }
            }
        });

        if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            isValid = false;
        }

        if (formData.phone && formData.altPhone && formData.phone === formData.altPhone) {
            newErrors.altPhone = "Alternate phone must be different";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validateForm()) {
            onNext(formData);
        }
    };

    return (
        <div className="personal-details-container">
            <h2 className="page-title">Personal Details</h2>

            <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
                {formFields.map((field) => (
                    <div key={field.id} className={`form-group ${field.fullWidth ? 'full-width' : ''}`}>
                        <label className="form-label">{field.label}</label>

                        {/* ✅ TEXTAREA for Address */}
                        {field.type === 'textarea' ? (
                            <textarea
                                name={field.id}
                                placeholder={field.placeholder}
                                className={`form-input address-box ${errors[field.id] ? 'error' : ''}`}
                                value={formData[field.id]}
                                onChange={handleChange}
                            />
                        ) : field.id === 'password' || field.id === 'confirmPassword' ? (
                            <div className="password-wrapper">
                                <input
                                    type={field.id === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password')}
                                    name={field.id}
                                    placeholder={field.placeholder}
                                    className={`form-input ${errors[field.id] ? 'error' : ''}`}
                                    value={formData[field.id]}
                                    onChange={handleChange}
                                />
                                <span
                                    className="eye-icon"
                                    onClick={() => field.id === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {field.id === 'password' ? (
                                        showPassword ? <FaEyeSlash /> : <FaEye />
                                    ) : (
                                        showConfirmPassword ? <FaEyeSlash /> : <FaEye />
                                    )}
                                </span>
                            </div>
                        ) : (
                            <input
                                type={field.type}
                                name={field.id}
                                placeholder={field.placeholder}
                                className={`form-input ${errors[field.id] ? 'error' : ''}`}
                                value={formData[field.id]}
                                onChange={(e) => {
                                    if (field.type === 'tel') {
                                        const re = /^[0-9\b]+$/;
                                        if (e.target.value === '' || re.test(e.target.value)) {
                                            handleChange(e);
                                        }
                                    } else {
                                        handleChange(e);
                                    }
                                }}
                                maxLength={field.type === 'tel' ? 10 : undefined}
                            />
                        )}

                        {errors[field.id] && <span className="error-message">{errors[field.id]}</span>}
                    </div>
                ))}
            </form>

            <div className="button-group">
                <button className="btn btn-cancel" onClick={onCancel}>Cancel</button>
                <button className="btn btn-next" onClick={handleNext}>Next</button>
            </div>

            {/* Login Link */}
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
                Already have an account? <Link to="/login" style={{ color: '#198754', fontWeight: 'bold', cursor: 'pointer' }}>Login</Link>
            </div>
        </div>
    );
};

export default PersonalDetails;
