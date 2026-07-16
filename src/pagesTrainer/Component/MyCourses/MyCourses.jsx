import React from 'react';
import './MyCourses.css';
import { BsBook, BsPeople } from 'react-icons/bs';
import { BiPlus, BiEdit, BiTrash } from 'react-icons/bi';
import { useTrainerCourses } from '../../../hooks/useTrainerCourses';
import { useDeleteCourse } from '../../../hooks/useCourses';
import { confirmDelete } from '../../../utils/confirmDelete';
import { showSuccess, showError } from '../../../utils/toast';
import Loader from '../../../components/common/Loader/Loader';

const MyCourses = ({ onManageCourse, onCreateNew }) => {
    const { data: courses, isLoading, isError } = useTrainerCourses();
    const { mutate: deleteCourse } = useDeleteCourse();

    const handleDeleteCourse = async (course) => {
        const courseName = course.courseName || 'this course';
        const confirmed = await confirmDelete(
            'Delete Course?',
            `Are you sure you want to delete "${courseName}"? This cannot be undone.`
        );
        if (!confirmed) return;

        deleteCourse(course.courseId || course._id || course.id, {
            onSuccess: () => showSuccess('Course deleted successfully'),
            onError: (err) => showError(err?.message || 'Failed to delete course'),
        });
    };

    if (isLoading) {
        return (
            <div className="my-courses-container trainer-myCourses">
                <div className="header-section">
                    <h1 className="my-courses-page-title">My Courses</h1>
                    <button className="create-batch-btn" onClick={onCreateNew}>
                        <BiPlus /> Create New Course
                    </button>
                </div>
                <Loader message="Loading courses..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="my-courses-container trainer-myCourses">
                <div className="header-section">
                    <h1 className="my-courses-page-title">My Courses</h1>
                    <button className="create-batch-btn" onClick={onCreateNew}>
                        <BiPlus /> Create New Course
                    </button>
                </div>
                <p style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>Error loading courses. Please try again.</p>
            </div>
        );
    }

    const coursesData = courses || [];

    return (
        <div className="my-courses-container trainer-myCourses">
            <div className="header-section">
                <h1 className="my-courses-page-title">My Courses</h1>
                <button className="create-batch-btn" onClick={onCreateNew}>
                    <BiPlus /> Create New Course
                </button>
            </div>

            {coursesData.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No courses found. Create your first course!
                </p>
            ) : (
                <div className="courses-grid">
                    {coursesData.map((course) => (
                        <div key={course.courseId || course._id} className="course-card">
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
                                <div className="course-card-actions">
                                    <button
                                        className="manage-course-btn"
                                        onClick={() => onManageCourse(course)}
                                    >
                                        <BiEdit /> View Course
                                    </button>
                                    <button
                                        className="delete-course-btn"
                                        onClick={() => handleDeleteCourse(course)}
                                        title="Delete course"
                                    >
                                        <BiTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCourses;
