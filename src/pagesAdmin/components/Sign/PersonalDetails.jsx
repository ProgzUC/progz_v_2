import React, { useState } from 'react';

import './UserEnrollment.css';


const personalDetailsConfig = [
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    placeholder: '',
    width: 'half'
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    placeholder: '',
    width: 'half'
  },
  {
    id: 'password',
    label: 'Password',
    type: 'password',
    placeholder: '',
    width: 'half'
  },
  {
    id: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    placeholder: '',
    width: 'half'
  },
  {
    id: 'phone',
    label: 'Phone',
    type: 'tel',
    placeholder: '',
    width: 'half'
  },
  {
    id: 'alternatePhone',
    label: 'Alternate Phone No',
    type: 'tel',
    placeholder: '',
    width: 'half' // The image shows it taking half width but on a new line effectively if the previous row is full? Actually looks like it's just the next item.
  },
  {
    id: 'dob',
    label: 'Date of Birth',
    type: 'date',
    placeholder: '',
    width: 'half'
  },
  
  {
    id: 'address',
    label: 'Address',
    type: 'textarea',
    placeholder: '',
    width: 'full'
  }
];


const PersonalDetails = ({ onNext }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        // Clear error when user types
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        let isValid = true;

        personalDetailsConfig.forEach(field => {
            if (!formData[field.id] || formData[field.id].trim() === '') {
                newErrors[field.id] = `${field.label} is required`;
                isValid = false;
            }
        });

        if (formData.password && formData.confirmPassword) {
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNextClick = () => {
        if (validate()) {
            onNext();
        }
    };

    return (
        <div className="personal-details-container">
            <h2 className="section-title">Personal Details</h2>
            <form className="details-form">
                <div className="form-grid">
                    {personalDetailsConfig.map((field) => (
                        <div key={field.id} className={`form-group ${field.width === 'full' ? 'full-width' : 'half-width'}`}>
                            <label htmlFor={field.id}>{field.label}</label>
                            {field.type === 'textarea' ? (
                                <textarea
                                    id={field.id}
                                    placeholder={field.placeholder}
                                    className={`form-control ${errors[field.id] ? 'is-invalid' : ''}`}
                                    onChange={handleChange}
                                    value={formData[field.id] || ''}
                                />
                            ) : (
                                <div className="input-wrapper">
                                    <input
                                        type={field.type}
                                        id={field.id}
                                        placeholder={field.placeholder}
                                        className={`form-control ${errors[field.id] ? 'is-invalid' : ''}`}
                                        onChange={handleChange}
                                        value={formData[field.id] || ''}
                                    />
                                    {field.icon === 'calendar' && (
                                        <span className="icon-calendar">📅</span>
                                    )}
                                </div>
                            )}
                            {errors[field.id] && <span className="error-message">{errors[field.id]}</span>}
                        </div>
                    ))}
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-cancel">Cancel</button>
                    <button type="button" className="btn-next" onClick={handleNextClick}>Next</button>
                </div>
            </form>
        </div>
    );
};

export default PersonalDetails;