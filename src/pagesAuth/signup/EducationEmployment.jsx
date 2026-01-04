import React, { useState } from 'react';
import './EducationEmployment.css';

const EducationEmployment = ({ onCancel, onSubmit }) => {

    const [formData, setFormData] = useState({
        education: '',
        university: '',
        profession: '',
        experience: '',
        employmentStatus: ''
    });

    const [errors, setErrors] = useState({});

    const experienceOptions = [
        { value: '', label: 'Select Experience' },
        { value: 'fresher', label: 'Fresher' },
        { value: '1-3', label: '1 - 3 Years' },
        { value: '3-5', label: '3 - 5 Years' },
        { value: '5+', label: '5+ Years' }
    ];

    const formFields = [
        { id: 'education', label: 'Education', type: 'text', placeholder: 'Enter education' },
        { id: 'university', label: 'University / School', type: 'text', placeholder: 'Enter university or school' },
        { id: 'profession', label: 'Profession', type: 'text', placeholder: 'Enter profession' },
        { id: 'experience', label: 'Experience', type: 'select', options: experienceOptions },
        { id: 'employmentStatus', label: 'Employment Status', type: 'text', placeholder: 'Enter employment status' },
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

    const handleCreate = () => {
        const newErrors = {};
        let isValid = true;

        formFields.forEach(field => {
            if (!formData[field.id].trim()) {
                newErrors[field.id] = `${field.label} is required`;
                isValid = false;
            }
        });

        setErrors(newErrors);

        if (isValid) {
            onSubmit(formData);
        }
    };

    return (
        <div className="education-container">
            <h2 className="page-title">Education & Employment Details</h2>

            <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
                {formFields.map((field) => (
                    <div key={field.id} className="form-group">
                        <label className="form-label">{field.label}</label>
                        {field.type === 'select' ? (
                            <select
                                className={`form-select ${errors[field.id] ? 'error' : ''}`}
                                name={field.id}
                                value={formData[field.id]}
                                onChange={handleChange}
                            >
                                {field.options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type}
                                name={field.id}
                                placeholder={field.placeholder}
                                className={`form-input ${errors[field.id] ? 'error' : ''}`}
                                value={formData[field.id]}
                                onChange={handleChange}
                            />
                        )}
                        {errors[field.id] && <span className="error-message">{errors[field.id]}</span>}
                    </div>
                ))}
            </form>

            <div className="button-group-ee">
                <button className="btn btn-cancel" onClick={onCancel}>Cancel</button>
                <button className="btn btn-next" onClick={handleCreate}>Create</button>
            </div>
        </div>
    );
};

export default EducationEmployment;
