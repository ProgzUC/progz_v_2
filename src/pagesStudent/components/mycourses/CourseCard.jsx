import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CourseCard.css";
import Introduction from "../Introduction/Introduction";
import { useStudentCourses, useCourseProgress } from "../../../hooks/useStudentCourses";
import { useJoinClass } from "../../../hooks/useClassSession";
import Loader from "../../../components/common/Loader/Loader";
import ImageWithFallback from "../../../components/common/ImageWithFallback/ImageWithFallback";
import { BiCodeAlt } from "react-icons/bi";
import { getLessonCompilerMode } from "../../../utils/compilerMode";
import { isHtmlEmpty } from "../../../components/common/RichTextEditor/richTextUtils";
import Swal from "sweetalert2";

const THUMB_SKIP_WORDS = new Set([
    "complete", "course", "courses", "the", "a", "an", "and",
    "of", "for", "in", "to", "with", "using", "web", "development",
]);

function getThumbLines(name) {
    const words = String(name || "Course")
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .trim()
        .split(/\s+/)
        .filter((word) => word && !THUMB_SKIP_WORDS.has(word.toLowerCase()));

    if (words.length === 0) {
        const first = String(name || "Course").trim().split(/\s+/)[0] || "Course";
        return [first.toUpperCase()];
    }

    if (words.length === 1) return [words[0].toUpperCase()];
    return [words[0].toUpperCase(), words[1].toUpperCase()];
}

function CourseThumb({ courseName }) {
    const lines = getThumbLines(courseName);

    return (
        <div className="large-thumb large-thumb-brand fullstack-thumb">
            <div className="fullstack-grid" aria-hidden="true" />
            <div className="fullstack-code" aria-hidden="true">
                {'</>'}
            </div>
            <p className="large-thumb-serif fullstack-title">
                {lines.map((line) => (
                    <span key={line}>{line}</span>
                ))}
            </p>
        </div>
    );
}

/* ----------------------------------------------
   LARGE COURSE CARD (RIGHT SIDE)
---------------------------------------------- */
function LargeCourseCard({ course }) {
    const progress = course.progressPercentage || 0;
    const completed = course.completedLessons || 0;
    const total = course.totalLessons || 0;
    const meetLink = course.meetLink || course.batchInfo?.meetLink || null;
    const batchId = course.batchId || course.batchInfo?._id || course.batchInfo?.id || null;
    const timing = course.classTiming || course.batchInfo?.classTiming;
    const timingLabel =
        timing?.startTime && timing?.endTime
            ? `${timing.startTime} – ${timing.endTime}`
            : null;
    const joinClassMutation = useJoinClass();

    const handleJoinClass = async (e) => {
        e.preventDefault();
        if (!batchId || joinClassMutation.isPending) return;

        try {
            const result = await joinClassMutation.mutateAsync(batchId);
            const link = result?.meetLink || meetLink;
            if (link) {
                window.open(link, "_blank", "noopener,noreferrer");
            }
            if (result?.status) {
                Swal.fire({
                    icon: "success",
                    title: `Marked ${result.status}`,
                    text: result.joinedAt
                        ? `Joined at ${new Date(result.joinedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
                        : "Attendance recorded",
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Could not join class",
                text: err.response?.data?.message || err.message || "Failed to join class",
            });
        }
    };

    return (
        <div className="large-card">
            <div className="large-thumb-container">
                <CourseThumb courseName={course.courseName} />
                <div className="large-badge">
                    <span className="badge-dot">•</span> Enrolled
                </div>
            </div>

            <div className="large-content">
                <div className="large-title-row">
                    <div className="large-title-block">
                        <p className="large-title">{course.courseName}</p>
                        <span className="large-batch-pill">{course.batchName || "Full Stack"}</span>
                    </div>
                    {meetLink && batchId ? (
                        <button
                            type="button"
                            className="student-join-class-btn"
                            onClick={handleJoinClass}
                            disabled={joinClassMutation.isPending}
                        >
                            <i className="bi bi-camera-video-fill" aria-hidden="true"></i>
                            {joinClassMutation.isPending ? "Joining..." : "Join Class"}
                        </button>
                    ) : meetLink ? (
                        <a
                            href={meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="student-join-class-btn"
                        >
                            <i className="bi bi-camera-video-fill" aria-hidden="true"></i>
                            Join Class
                        </a>
                    ) : null}
                </div>

                {timingLabel ? (
                    <p className="large-class-meta">
                        <i className="bi bi-clock" aria-hidden="true"></i>
                        Class: {timingLabel}
                        {Array.isArray(course.daysOfWeek) && course.daysOfWeek.length > 0
                            ? ` · ${course.daysOfWeek.join(", ")}`
                            : ""}
                    </p>
                ) : null}

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
                    <p className="large-lessons-summary">
                        {completed} of {total} lessons completed
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ----------------------------------------------
   LESSON ROW
---------------------------------------------- */
function LessonRow({ title, isLocked, onOpen, section }) {
    const navigate = useNavigate();
    const mode = getLessonCompilerMode(section);

    const handlePractice = (e) => {
        e.stopPropagation();
        if (isLocked) return;
        window.open(import.meta.env.VITE_COMPILER_BASE_URL || "/", "_blank");
    };

    // Determine if it's a coding lesson
    const challengeHtml = section?.codeChallengeInstructions || section?.challengeInstructions || "";
    const challengeFiles = [
        ...(section?.codeChallengeFile || []),
        ...(section?.codeChallengeFiles || []),
        ...(section?.challengeFiles || []),
    ];
    // Use lessonType if available, otherwise fallback to old logic
    const isCodingLesson = section?.lessonType 
        ? section.lessonType === "Coding Practice" 
        : (!isHtmlEmpty(challengeHtml) || challengeFiles.length > 0);

    return (
        <div className="lesson-row">
            <i className="bi bi-circle lesson-circle-icon"></i>
            <div className="lesson-title">{title}</div>

            <div className="lesson-action">
                {isCodingLesson && (
                    <button
                        type="button"
                        className="practice-btn"
                        onClick={handlePractice}
                        disabled={isLocked}
                        title={isLocked ? "Trainer has not released this lesson yet" : "Practice in compiler"}
                    >
                        <BiCodeAlt className="practice-icon" />
                        Practice
                    </button>
                )}

                {isLocked ? (
                    <i className="bi bi-lock-fill lock-icon"></i>
                ) : (
                    <button type="button" className="open-btn" onClick={onOpen}>Open</button>
                )}
            </div>
        </div>
    );
}

/* ----------------------------------------------
   COURSE CURRICULUM (ACCORDION STYLE)
---------------------------------------------- */
function CourseCurriculum({ modules, setViewLesson }) {
    const [expandedModuleIdx, setExpandedModuleIdx] = useState(-1);

    const toggleModule = (index) => {
        setExpandedModuleIdx(prev => prev === index ? -1 : index);
    };

    if (!modules || modules.length === 0) return null;

    const totalLessons = modules.reduce((acc, m) => acc + (m.sections?.length || 0), 0);

    return (
        <div className="course-curriculum-container">
            <div className="curriculum-header-row">
                <p className="curriculum-main-title">Course Curriculum</p>
                <span className="curriculum-stats">{modules.length} modules · {totalLessons} lessons</span>
            </div>

            <div className="curriculum-accordion">
                {modules.map((module, mIdx) => {
                    const isExpanded = expandedModuleIdx === mIdx;
                    const lessonCount = module.sections?.length || 0;
                    const completedCount = (module.sections || []).filter((s) => s.isCompleted === true).length;
                    const isModuleComplete = lessonCount > 0 && completedCount === lessonCount;
                    const moduleNum = String(mIdx + 1).padStart(2, '0');

                    return (
                        <div key={mIdx} className={`module-accordion-item ${isExpanded ? 'active' : ''} ${isModuleComplete ? 'is-complete' : ''}`}>
                            <button
                                className="module-header"
                                onClick={() => toggleModule(mIdx)}
                                aria-expanded={isExpanded}
                            >
                                <span className="module-num">{moduleNum}</span>
                                <div className="module-header-copy">
                                    <span className="module-title">{module.moduleName || module.title}</span>
                                    <span className="module-meta">{lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}</span>
                                </div>
                                <span className={`module-status ${isModuleComplete ? 'complete' : ''}`}>
                                    {isModuleComplete ? 'Completed' : ''}
                                </span>
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
                                        const isReleased = section.isCompleted === true;
                                        const isLocked = !isReleased;

                                        return (
                                            <LessonRow
                                                key={sIdx}
                                                title={sectionTitle}
                                                isLocked={isLocked}
                                                section={section}
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
    const courses = useMemo(() => {
        const list = coursesData?.enrolledCourses || [];
        return [...list].sort((a, b) =>
            String(a.courseName || "").localeCompare(String(b.courseName || ""), undefined, {
                sensitivity: "base",
            })
        );
    }, [coursesData?.enrolledCourses]);

    const navigate = useNavigate();
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [showMobileDetails, setShowMobileDetails] = useState(false);
    const [viewLesson, setViewLesson] = useState(null);

    // Get selected course from the source of truth
    const selectedCourse = courses.find(
        (c) => String(c.courseId) === String(selectedCourseId) || String(c.id) === String(selectedCourseId) || String(c._id) === String(selectedCourseId)
    ) || courses[0];

    // Fetch details for selected course to get modules/sections
    const { data: courseDetails, isLoading: detailsLoading } = useCourseProgress(selectedCourse?.courseId);

    const location = useLocation();

    // Sync selectedCourseId from location state or initial load
    React.useEffect(() => {
        if (courses.length > 0) {
            const state = location.state;
            const stateCourseId = state?.courseId;
            const isReset = state?.reset;

            const findCourseIndex = (id) => courses.findIndex(
                (c) => String(c.courseId) === String(id) || String(c.id) === String(id) || String(c._id) === String(id)
            );

            if (isReset) {
                setShowMobileDetails(false);
            } else if (stateCourseId && findCourseIndex(stateCourseId) !== -1) {
                setSelectedCourseId(stateCourseId);
                setShowMobileDetails(true);
            } else if (!selectedCourseId) {
                setSelectedCourseId(courses[0].courseId || courses[0].id || courses[0]._id);
                setShowMobileDetails(false);
            }
        }
    }, [courses, selectedCourseId, location.state]);

    // Merge course modules with lessonProgress so lock/unlock reflects trainer releases
    const displayCourse = selectedCourse ? (() => {
        const rawModules = courseDetails?.course?.modules || selectedCourse.modules || [];
        const lessonProgress = courseDetails?.lessonProgress || [];

        const modules = rawModules.map((module, modIdx) => ({
            ...module,
            sections: (module.sections || []).map((section, secIdx) => {
                const progress = lessonProgress.find(
                    (p) => Number(p.moduleIndex) === modIdx && Number(p.sectionIndex) === secIdx
                );
                return {
                    ...section,
                    isCompleted: progress?.isCompleted === true || section.isCompleted === true,
                };
            }),
        }));

        return {
            ...selectedCourse,
            modules,
            enrolledAt: courseDetails?.enrollmentDate || selectedCourse.enrolledAt,
            lessonProgress,
            meetLink: courseDetails?.batch?.meetLink || selectedCourse.meetLink || null,
            classTiming: courseDetails?.batch?.classTiming || selectedCourse.classTiming || null,
            daysOfWeek: courseDetails?.batch?.daysOfWeek || selectedCourse.daysOfWeek || [],
            batchId: courseDetails?.batch?._id || selectedCourse.batchId || null,
            batchInfo: courseDetails?.batch || null,
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

    const selectCourse = (courseId) => {
        setSelectedCourseId(courseId);
        setShowMobileDetails(true);
        setViewLesson(null);
        if (window.innerWidth <= 1024) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const courseList = (
        <>
            <div className="courses-header-left">
                <h1 className="courses-heading">My Courses</h1>
                <span className="active-badge">{courses.length} active</span>
            </div>

            <div className="card-container">
                {courses.map((course) => {
                    const progress = course.progressPercentage || 0;
                    const completedLessons = course.completedLessons || 0;
                    const totalLessons = course.totalLessons || 0;
                    const isSelected = displayCourse?.courseId === course.courseId;
                    const initial = course.courseName ? course.courseName.charAt(0).toUpperCase() : "C";

                    return (
                        <div
                            key={course.courseId}
                            className={`course-card ${isSelected ? 'selected-card' : ''}`}
                            onClick={() => selectCourse(course.courseId)}
                        >
                            <div className="card-content">
                                <ImageWithFallback
                                    src={course.thumbnail?.url}
                                    alt={course.courseName}
                                    className="course-thumb"
                                    fallbackText={initial}
                                />

                                <div className="card-details">
                                    <div className="tag-box">
                                        <span className="tag-text">{course.batchName || "COURSE"}</span>
                                    </div>

                                    <p className="course-title">{course.courseName}</p>

                                    <div className="bottom-row">
                                        <span className="percent">{progress}%</span>

                                        <div className="progress-bar-mini">
                                            <div
                                                className="progress-fill-mini"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>

                                        <div className="lessons">
                                            <i className="bi bi-journal-text lesson-icon"></i>
                                            <span className="lesson-text">
                                                {completedLessons} of {totalLessons} Lessons
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );

    return (
        <div className={`container-fluid student-mycourses-page ${showMobileDetails ? 'mobile-show-details' : ''}`}>
            <div className="mycourses-layout">
                <aside className="mycourses-rail" aria-label="Course list">
                    <nav className="rail-nav">
                        {courses.map((course) => {
                            const isSelected = displayCourse?.courseId === course.courseId;
                            const initial = course.courseName ? course.courseName.charAt(0).toUpperCase() : "C";

                            return (
                                <button
                                    key={course.courseId}
                                    type="button"
                                    className={`rail-item ${isSelected ? "active" : ""}`}
                                    onClick={() => selectCourse(course.courseId)}
                                >
                                    <span className="rail-icon">{initial}</span>
                                    <span className="rail-text">
                                        <span className="rail-item-title">{course.courseName}</span>
                                        <span className="rail-item-meta">
                                            {course.progressPercentage || 0}% · {(course.completedLessons || 0)}/{(course.totalLessons || 0)} lessons
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <div className="mycourses-mobile-list">
                    {courseList}
                </div>

                <div className="right-section">
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
                            {(location.state?.fromProfile || window.innerWidth <= 768) && (
                                <button
                                    className="jc-back-btn mb-4"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (location.state?.fromProfile) {
                                            navigate('/student-dashboard/profile');
                                        } else if (showMobileDetails && window.innerWidth <= 768) {
                                            setShowMobileDetails(false);
                                        } else {
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




