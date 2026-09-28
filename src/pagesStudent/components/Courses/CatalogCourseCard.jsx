import React from "react";
import { useNavigate } from "react-router-dom";
import { BiTimeFive, BiBookOpen, BiUser } from "react-icons/bi";
import ImageWithFallback from "../../../components/common/ImageWithFallback/ImageWithFallback";
import { formatNextClass } from "../../utils/formatNextClass";
import "./Courses.css";

export default function CatalogCourseCard({ course }) {
    const navigate = useNavigate();
    const title = course.title || course.courseName || "Course";
    const openCourse = () => {
        navigate(`/student-dashboard/course-details/${course.id || course.courseId}`);
    };

    return (
        <div
            className="jc-courses-card jc-courses-card--clickable"
            onClick={openCourse}
            onKeyDown={(e) => e.key === "Enter" && openCourse()}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${title}`}
        >
            <div className="jc-card-main">
                <div className="jc-image-container">
                    <ImageWithFallback
                        src={course.thumbnail}
                        alt={title}
                        className="jc-course-img"
                        fallbackText={title}
                    />
                    <div className="jc-course-tag">{course.durationLabel || "Self-paced"}</div>
                    {course.enrolled && <div className="jc-enrolled-badge">Enrolled</div>}
                </div>

                <div className="jc-course-content">
                    <div className="jc-meta-row">
                        <span className="jc-meta-item">
                            <BiBookOpen /> {course.moduleCount || 0} modules
                        </span>
                        <span className="jc-meta-item">
                            <BiTimeFive /> {course.lessonCount || course.totalLessons || 0} lessons
                        </span>
                    </div>

                    <p className="jc-courses-card-title">{title}</p>
                    {course.description ? <p className="jc-course-desc">{course.description}</p> : null}

                    <div className="jc-info-grid">
                        {course.instructors?.length > 0 && (
                            <div className="jc-info-item">
                                <label><BiUser /> Instructor</label>
                                <span className="jc-salary-text">{course.instructors.join(", ")}</span>
                            </div>
                        )}
                        {course.enrolled && course.progressPercentage != null && (
                            <div className="jc-info-item">
                                <label>Progress</label>
                                <span className="jc-salary-text">{course.progressPercentage}%</span>
                            </div>
                        )}
                        {course.nextClassAt && (
                            <div className="jc-info-item">
                                <label>Next class</label>
                                <span className="jc-salary-text">{formatNextClass(course.nextClassAt)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
