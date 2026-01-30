import React, { useState, useEffect, useRef } from "react";
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
   TABS — DYNAMIC BUT SAME DESIGN
---------------------------------------------- */
function CourseTabs({ tabs, activeTab, setActiveTab }) {
    const tabsRef = useRef({});
    const containerRef = useRef(null);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(false);

    // Check visibility of fades
    const checkScroll = () => {
        if (containerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
            setShowLeftFade(scrollLeft > 0);
            setShowRightFade(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    // Navigate Tabs (Next/Prev)
    const handleTabNav = (direction) => {
        const currentIndex = tabs.indexOf(activeTab);
        if (direction === 'left') {
            const prevIndex = currentIndex - 1;
            if (prevIndex >= 0) setActiveTab(tabs[prevIndex]);
        } else {
            const nextIndex = currentIndex + 1;
            if (nextIndex < tabs.length) setActiveTab(tabs[nextIndex]);
        }
    };

    useEffect(() => {
        if (tabsRef.current[activeTab]) {
            tabsRef.current[activeTab].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [activeTab]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            checkScroll(); // Check initially
            window.addEventListener('resize', checkScroll);

            return () => {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [tabs]);

    const handleKeyDown = (e) => {
        const currentIndex = tabs.indexOf(activeTab);

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % tabs.length;
            setActiveTab(tabs[nextIndex]);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            setActiveTab(tabs[prevIndex]);
        }
    };

    return (
        <div className="tabs-wrapper">
            {/* Left Fade */}
            <div
                className={`tabs-fade-overlay left ${showLeftFade ? 'visible' : ''}`}
                onClick={() => handleTabNav('left')}
            >
                <i className="bi bi-chevron-left fade-arrow"></i>
            </div>
            <div
                className="tabs-container"
                ref={containerRef}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="tablist"
                aria-label="Course sections"
            >
                {tabs.map((tabName, index) => {
                    const isFirst = index === 0;
                    const isLast = index === tabs.length - 1;
                    const isActive = activeTab === tabName;

                    return (
                        <div
                            key={tabName}
                            ref={el => tabsRef.current[tabName] = el}
                            className={`tab 
                  ${isFirst ? "tab-first" : ""} 
                  ${isLast ? "tab-last" : ""} 
                  ${isActive ? "active" : ""}`}
                            onClick={() => setActiveTab(tabName)}
                            title={tabName}
                            role="tab"
                            aria-selected={isActive}
                            tabIndex={isActive ? 0 : -1}
                        >
                            {tabName}
                        </div>
                    );
                })}
            </div>

            {/* Right Fade */}
            <div
                className={`tabs-fade-overlay right ${showRightFade ? 'visible' : ''}`}
                onClick={() => handleTabNav('right')}
            >
                <i className="bi bi-chevron-right fade-arrow"></i>
            </div>
        </div>
    );
}

function TabsDivider() {
    return <div className="tabs-horizontal-divider"></div>;
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
   MAIN MY COURSES PAGE
---------------------------------------------- */
export default function MyCourses() {
    const { data: coursesData, isLoading: listLoading, isError } = useStudentCourses();
    const courses = coursesData?.enrolledCourses || [];

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState("");
    const [showMobileDetails, setShowMobileDetails] = useState(false);
    const [viewLesson, setViewLesson] = useState(null);

    // Fetch details for selected course to get modules/sections
    const { data: courseDetails, isLoading: detailsLoading } = useCourseProgress(selectedCourse?.courseId);

    // Debug logging
    console.log("Selected Course:", selectedCourse);
    console.log("Course Details (API):", courseDetails);
    console.log("Thumbnail URL:", selectedCourse?.thumbnail);
    console.log("course data", coursesData);
    console.log("Lesson Progress Array:", courseDetails?.lessonProgress);

    // Merge list data with detailed data
    const displayCourse = selectedCourse ? (() => {
        // Use modules from API details if available (already enriched with isCompleted)
        // Otherwise fall back to list data modules
        const modules = courseDetails?.course?.modules || selectedCourse.modules || [];

        // Debug logging
        if (courseDetails?.course?.modules) {
            console.log("Using enriched modules from API with completion data");
            const firstModule = modules[0];
            if (firstModule?.sections?.[0]) {
                console.log("Sample section:", firstModule.sections[0]);
            }
        }

        return {
            ...selectedCourse,
            modules: modules,
            enrolledAt: courseDetails?.enrollmentDate || selectedCourse.enrolledAt,
            lessonProgress: courseDetails?.lessonProgress || []
        };
    })() : null;

    // Set initial selected course from list
    React.useEffect(() => {
        if (courses.length > 0 && !selectedCourse) {
            setSelectedCourse(courses[0]);
        }
    }, [courses, selectedCourse]);

    // Update active tab when course details load or course changes
    React.useEffect(() => {
        if (displayCourse?.modules?.length > 0) {
            // Only set if not already set or if switching courses
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
                <div className="col-8 right-section">
                    {viewLesson ? (
                        <div className="lesson-content-view">
                            <button
                                className="btn btn-dark mb-3"
                                onClick={() => setViewLesson(null)}
                            >
                                <i className="bi bi-arrow-left"></i> Back to Lessons
                            </button>
                            <Introduction
                                sectionData={viewLesson}
                                courseName={displayCourse.courseName}
                                moduleName={activeTab}
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
                                <>
                                    <CourseTabs
                                        tabs={displayCourse.modules.map(m => m.moduleName || m.title)}
                                        activeTab={activeTab}
                                        setActiveTab={(tab) => {
                                            setActiveTab(tab);
                                            setViewLesson(null);
                                        }}
                                    />

                                    <TabsDivider />

                                    {displayCourse.modules.find(m => (m.moduleName || m.title) === activeTab)?.sections.map((section, idx, allSections) => {
                                        // Use enriched section data if available from details
                                        const sectionTitle = section.sectionName || section.title;

                                        // Simple locking logic: completed sections are unlocked, incomplete sections are locked
                                        const isCompleted = section.isCompleted === true;
                                        const isLocked = !isCompleted;

                                        // Debug logging for troubleshooting
                                        if (idx < 3) { // Log first 3 sections to avoid spam
                                            console.log(`Section ${idx + 1} (${sectionTitle}):`, {
                                                isCompleted,
                                                isLocked,
                                                rawIsCompleted: section.isCompleted
                                            });
                                        }

                                        return (
                                            <LessonRow
                                                key={idx}
                                                number={idx + 1}
                                                title={sectionTitle}
                                                isLocked={isLocked}
                                                onOpen={() => setViewLesson(section)}
                                            />
                                        );
                                    })}
                                </>
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
