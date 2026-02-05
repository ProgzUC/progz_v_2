import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CourseCard.css";
import Introduction from "../Introduction/Introduction";
import { useStudentCourses, useCourseProgress } from "../../../hooks/useStudentCourses";
import Loader from "../../../components/common/Loader/Loader";
import ImageWithFallback from "../../../components/common/ImageWithFallback/ImageWithFallback";

/* ----------------------------------------------
   PROGRESS CALCULATOR (for client-side data)
---------------------------------------------- */
function getProgress(modules) {
    if (!modules || modules.length === 0) return { done: 0, total: 0, percent: 0 };

    let total = 0;
    let done = 0;

    modules.forEach((module) => {
        const sections = module.sections || [];
        total += sections.length;
        done += sections.filter(s => s.isCompleted).length;
    });

    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, percent };
}

/* ----------------------------------------------
   LARGE COURSE CARD (RIGHT SIDE)
---------------------------------------------- */
import { BiTimeFive, BiBarChartAlt2, BiBook } from "react-icons/bi";

function LargeCourseCard({ course }) {
    const progress = course.progressPercentage || 0;

    return (
        <div className="large-card premium-shadow">
            <div className="large-thumb-container">
                <ImageWithFallback
                    src={course.thumbnail?.url}
                    alt={course.courseName}
                    className="large-thumb"
                    fallbackText={course.courseName}
                />
                <div className="large-badge">Enrolled</div>
            </div>

            <div className="large-content">
                <div className="large-meta-top">
                    <span className="large-meta-item"><BiBarChartAlt2 /> {course.level || "Intermediate"}</span>
                    <span className="large-meta-item"><BiTimeFive /> {course.duration || "Self-paced"}</span>
                </div>

                <p className="large-title">{course.courseName}</p>
                <p className="large-batch-info">{course.batchName}</p>

                <div className="large-progress-section">
                    <div className="progress-info-row">
                        <span className="progress-label">Course Progress</span>
                        <span className="progress-value">{progress}%</span>
                    </div>
                    <div className="large-progress-bar">
                        <div
                            className="large-progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="large-lessons-summary">
                    <BiBook className="lesson-icon" />
                    <span>
                        <strong>{course.completedLessons || 0}</strong> of {course.totalLessons || 0} Lessons Completed
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ----------------------------------------------
   LESSON ROW
---------------------------------------------- */
function LessonRow({ number, title, isLocked, onOpen }) {
    return (
        <div className="lesson-row">
            <div className="lesson-number">{number}</div>
            <div className="lesson-title">{title}</div>

            <div className="lesson-action">
                {isLocked ? (
                    <i className="bi bi-lock-fill lock-icon"></i>
                ) : (
                    <button className="open-btn" onClick={onOpen}>Open</button>
                )}
            </div>
        </div>
    );
}

/* ----------------------------------------------
   CURRICULUM TABS
---------------------------------------------- */
/* ----------------------------------------------
   COURSE CURRICULUM (ACCORDION STYLE)
---------------------------------------------- */
function CourseCurriculum({ modules, setViewLesson }) {
    const [expandedModuleIdx, setExpandedModuleIdx] = useState(-1);

    const toggleModule = (index) => {
        setExpandedModuleIdx(prev => prev === index ? -1 : index);
    };

    if (!modules || modules.length === 0) return null;

    return (
        <div className="course-curriculum-container">
            <p className="curriculum-main-title">Course Curriculum</p>

            <div className="curriculum-accordion">
                {modules.map((module, mIdx) => {
                    const isExpanded = expandedModuleIdx === mIdx;
                    const lessonCount = module.sections?.length || 0;

                    return (
                        <div key={mIdx} className={`module-accordion-item ${isExpanded ? 'active' : ''}`}>
                            <button
                                className="module-header"
                                onClick={() => toggleModule(mIdx)}
                                aria-expanded={isExpanded}
                            >
                                <div className="module-header-left">
                                    <i className={`bi bi-chevron-down accordion-icon ${isExpanded ? 'expanded' : ''}`}></i>
                                    <span className="module-title">{module.moduleName || module.title}</span>
                                </div>
                                <span className="module-meta">{lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}</span>
                            </button>

                            <div
                                className="module-body"
                                style={{
                                    maxHeight: isExpanded ? '2000px' : '0',
                                    opacity: isExpanded ? 1 : 0
                                }}
                            >
                                <div className="module-lessons-list">
                                    {module.sections?.map((section, sIdx) => {
                                        const sectionTitle = section.sectionName || section.title;
                                        const isCompleted = section.isCompleted === true;
                                        const isLocked = !isCompleted;

                                        return (
                                            <LessonRow
                                                key={sIdx}
                                                number={sIdx + 1}
                                                title={sectionTitle}
                                                isLocked={isLocked}
                                                onOpen={() => setViewLesson(section)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function MyCourses() {
    const { data: coursesData, isLoading: listLoading, isError } = useStudentCourses();
    const courses = coursesData?.enrolledCourses || [];

    const navigate = useNavigate();
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [showMobileDetails, setShowMobileDetails] = useState(false);
    const [viewLesson, setViewLesson] = useState(null);

    // Get selected course from the source of truth
    const selectedCourse = courses.find(c => c.courseId === selectedCourseId) || courses[0];

    // Fetch details for selected course to get modules/sections
    const { data: courseDetails, isLoading: detailsLoading } = useCourseProgress(selectedCourse?.courseId);

    const location = useLocation();

    // Sync selectedCourseId from location state or initial load
    React.useEffect(() => {
        if (courses.length > 0) {
            const state = location.state;
            const stateCourseId = state?.courseId;
            const isReset = state?.reset;

            if (isReset) {
                // If clicked from Nav, show the list (reset details)
                setShowMobileDetails(false);
            } else if (stateCourseId && courses.some(c => c.courseId === stateCourseId)) {
                // If clicked from Profile card or specific link
                setSelectedCourseId(stateCourseId);
                setShowMobileDetails(true);
            } else if (!selectedCourseId) {
                // Default initial load
                setSelectedCourseId(courses[0].courseId);
                setShowMobileDetails(false);
            }
        }
    }, [courses, selectedCourseId, location.state]);

    // Merge list data with detailed data
    const displayCourse = selectedCourse ? (() => {
        const modules = courseDetails?.course?.modules || selectedCourse.modules || [];
        return {
            ...selectedCourse,
            modules: modules,
            enrolledAt: courseDetails?.enrollmentDate || selectedCourse.enrolledAt,
            lessonProgress: courseDetails?.lessonProgress || []
        };
    })() : null;

    if (listLoading) {
        return <Loader message="Loading your courses..." />;
    }

    if (isError) {
        return (
            <div className="container-fluid student-mycourses-page">
                <div className="error-message" style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>
                    Error loading courses. Please try again later.
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="container-fluid student-mycourses-page">
                <div className="empty-message" style={{ textAlign: 'center', padding: '40px' }}>
                    <p className="h3-style">No courses enrolled yet</p>
                    <p>Browse available courses and enroll to get started!</p>
                </div>
            </div>
        );
    }

    if (!displayCourse) {
        return <Loader message="Loading..." />;
    }

    return (
        <div className={`container-fluid student-mycourses-page ${showMobileDetails ? 'mobile-show-details' : ''}`}>
            <div className="row">

                {/* LEFT SIDE */}
                <div className="col-4 p-0">
                    <div className="left-shadow">
                        <div className="left-section">
                            <p className="courses-heading ms-5 mt-2">My Courses</p>

                            <div className="card-container ms-auto mt-4 ">
                                {courses.map((course, index) => {
                                    const progress = course.progressPercentage || 0;
                                    const completedLessons = course.completedLessons || 0;
                                    const totalLessons = course.totalLessons || 0;
                                    const isSelected = displayCourse?.courseId === course.courseId;

                                    return (
                                        <React.Fragment key={course.courseId}>
                                            <div
                                                className={`course-card ${isSelected ? 'selected-card' : ''}`}
                                                onClick={() => {
                                                    setSelectedCourseId(course.courseId);
                                                    setShowMobileDetails(true);
                                                    setViewLesson(null);
                                                    // Scroll to top when selecting on mobile
                                                    if (window.innerWidth <= 1024) {
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="card-content">
                                                    <ImageWithFallback
                                                        src={course.thumbnail?.url}
                                                        alt={course.courseName}
                                                        className="course-thumb"
                                                        fallbackText={course.courseName}
                                                    />

                                                    <div className="card-details">
                                                        <div className="tag-box">
                                                            <span className="tag-text">{course.batchName || "Course"}</span>
                                                        </div>

                                                        <p className="course-title">{course.courseName}</p>


                                                        <div className="progress-bar">
                                                            <div
                                                                className="progress-fill"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>

                                                        <div className="bottom-row">
                                                            <span className="percent">{progress}%</span>

                                                            <div className="lessons">
                                                                <i className="bi bi-book lesson-icon"></i>
                                                                <span className="lesson-text">
                                                                    {completedLessons} of {totalLessons} Lessons
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="col-8 right-section">
                    {viewLesson ? (
                        <div className="lesson-content-view">
                            <button
                                className="jc-back-btn mb-4"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setViewLesson(null);
                                }}
                            >
                                <div className="back-icon-circle">
                                    <i className="bi bi-arrow-left"></i>
                                </div>
                                <span>Back to Course</span>
                            </button>
                            <Introduction
                                sectionData={viewLesson}
                                courseName={displayCourse.courseName}
                                moduleName={displayCourse.modules.find(m => m.sections.some(s => s === viewLesson))?.moduleName || ""}
                            />
                        </div>
                    ) : (
                        <>
                            {/* Hide back button on desktop/tablet unless from Profile */}
                            {(location.state?.fromProfile || window.innerWidth <= 768) && (
                                <button
                                    className="jc-back-btn mb-4"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // 1. If we explicitly came from the Profile page, go back there
                                        if (location.state?.fromProfile) {
                                            navigate('/student-dashboard/profile');
                                        }
                                        // 2. If we are on mobile and viewing a course, go back to the list
                                        else if (showMobileDetails && window.innerWidth <= 768) {
                                            setShowMobileDetails(false);
                                        }
                                        // 3. Absolute fallback: standard history back
                                        else {
                                            navigate(-1);
                                        }
                                    }}
                                >
                                    <div className="back-icon-circle">
                                        <i className="bi bi-arrow-left"></i>
                                    </div>
                                    <span>Back to Courses</span>
                                </button>
                            )}

                            <LargeCourseCard course={displayCourse} />

                            {detailsLoading ? (
                                <Loader message="Loading curriculum..." />
                            ) : displayCourse.modules && displayCourse.modules.length > 0 ? (
                                <CourseCurriculum
                                    modules={displayCourse.modules}
                                    setViewLesson={setViewLesson}
                                />
                            ) : (
                                <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                    No modules available for this course yet.
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

