import React from 'react';
import './MyCourses.css';
import coursesData from './myCoursesData.json';
import { BsBook, BsPeople } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';
import { BiPlus, BiEdit, BiDotsHorizontalRounded } from 'react-icons/bi';

const MyCourses = ({ onManageCourse, onCreateNew, onBack }) => {
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

            <div className="courses-grid">
                {coursesData.map((course) => (
                    <div key={course.id} className="course-card">
                        <div
                            className="card-header-bg"
                            style={{ backgroundColor: course.color }}
                        >
                            <button className="menu-dots">
                                <BiDotsHorizontalRounded />
                            </button>
                        </div>
                        <div className="card-content">
                            <h3>{course.title}</h3>
                            <div className="course-stats">
                                <span className="stat-item">
                                    <BsBook /> {Array.isArray(course.modules) ? course.modules.length : course.modules} Modules
                                </span>
                                <span className="stat-item">
                                    <BsPeople /> {course.students} Students
                                </span>
                            </div>
                            <button
                                className="manage-course-btn"
                                onClick={() => onManageCourse(course)}
                            >
                                <BiEdit /> Manage Course
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyCourses;
