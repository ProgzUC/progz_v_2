import React, { useState } from 'react';
import LeftSidebar from './LeftSidebar';
import PersonalDetails from './PersonalDetails';
import Role from './Role';
import EducationEmployment from './EducationEmployment';
import './StudentSignup.css';

const StudentSignup = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);

    // State to store data from all steps
    const [formData, setFormData] = useState({
        personalDetails: {},
        role: '',
        educationEmployment: {}
    });

    const handleNextStep = (stepData) => {
        // Save the current step's data
        if (activeStep === 1) {
            setFormData(prev => ({ ...prev, personalDetails: stepData }));
        } else if (activeStep === 2) {
            setFormData(prev => ({ ...prev, role: stepData }));
        }

        if (activeStep < 3) {
            setCompletedSteps([...completedSteps, activeStep]);
            setActiveStep(activeStep + 1);
        }
    };

    const handlePreviousStep = () => {
        if (activeStep > 1) {
            setActiveStep(activeStep - 1);
            setCompletedSteps(completedSteps.filter(step => step !== activeStep - 1));
        }
    };

    const handleFinalSubmit = (educationData) => {
        // Collect all data and log to console
        const completeData = {
            ...formData.personalDetails,
            role: formData.role,
            ...educationData
        };
        console.log('Final Submitted Data:', completeData);
        console.log('=== REGISTRATION DATA ===');
        console.log('Name:', completeData.name);
        console.log('Email:', completeData.email);
        console.log('Password:', completeData.password);
        console.log('Confirm Password:', completeData.confirmPassword);
        console.log('Phone:', completeData.phone);
        console.log('Alternate Phone:', completeData.altPhone);
        console.log('Date of Birth:', completeData.dob);
        console.log('Address:', completeData.address);
        console.log('Role:', completeData.role);
        console.log('Education:', completeData.education);
        console.log('University/School:', completeData.university);
        console.log('Profession:', completeData.profession);
        console.log('Experience:', completeData.experience);
        console.log('Employment Status:', completeData.employmentStatus);
        console.log('=========================');
    };

    const renderCurrentStep = () => {
        switch (activeStep) {
            case 1:
                return <PersonalDetails onNext={handleNextStep} onCancel={handlePreviousStep} />;
            case 2:
                return <Role onNext={handleNextStep} onCancel={handlePreviousStep} />;
            case 3:
                return <EducationEmployment onCancel={handlePreviousStep} onSubmit={handleFinalSubmit} />;
            default:
                return <PersonalDetails onNext={handleNextStep} onCancel={handlePreviousStep}  />;
        }
    };

    return (
        <div className="signup-container">
            <LeftSidebar activeStep={activeStep} completedSteps={completedSteps} />
            <div className="main-content">
                {renderCurrentStep()}
            </div>
        </div>
    );
};

export default StudentSignup;
