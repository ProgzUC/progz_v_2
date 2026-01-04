import React, { useState } from 'react';
import './Role.css';

const Role = ({ onNext, onCancel }) => {
    const [selectedRole, setSelectedRole] = useState(null);

    const roles = [
        { id: 'trainer', label: 'trainer' },
        { id: 'student', label: 'Student' }
    ];

    const [error, setError] = useState('');

    const handleNext = () => {
        if (!selectedRole) {
            setError('Please select a role to proceed');
            return;
        }
        onNext(selectedRole);
    };

    return (
        <div className="role-container">
            <h2 className="role-title">Role</h2>

            <div className="role-selection-group">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className={`role-option ${selectedRole === role.id ? 'selected' : ''}`}
                        onClick={() => {
                            setSelectedRole(role.id);
                            setError('');
                        }}
                    >
                        <div className="radio-circle">
                            <div className="radio-inner"></div>
                        </div>
                        <span className="role-label">{role.label}</span>
                    </div>
                ))}
            </div>
            {error && <span className="error-message">{error}</span>}

            <div className="button-group">
                <button className="btn btn-cancel" onClick={onCancel}>Cancel</button>
                <button className="btn btn-next" onClick={handleNext}>Next</button>
            </div>
        </div>
    );
};

export default Role;
