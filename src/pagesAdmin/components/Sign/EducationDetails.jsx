import React, { useState } from 'react';

import './UserEnrollment.css';


const educationConfig = [
    {
        id: 'education',
        label: 'Education',
        type: 'text',
        placeholder: '',
        width: 'half'
    },
    {
        id: 'university',
        label: 'University/School',
        type: 'text',
        placeholder: '',
        width: 'half'
    },
    {
        id: 'profession',
        label: 'Profession',
        type: 'text',
        placeholder: '',
        width: 'half'
    },
    {
        id: 'experience',
        label: 'Experience',
        type: 'select',
        placeholder: '',
        width: 'half',
        options: ['0-1 years', '1-3 years', '3-5 years', '5+ years']
    },
    {
        id: 'employmentStatus',
        label: 'Employment Status',
        type: 'text',
        placeholder: '',
        width: 'half'
    },
    {
        id: 'skills',
        label: 'Skills',
        type: 'text',
        placeholder: '',
        width: 'half'
    }
];


const EducationDetails = ({ onBack, onSubmit }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        let isValid = true;

        educationConfig.forEach(field => {
            if (!formData[field.id] || formData[field.id].trim() === '') {
                newErrors[field.id] = `${field.label} is required`;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmitClick = () => {
        if (validate()) {
            onSubmit();
        }
    };

    return (
        <div className="education-details-container">
            <h2 className="section-title">Education & Employment Details</h2>
            <form className="details-form">
                <div className="form-grid">
                    {educationConfig.map((field) => (
                        <div key={field.id} className={`form-group ${field.width === 'full' ? 'full-width' : 'half-width'}`}>
                            <label htmlFor={field.id}>{field.label}</label>
                            {field.type === 'select' ? (
                                <select
                                    id={field.id}
                                    className={`form-control ${errors[field.id] ? 'is-invalid' : ''}`}
                                    onChange={handleChange}
                                    value={formData[field.id] || ''}
                                >
                                    <option value="" disabled>Select {field.label}</option>
                                    {field.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    id={field.id}
                                    placeholder={field.placeholder}
                                    className={`form-control ${errors[field.id] ? 'is-invalid' : ''}`}
                                    onChange={handleChange}
                                    value={formData[field.id] || ''}
                                />
                            )}
                            {errors[field.id] && <span className="error-message">{errors[field.id]}</span>}
                        </div>
                    ))}
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onBack}>Cancel</button>
                    <button type="button" className="btn-submit" onClick={handleSubmitClick}>Create Registration</button>
                </div>
            </form>
        </div>
    );
};

export default EducationDetails;
