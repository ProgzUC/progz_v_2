import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import Sidebar from './Sidebar';
import PersonalDetails from './PersonalDetails';
import Role from './Role';
import EducationDetails from './EducationDetails';
import './UserEnrollment.css';


const UserEnrollment = ({ subtitle }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    const handleNext = () => {
        setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const handleSubmit = () => {
        Swal.fire({
            title: 'Success!',
            text: 'Registration Created Successfully!',
            icon: 'success',
            confirmButtonColor: '#198754',
            confirmButtonText: 'OK'
        }).then((result) => {
            if (result.isConfirmed || result.isDismissed) {
                // Determine redirect path based on subtitle
                if (subtitle === "Add Student") {
                    navigate('/admin/students');
                } else {
                    navigate('/admin/instructors');
                }
            }
        });
        // Here you would typically send data to backend
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
                {currentStep === 1 && <PersonalDetails onNext={handleNext} onCancel={handleCancel} />}
                {currentStep === 2 && <Role onNext={handleNext} onBack={handleBack} />}
                {currentStep === 3 && <EducationDetails onBack={handleBack} onSubmit={handleSubmit} />}
            </div>
        </div>
    );
};

export default UserEnrollment;