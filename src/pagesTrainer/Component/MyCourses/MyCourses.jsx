import React, { useState, useMemo, useEffect } from 'react';
import './MyCourses.css';
import { BsBook, BsPeople, BsLightningCharge } from 'react-icons/bs';
import { 
    BiPlus, 
    BiDotsHorizontalRounded, 
    BiPencil, 
    BiTrash, 
    BiCheckSquare, 
    BiUser, 
    BiLogoHtml5, 
    BiLogoCss3, 
    BiLogoBootstrap, 
    BiLogoJavascript 
} from 'react-icons/bi';
import { useTrainerCourses } from '../../../hooks/useTrainerCourses';
import { useDeleteCourse } from '../../../hooks/useCourses';
import { confirmDelete } from '../../../utils/confirmDelete';
import { showSuccess, showError } from '../../../utils/toast';
import Loader from '../../../components/common/Loader/Loader';

const COURSE_ACCENT_COLORS = [
    { bg: 'linear-gradient(135deg, #f97316, #ea580c)', btn: '#ea580c' }, // Orange (HTML)
    { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', btn: '#2563eb' }, // Blue (CSS)
    { bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', btn: '#7c3aed' }, // Purple (Bootstrap)
    { bg: 'linear-gradient(135deg, #eab308, #ca8a04)', btn: '#ca8a04' }, // Yellow/Gold (JS)
    { bg: 'linear-gradient(135deg, #10b981, #059669)', btn: '#059669' }, // Emerald
];

const getCourseLogo = (name, initial) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('html')) {
        return <BiLogoHtml5 className="logo-icon-svg html-icon" />;
    }
    if (lower.includes('css')) {
        return <BiLogoCss3 className="logo-icon-svg css-icon" />;
    }
    if (lower.includes('bootstrap')) {
        return <BiLogoBootstrap className="logo-icon-svg bootstrap-icon" />;
    }
    if (lower.includes('javascript') || lower.includes('js')) {
        return <BiLogoJavascript className="logo-icon-svg js-icon" />;
    }
    return <span className="course-avatar-initial">{initial}</span>;
};

const MyCourses = ({ onManageCourse, onEditCourse, onCreateNew }) => {
    const { data: courses, isLoading, isError } = useTrainerCourses();
    const { mutate: deleteCourse } = useDeleteCourse();

    const [openDropdownId, setOpenDropdownId] = useState(null);

    // Close three-dot dropdown menu when clicking anywhere outside
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

    // Calculate aggregated summary stats
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
                <p style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                    Error loading courses. Please try again later.
                </p>
            </div>
        );
    }

    return (
        <div className="my-courses-container trainer-myCourses">

            {/* TOP STATS CARDS (4 ROW CARDS) */}
            <div className="trainer-stats-row">
                <div className="stat-card">
                    <div className="stat-icon-box stat-purple">
                        <BsBook />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalCourses}</span>
                        <span className="stat-label">Total Courses</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-box stat-cyan">
                        <BiCheckSquare />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalSections}</span>
                        <span className="stat-label">Total Sections</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-box stat-amber">
                        <BiUser />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalStudents}</span>
                        <span className="stat-label">Enrolled Students</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-box stat-pink">
                        <BsLightningCharge />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">100%</span>
                        <span className="stat-label">% Published</span>
                    </div>
                </div>
            </div>

            {/* COURSES GRID */}
            <div className="trainer-courses-grid">
                {coursesData.map((course, index) => {
                    const colorScheme = COURSE_ACCENT_COLORS[index % COURSE_ACCENT_COLORS.length];
                    const isDropdownOpen = openDropdownId === (course.courseId || course._id || course.id);
                    const courseId = course.courseId || course._id || course.id;
                    const initial = (course.courseName || 'C').charAt(0).toUpperCase();

                    return (
                        <div key={courseId} className="trainer-course-card">
                            
                            {/* CARD TOP HEADER: LOGO/ICON BADGE */}
                            <div className="trainer-card-header">
                                <div className="course-avatar-box" style={{ background: colorScheme.bg }}>
                                    {course.thumbnail?.url ? (
                                        <img src={course.thumbnail.url} alt={course.courseName} className="course-avatar-img" />
                                    ) : (
                                        getCourseLogo(course.courseName, initial)
                                    )}
                                </div>
                            </div>

                            {/* CARD MAIN CONTENT */}
                            <div className="trainer-card-body">
                                <h3 className="trainer-course-title">{course.courseName}</h3>
                                <p className="trainer-course-subtitle">
                                    {course.category || course.description || 'Course Curriculum'}
                                </p>

                                <div className="trainer-course-meta">
                                    <span className="meta-badge">
                                        <BsBook /> {course.totalSections || 0} Sections
                                    </span>
                                    <span className="meta-badge">
                                        <BsPeople /> {course.totalStudents || 0} Students
                                    </span>
                                </div>
                            </div>

                            {/* CARD FOOTER: VIEW COURSE BUTTON & THREE DOTS BUTTON */}
                            <div className="trainer-card-footer">
                                <button
                                    className="trainer-view-course-btn"
                                    style={{ backgroundColor: colorScheme.btn }}
                                    onClick={() => onManageCourse(course)}
                                >
                                    View Course &rarr;
                                </button>

                                {/* THREE DOTS BUTTON (CLEARLY VISIBLE BY DEFAULT) */}
                                <div className="dropdown-wrapper">
                                    <button
                                        className="three-dots-action-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDropdownId(isDropdownOpen ? null : courseId);
                                        }}
                                        title="Course options"
                                        aria-label="Options"
                                    >
                                        <BiDotsHorizontalRounded />
                                    </button>

                                    {/* DROPDOWN POPUP MENU */}
                                    {isDropdownOpen && (
                                        <div className="three-dots-menu">
                                            <button
                                                className="menu-item edit-item"
                                                onClick={(e) => handleEditCourse(e, course)}
                                            >
                                                <BiPencil /> Edit
                                            </button>
                                            <button
                                                className="menu-item delete-item"
                                                onClick={(e) => handleDeleteCourse(e, course)}
                                            >
                                                <BiTrash /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* CREATE NEW COURSE CARD */}
                <div className="create-new-course-card" onClick={onCreateNew}>
                    <div className="plus-icon-circle">
                        <BiPlus />
                    </div>
                    <p className="create-card-title">Create New Course</p>
                    <p className="create-card-subtitle">Start a new curriculum</p>
                </div>
            </div>
        </div>
    );
};

export default MyCourses;
