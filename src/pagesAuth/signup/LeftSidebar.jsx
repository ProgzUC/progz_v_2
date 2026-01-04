import React from 'react';
import './LeftSidebar.css';

const LeftSidebar = ({ activeStep, completedSteps = [] }) => {

    const steps = [
        { id: 1, label: 'Personal Details', route: '/personal-details' },
        { id: 2, label: 'Role', route: '/role' },
        { id: 3, label: 'Education & Employment Details', route: '/education-employment' }
    ];

    const getStepStatus = (stepId) => {
        if (completedSteps.includes(stepId)) return 'completed';
        if (activeStep === stepId) return 'active';
        return 'upcoming';
    };

    return (
        <div className="sidebar-container">
            <h1 className="sidebar-title">User Enrollment</h1>
            {/* <p className="sidebar-subtitle">Add Student</p> */}

            <ul className="steps-list">
                {steps.map((step) => {
                    const status = getStepStatus(step.id);
                    return (
                        <li
                            key={step.id}
                            className={`step-item ${status}`}
                        >
                            <div className="step-indicator">
                                {status === 'completed' ? '✔' : step.id}
                            </div>
                            <span className="step-text">{step.label}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default LeftSidebar;
