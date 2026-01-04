import React, { useState } from 'react';
import Sidebar from './Sidebar';
import PersonalDetails from './PersonalDetails';
import Role from './Role';
import EducationDetails from './EducationDetails';
import './UserEnrollment.css';


const UserEnrollment = () => {
    const [currentStep, setCurrentStep] = useState(1);

    const handleNext = () => {
        setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const handleSubmit = () => {
        alert('Registration Created Successfully!');
        // Here you would typically send data to backend
    };

    return (
        <div className="user-enrollment-page">
            <Sidebar currentStep={currentStep} />
            <div className="content-area">
                {currentStep === 1 && <PersonalDetails onNext={handleNext} />}
                {currentStep === 2 && <Role onNext={handleNext} onBack={handleBack} />}
                {currentStep === 3 && <EducationDetails onBack={handleBack} onSubmit={handleSubmit} />}
            </div>
        </div>
    );
};

export default UserEnrollment;