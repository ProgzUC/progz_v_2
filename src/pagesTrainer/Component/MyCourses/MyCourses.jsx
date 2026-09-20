import React, { useState, useMemo, useEffect } from 'react';
import './MyCourses.css';
import { BsBook, BsPeople, BsLightningCharge, BsArrowRight } from 'react-icons/bs';
import {
    BiPlus,
    BiDotsVerticalRounded,
    BiPencil,
    BiTrash,
    BiCheckSquare,
    BiUser,
    BiLogoHtml5,
    BiLogoCss3,
    BiLogoBootstrap,
    BiLogoJavascript,
} from 'react-icons/bi';
import { FaReact, FaNodeJs, FaGithub } from 'react-icons/fa';
import { useTrainerCourses } from '../../../hooks/useTrainerCourses';
import { useDeleteCourse } from '../../../hooks/useCourses';
import { confirmDelete } from '../../../utils/confirmDelete';
import { showSuccess, showError } from '../../../utils/toast';
import Loader from '../../../components/common/Loader/Loader';

const getCourseLogo = (name, initial) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('html')) {
        return <BiLogoHtml5 className="logo-icon-svg" aria-hidden="true" />;
    }
    if (lower.includes('css')) {
        return <BiLogoCss3 className="logo-icon-svg" aria-hidden="true" />;
    }
    if (lower.includes('bootstrap')) {
        return <BiLogoBootstrap className="logo-icon-svg" aria-hidden="true" />;
    }
    if (lower.includes('javascript') || lower.includes('js') || lower.includes('es6')) {
        return <BiLogoJavascript className="logo-icon-svg" aria-hidden="true" />;
    }
    if (lower.includes('react')) {
        return <FaReact className="logo-icon-svg" aria-hidden="true" />;
    }
    if (lower.includes('node')) {
        return <FaNodeJs className="logo-icon-svg" aria-hidden="true" />;
    }
    if (lower.includes('git')) {
        return <FaGithub className="logo-icon-svg" aria-hidden="true" />;
    }
    return <span className="course-avatar-initial">{initial}</span>;
};

const MyCourses = ({ onManageCourse, onEditCourse, onCreateNew }) => {
    const { data: courses, isLoading, isError } = useTrainerCourses();
    const { mutate: deleteCourse } = useDeleteCourse();

    const [openDropdownId, setOpenDropdownId] = useState(null);

    useEffect(() => {
        const handleClickOutside = () => setOpenDropdownId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleDeleteCourse = async (e, course) => {
        e.stopPropagation();
        setOpenDropdownId(null);
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

    const handleEditCourse = (e, course) => {
        e.stopPropagation();
        setOpenDropdownId(null);
        if (onEditCourse) {
            onEditCourse(course);
        } else if (onManageCourse) {
            onManageCourse(course);
        }
    };

    const coursesData = useMemo(() => courses || [], [courses]);

    const stats = useMemo(() => {
        const totalCourses = coursesData.length;
        const totalSections = coursesData.reduce((acc, c) => acc + (c.totalSections || 0), 0);
        const totalStudents = coursesData.reduce((acc, c) => acc + (c.totalStudents || 0), 0);
        return { totalCourses, totalSections, totalStudents };
    }, [coursesData]);

    if (isLoading) {
        return (
            <div className="my-courses-container trainer-myCourses">
                <Loader message="Loading courses..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="my-courses-container trainer-myCourses">
                <p className="courses-error">Error loading courses. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="my-courses-container trainer-myCourses">
            <div className="trainer-stats-row" role="list">
                <div className="stat-card" role="listitem" style={{ '--stat-i': 0 }}>
                    <div className="stat-icon-box stat-courses">
                        <BsBook aria-hidden="true" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalCourses}</span>
                        <span className="stat-label">Total Courses</span>
                    </div>
                </div>

                <div className="stat-card" role="listitem" style={{ '--stat-i': 1 }}>
                    <div className="stat-icon-box stat-sections">
                        <BiCheckSquare aria-hidden="true" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalSections}</span>
                        <span className="stat-label">Total Sections</span>
                    </div>
                </div>

                <div className="stat-card" role="listitem" style={{ '--stat-i': 2 }}>
                    <div className="stat-icon-box stat-students">
                        <BiUser aria-hidden="true" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalStudents}</span>
                        <span className="stat-label">Enrolled Students</span>
                    </div>
                </div>

                <div className="stat-card" role="listitem" style={{ '--stat-i': 3 }}>
                    <div className="stat-icon-box stat-published">
                        <BsLightningCharge aria-hidden="true" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">100%</span>
                        <span className="stat-label">Published</span>
                    </div>
                </div>
            </div>

            <div className="trainer-courses-grid">
                {coursesData.map((course, index) => {
                    const courseId = course.courseId || course._id || course.id;
                    const isDropdownOpen = openDropdownId === courseId;
                    const initial = (course.courseName || 'C').charAt(0).toUpperCase();
                    const sections = course.totalSections || 0;
                    const students = course.totalStudents || 0;

                    return (
                        <article
                            key={courseId}
                            className="trainer-course-card"
                            style={{ '--card-i': index }}
                        >
                            <div className="trainer-card-media">
                                <div className="course-media-pattern" aria-hidden="true" />
                                <div className="course-avatar-box">
                                    {course.thumbnail?.url ? (
                                        <img
                                            src={course.thumbnail.url}
                                            alt=""
                                            className="course-avatar-img"
                                        />
                                    ) : (
                                        getCourseLogo(course.courseName, initial)
                                    )}
                                </div>

                                <div className="dropdown-wrapper">
                                    <button
                                        type="button"
                                        className={`three-dots-action-btn${isDropdownOpen ? ' is-open' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDropdownId(isDropdownOpen ? null : courseId);
                                        }}
                                        title="Course options"
                                        aria-label="Course options"
                                        aria-expanded={isDropdownOpen}
                                    >
                                        <BiDotsVerticalRounded aria-hidden="true" />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="three-dots-menu" role="menu">
                                            <button
                                                type="button"
                                                className="menu-item edit-item"
                                                role="menuitem"
                                                onClick={(e) => handleEditCourse(e, course)}
                                            >
                                                <BiPencil aria-hidden="true" /> Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="menu-item delete-item"
                                                role="menuitem"
                                                onClick={(e) => handleDeleteCourse(e, course)}
                                            >
                                                <BiTrash aria-hidden="true" /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="trainer-card-body">
                                <p className="trainer-course-subtitle">Course Curriculum</p>
                                <h3 className="trainer-course-title">{course.courseName}</h3>

                                <div className="trainer-course-meta">
                                    <span className="meta-badge">
                                        <BsBook aria-hidden="true" />
                                        <span>{sections} Sections</span>
                                    </span>
                                    <span className="meta-badge">
                                        <BsPeople aria-hidden="true" />
                                        <span>{students} Students</span>
                                    </span>
                                </div>
                            </div>

                            <div className="trainer-card-footer">
                                <button
                                    type="button"
                                    className="trainer-view-course-btn"
                                    onClick={() => onManageCourse(course)}
                                >
                                    <span>View Course</span>
                                    <BsArrowRight className="view-course-arrow" aria-hidden="true" />
                                </button>
                            </div>
                        </article>
                    );
                })}

                <button
                    type="button"
                    className="create-new-course-card"
                    style={{ '--card-i': coursesData.length }}
                    onClick={onCreateNew}
                >
                    <div className="plus-icon-circle">
                        <BiPlus aria-hidden="true" />
                    </div>
                    <p className="create-card-title">Create New Course</p>
                    <p className="create-card-subtitle">Start a new curriculum</p>
                </button>
            </div>
        </div>
    );
};

export default MyCourses;
