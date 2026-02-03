import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
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
function LargeCourseCard({ course }) {
    const progress = course.progressPercentage || 0;

    return (
        <div className="large-card ">
            <ImageWithFallback
                src={course.thumbnail?.url}
                alt={course.courseName}
                className="large-thumb"
                fallbackText={course.courseName}
            />

            <div className="large-content">
                <span className="large-category">{course.batchName}</span>

                <h2 className="large-title">{course.courseName}</h2>



                <div className="large-progress-bar">
                    <div
                        className="large-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="large-bottom-row">
                    <span className="large-percent">{progress}%</span>

                    <div className="large-lessons">
                        <i className="bi bi-book lesson-icon"></i>
                        <span>
                            {course.completedLessons || 0} of {course.totalLessons || 0} Lessons
                        </span>
                    </div>
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
    const [expandedModuleIdx, setExpandedModuleIdx] = useState(0);

    const toggleModule = (index) => {
        setExpandedModuleIdx(prev => prev === index ? -1 : index);
    };

    if (!modules || modules.length === 0) return null;

    return (
        <div className="course-curriculum-container">
            <h3 className="curriculum-main-title">Course Curriculum</h3>

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
            const stateCourseId = location.state?.courseId;
            if (stateCourseId && courses.some(c => c.courseId === stateCourseId)) {
                setSelectedCourseId(stateCourseId);
                setShowMobileDetails(true);
            } else if (!selectedCourseId) {
                setSelectedCourseId(courses[0].courseId);
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
                    <h3>No courses enrolled yet</h3>
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
                            <h2 className="courses-heading ms-5 mt-2">My Courses</h2>

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

                                                        <h3 className="course-title">{course.courseName}</h3>


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

                                            {index !== courses.length - 1 && (
                                                <div className="divider"></div>
                                            )}
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
                                className="btn btn-dark mb-3"
                                onClick={() => setViewLesson(null)}
                            >
                                <i className="bi bi-arrow-left"></i> Back to Curriculum
                            </button>
                            <Introduction
                                sectionData={viewLesson}
                                courseName={displayCourse.courseName}
                                moduleName={displayCourse.modules.find(m => m.sections.some(s => s === viewLesson))?.moduleName || ""}
                            />
                        </div>
                    ) : (
                        <>
                            <button
                                className="mobile-back-btn"
                                onClick={() => setShowMobileDetails(false)}
                            >
                                <i className="bi bi-arrow-left"></i> Back to Courses
                            </button>

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

