import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess } from '../../../utils/toast';
import { useAdminCreateUser } from '../../../hooks/useAdminUsers';

import Sidebar from './Sidebar';
import PersonalDetails from './PersonalDetails';
import Role from './Role';
import EducationDetails from './EducationDetails';
import './UserEnrollment.css';

const UserEnrollment = ({ subtitle }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    
    const [formData, setFormData] = useState({
        role: subtitle === "Add Student" ? "student" : "trainer"
    });

    const { mutate: createUser } = useAdminCreateUser();

    const handleNext = () => {
        setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const handleSubmit = () => {
        const payload = {
            ...formData,
            role: subtitle === "Add Student" ? "student" : "trainer",
        };

        createUser(payload, {
            onSuccess: () => {
                showSuccess('Registration created successfully!');
                if (subtitle === "Add Student") {
                    navigate('/admin/students');
                } else {
                    navigate('/admin/instructors');
                }
            },
            onError: (err) => {
                showError(err?.message || 'Failed to create user');
            }
        });
    };

    const handleCancel = () => {
        if (subtitle === "Add Student") {
            navigate('/admin/students');
        } else {
            navigate('/admin/instructors');
        }
    };

    return (
        <div className="user-enrollment-page">
            <Sidebar currentStep={currentStep} subtitle={subtitle} />
            <div className="content-area">
                {currentStep === 1 && <PersonalDetails formData={formData} setFormData={setFormData} onNext={handleNext} onCancel={handleCancel} />}
                {currentStep === 2 && <Role formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} subtitle={subtitle} />}
                {currentStep === 3 && <EducationDetails formData={formData} setFormData={setFormData} onBack={handleBack} onSubmit={handleSubmit} />}
            </div>
        </div>
    );
};

export default UserEnrollment;