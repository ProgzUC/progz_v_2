import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
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
        createUser(formData, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Registration Created Successfully!',
                    icon: 'success',
                    confirmButtonColor: '#198754',
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.isConfirmed || result.isDismissed) {
                        if (subtitle === "Add Student") {
                            navigate('/admin/students');
                        } else {
                            navigate('/admin/instructors');
                        }
                    }
                });
            },
            onError: (err) => {
                Swal.fire('Error', err?.response?.data?.msg || 'Failed to create user', 'error');
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
                {currentStep === 2 && <Role formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />}
                {currentStep === 3 && <EducationDetails formData={formData} setFormData={setFormData} onBack={handleBack} onSubmit={handleSubmit} />}
            </div>
        </div>
    );
};

export default UserEnrollment;