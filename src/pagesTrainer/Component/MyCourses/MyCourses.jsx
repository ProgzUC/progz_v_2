import React from 'react';
import './MyCourses.css';
import { BsBook, BsPeople } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';
import { BiPlus, BiEdit, BiDotsHorizontalRounded } from 'react-icons/bi';
import { useTrainerCourses } from '../../../hooks/useTrainerCourses';
import Loader from '../../../components/common/Loader/Loader';

const MyCourses = ({ onManageCourse, onCreateNew, onBack }) => {
    const { data: courses, isLoading, isError } = useTrainerCourses();

    if (isLoading) {
        return (
            <div className="my-courses-container trainer-myCourses">
                <div className="header-section">
                    <div className="back-title">
                        <button className="back-btn" onClick={onBack}><FaArrowLeft /></button>
                        <h1>My Courses</h1>
                    </div>
                </div>
                <Loader message="Loading courses..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="my-courses-container trainer-myCourses">
                <div className="header-section">
                    <div className="back-title">
                        <button className="back-btn" onClick={onBack}><FaArrowLeft /></button>
                        <h1>My Courses</h1>
                    </div>
                </div>
                <p style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>Error loading courses. Please try again.</p>
            </div>
        );
    }

    const coursesData = courses || [];
    

    return (
        <div className="my-courses-container trainer-myCourses">
            <div className="header-section">
                <div className="back-title">
                    <button className="back-btn" onClick={onBack}><FaArrowLeft /></button>
                    <h1>My Courses</h1>
                </div>
                <button className="create-batch-btn" onClick={onCreateNew}>
                    <BiPlus /> Create New Batch
                </button>
            </div>

            {coursesData.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No courses found. Create your first course!
                </p>
            ) : (
                <div className="courses-grid">
                    {coursesData.map((course, index) => (
                        <div key={course.courseId} className="course-card">
                            <div
                                className="card-header-bg"
                                style={{
                                    backgroundImage: course.thumbnail
                                        ? `url(${course.thumbnail.url})`
                                        : 'linear-gradient(135deg, #66ea90ff 0%, #4ba268ff 100%)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            >
                             
                            </div>
                            <div className="card-content">
                                <h3>{course.courseName}</h3>
                                <div className="course-stats">
                                    <span className="stat-item">
                                        <BsBook /> {course.totalSections || 0} Sections
                                    </span>
                                    <span className="stat-item">
                                        <BsPeople /> {course.totalStudents || 0} Students
                                    </span>
                                </div>
                                <button
                                    className="manage-course-btn"
                                    onClick={() => onManageCourse(course)}
                                >
                                    <BiEdit /> View Course
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCourses;
