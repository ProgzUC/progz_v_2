import React, { useState } from 'react';

import './UserEnrollment.css';

const roleConfig = [
    {
        id: 'instructor',
        label: 'Instructor',
        value: 'instructor'
    },
    {
        id: 'student',
        label: 'Student',
        value: 'student'
    }
];




const Role = ({ formData, setFormData, onNext, onBack }) => {
    return (
        <div className="role-container">
            <h2 className="section-title">Role</h2>
            <div className="role-selection">
                {roleConfig.map((role) => (
                    <label key={role.id} className="role-option">
                        <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={formData.role === role.value}
                            onChange={() => setFormData(prev => ({ ...prev, role: role.value }))}
                            className="role-radio"
                        />
                        <span className="role-custom-radio"></span>
                        <span className="role-label">{role.label}</span>
                    </label>
                ))}
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onBack}>Cancel</button>
                <button type="button" className="btn-next" onClick={onNext}>Next</button>
            </div>
        </div>
    );
};

export default Role;
