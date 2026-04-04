import React from 'react';
import './UserEnrollment.css';

const Sidebar = ({ currentStep, subtitle }) => {
    const steps = [
        { id: 1, label: 'Personal Details' },
        { id: 2, label: 'Role' },
        { id: 3, label: 'Education & Employment Details' }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h1>User Enrollment</h1>
                <h2>{subtitle}</h2>
            </div>

            <div className="steps-container">
                {steps.map((step, index) => (
                    <div key={step.id} className={`step-item ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
                        <div className="step-indicator">
                            {currentStep > step.id ? (
                                <span className="check-icon">✓</span>
                            ) : (
                                <span className="step-number">{step.id}</span>
                            )}
                        </div>
                        <div className="step-line"></div>
                        <span className="step-label">{step.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
