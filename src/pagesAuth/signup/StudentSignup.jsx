import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { registerUser } from '../../api/axiosInstance';
import LeftSidebar from './LeftSidebar';
import PersonalDetails from './PersonalDetails';
import Role from './Role';
import EducationEmployment from './EducationEmployment';
import './StudentSignup.css';

const StudentSignup = () => {
    const navigate = useNavigate();
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

    const handleFinalSubmit = async (educationData) => {
        // Collect all data
        const completeData = {
            ...formData.personalDetails,
            role: formData.role,
            ...educationData
        };

        try {
            await registerUser(completeData);

            Swal.fire({
                title: 'Registration Successful!',
                text: 'Your registration is pending approval. You will be notified once approved.',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Go to Login'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
        } catch (error) {
            console.error("Registration failed:", error);
            Swal.fire({
                title: 'Registration Failed',
                text: error.message || 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        }
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
                return <PersonalDetails onNext={handleNextStep} onCancel={handlePreviousStep} />;
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
