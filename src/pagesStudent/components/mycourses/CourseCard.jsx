import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
                <p className="large-author">{course.courseId}</p>

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
   COURSE CURRICULUM (ACCORDION)
---------------------------------------------- */
function CourseCurriculum({ modules, onOpenLesson, activeModuleName }) {
    const [expandedModules, setExpandedModules] = useState({});

    // Initialize the active module as expanded
    useEffect(() => {
        if (activeModuleName) {
            const activeIdx = modules.findIndex(m => (m.moduleName || m.title) === activeModuleName);
            if (activeIdx !== -1) {
                setExpandedModules(prev => ({ ...prev, [activeIdx]: true }));
            }
        }
    }, [activeModuleName, modules]);

    const toggleModule = (index) => {
        setExpandedModules(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <div className="course-curriculum-wrapper">
            <div className="curriculum-header-row">
                <h3 className="curriculum-main-title">Course Content</h3>
                <span className="curriculum-stats">
                    {modules.length} Modules • {modules.reduce((acc, m) => acc + (m.sections?.length || 0), 0)} Lessons
                </span>
            </div>

            <div className="curriculum-accordion">
                {modules.map((module, mIdx) => {
                    const isExpanded = !!expandedModules[mIdx];
                    const moduleTitle = module.moduleName || module.title;
                    const sections = module.sections || [];

                    return (
                        <div key={mIdx} className={`curriculum-item ${isExpanded ? 'is-open' : ''}`}>
                            <div
                                className="curriculum-module-header"
                                onClick={() => toggleModule(mIdx)}
                            >
                                <div className="header-left">
                                    <motion.i
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        className="bi bi-chevron-down chevron-icon"
                                    ></motion.i>
                                    <span className="module-title">{moduleTitle}</span>
                                </div>
                                <div className="header-right">
                                    <span className="module-info">{sections.length} Lessons</span>
                                </div>
                            </div>

                            <AnimatePresence initial={false}>
                                {isExpanded && (
                                    <motion.div
                                        key="content"
                                        initial="collapsed"
                                        animate="open"
                                        exit="collapsed"
                                        variants={{
                                            open: { opacity: 1, height: "auto" },
                                            collapsed: { opacity: 0, height: 0 }
                                        }}
                                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                    >
                                        <div className="curriculum-sections-list">
                                            {sections.length > 0 ? (
                                                sections.map((section, sIdx) => {
                                                    const sectionTitle = section.sectionName || section.title;
                                                    const isCompleted = section.isCompleted === true;
                                                    // For now, simpler locking: all unlocked if any logic applies, 
                                                    // but we follow existing logic where possible.
                                                    // Here we'll treat them as accessible if "Open" button was there.
                                                    const isLocked = !isCompleted && false; // Allowing access for now as per "Open" button behavior

                                                    return (
                                                        <div
                                                            key={sIdx}
                                                            className={`curriculum-section-row ${isCompleted ? 'completed' : ''}`}
                                                            onClick={() => onOpenLesson(section, moduleTitle)}
                                                        >
                                                            <div className="section-left">
                                                                <div className="status-icon">
                                                                    {isCompleted ? (
                                                                        <i className="bi bi-check-circle-fill done"></i>
                                                                    ) : (
                                                                        <i className="bi bi-play-circle play"></i>
                                                                    )}
                                                                </div>
                                                                <div className="section-details">
                                                                    <span className="section-title">{sectionTitle}</span>
                                                                </div>
                                                            </div>
                                                            <div className="section-right">
                                                                <span className="start-text">Start Lesson</span>
                                                                <i className="bi bi-arrow-right-short arrow"></i>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="no-sections">No lessons in this module.</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ----------------------------------------------
   MAIN MY COURSES PAGE
---------------------------------------------- */
export default function MyCourses() {
    const { data: coursesData, isLoading: listLoading, isError } = useStudentCourses();
    const courses = coursesData?.enrolledCourses || [];
    const location = useLocation();

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState("");
    const [showMobileDetails, setShowMobileDetails] = useState(false);
    const [viewLesson, setViewLesson] = useState(null);

    // Fetch details for selected course to get modules/sections
    const { data: courseDetails, isLoading: detailsLoading } = useCourseProgress(selectedCourse?.courseId);

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

    // Set initial selected course from list or navigation state
    React.useEffect(() => {
        if (courses.length > 0 && !selectedCourse) {
            // Check if we came from Profile page with a specific course
            const stateId = location.state?.selectedCourseId;
            if (stateId) {
                const found = courses.find(c => (c.courseId || c.id) === stateId);
                if (found) {
                    setSelectedCourse(found);
                    setShowMobileDetails(true);
                    return;
                }
            }
            setSelectedCourse(courses[0]);
        }
    }, [courses, selectedCourse, location.state]);

    // Update active tab when course details load or course changes
    React.useEffect(() => {
        if (displayCourse?.modules?.length > 0) {
            if (!activeTab || !displayCourse.modules.find(m => (m.moduleName || m.title) === activeTab)) {
                setActiveTab(displayCourse.modules[0].moduleName || displayCourse.modules[0].title);
            }
        }
    }, [displayCourse?.courseId, courseDetails, activeTab]);

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
                <div className="col-lg-4 col-md-5 p-0">
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
                                                    setSelectedCourse(course);
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
                                                        <p className="author">{course.courseId}</p>

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
                <div className="col-lg-8 col-md-7 right-section">
                    {viewLesson ? (
                        <div className="lesson-content-view">
                            <button
                                className="btn-back-to-curriculum"
                                onClick={() => setViewLesson(null)}
                            >
                                <i className="bi bi-arrow-left"></i> Back to Curriculum
                            </button>
                            <Introduction
                                sectionData={viewLesson.data}
                                courseName={displayCourse.courseName}
                                moduleName={viewLesson.moduleName}
                            />
                        </div>
                    ) : (
                        <div className="curriculum-container-box">
                            <button
                                className="mobile-back-btn"
                                onClick={() => setShowMobileDetails(false)}
                            >
                                <i className="bi bi-arrow-left"></i> Back to Courses
                            </button>

                            <LargeCourseCard course={displayCourse} />

                            {detailsLoading ? (
                                <div className="details-loader-box">
                                    <Loader message="Loading curriculum..." />
                                </div>
                            ) : displayCourse.modules && displayCourse.modules.length > 0 ? (
                                <CourseCurriculum
                                    modules={displayCourse.modules}
                                    activeModuleName={activeTab}
                                    onOpenLesson={(section, moduleName) => {
                                        setViewLesson({ data: section, moduleName });
                                    }}
                                />
                            ) : (
                                <div className="no-modules-placeholder">
                                    <i className="bi bi-journal-x"></i>
                                    <p>No modules available for this course yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
