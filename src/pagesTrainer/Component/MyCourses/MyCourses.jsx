import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyCourses.css';
import { BsBook, BsPeople, BsArrowRight } from 'react-icons/bs';
import {
    BiPlus,
    BiDotsVerticalRounded,
    BiPencil,
    BiTrash,
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
import TrainerStatus from '../../components/TrainerStatus';

const COURSE_THEMES = [
    { id: 'emerald', match: /html/, category: 'Web Development' },
    { id: 'sky', match: /css/, category: 'Web Development' },
    { id: 'violet', match: /bootstrap|react/, category: 'Frontend Framework' },
    { id: 'amber', match: /javascript|js|es6|node/, category: 'JavaScript' },
    { id: 'teal', match: /git/, category: 'Tools' },
];

const getCourseTheme = (name = '') => {
    const lower = String(name).toLowerCase();
    const found = COURSE_THEMES.find((t) => t.match.test(lower));
    return found || { id: 'emerald' };
};

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

const shortDescription = (course) => {
    const raw = String(course.description || course.courseDescription || '').replace(/<[^>]+>/g, '').trim();
    if (!raw) return '';
    return raw.length > 90 ? `${raw.slice(0, 87)}…` : raw;
};

const MyCourses = () => {
    const navigate = useNavigate();
    const { data: courses, isLoading, isError, refetch } = useTrainerCourses();
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
        const courseId = course.courseId || course._id || course.id;
        if (courseId) navigate(`/trainer-dashboard/courses/${courseId}/edit`);
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
                <TrainerStatus
                    message="Courses could not be loaded."
                    onRetry={() => refetch()}
                />
            </div>
        );
    }

    return (
        <div className="my-courses-container trainer-myCourses">
            <section className="tc-hero">
                <p className="tc-kicker">
                    <span className="tc-kicker-dot" aria-hidden="true" />
                    Course studio
                </p>
                <h1>Courses you can shape.</h1>
                <p className="tc-lead">Build a curriculum, open a lesson, or start something new for the next batch.</p>
                <button type="button" className="tc-create" onClick={() => navigate('/trainer-dashboard/courses/new')}>
                    <BiPlus aria-hidden="true" />
                    Create course
                </button>
            </section>

            <section className="tc-statbar" aria-label="Course totals">
                <article>
                    <strong>{stats.totalCourses}</strong>
                    <span>Courses</span>
                </article>
                <article>
                    <strong>{stats.totalSections}</strong>
                    <span>Sections</span>
                </article>
                <article>
                    <strong>{stats.totalStudents}</strong>
                    <span>Enrolled students</span>
                </article>
            </section>

            <div className="tc-section-head">
                <p>Library</p>
                <h2>Your courses</h2>
            </div>

            <div className="trainer-courses-grid">
                {coursesData.map((course, index) => {
                    const courseId = course.courseId || course._id || course.id;
                    const isDropdownOpen = openDropdownId === courseId;
                    const initial = (course.courseName || 'C').charAt(0).toUpperCase();
                    const sections = course.totalSections || 0;
                    const students = course.totalStudents || 0;
                    const theme = getCourseTheme(course.courseName);

                    return (
                        <article
                            key={courseId}
                            className={`trainer-course-card theme-${theme.id}`}
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
                                <h3 className="trainer-course-title">{course.courseName}</h3>
                                {shortDescription(course) ? (
                                    <p className="trainer-course-desc">{shortDescription(course)}</p>
                                ) : null}

                                <div className="trainer-course-meta">
                                    <span className="meta-badge">
                                        <span className="meta-icon" aria-hidden="true">
                                            <BsBook />
                                        </span>
                                        <span>{sections} Sections</span>
                                    </span>
                                    <span className="meta-divider" aria-hidden="true" />
                                    <span className="meta-badge">
                                        <span className="meta-icon" aria-hidden="true">
                                            <BsPeople />
                                        </span>
                                        <span>{students} Students</span>
                                    </span>
                                </div>
                            </div>

                            <div className="trainer-card-footer">
                                <button
                                    type="button"
                                    className="trainer-view-course-btn is-solid"
                                    onClick={() => navigate(`/trainer-dashboard/courses/${courseId}`)}
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
                    onClick={() => navigate('/trainer-dashboard/courses/new')}
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
