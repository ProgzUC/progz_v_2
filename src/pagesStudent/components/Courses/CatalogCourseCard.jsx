import React from "react";
import { useNavigate } from "react-router-dom";
import { BiTimeFive, BiBookOpen } from "react-icons/bi";
import "./Courses.css";

function initials(title) {
  const parts = String(title || "Course").trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "C";
}

export default function CatalogCourseCard({ course, tone = 0 }) {
  const navigate = useNavigate();
  const title = course.title || course.courseName || "Course";
  const openCourse = () => {
    navigate(`/student-dashboard/course-details/${course.id || course.courseId}`);
  };
  const progress = course.enrolled && course.progressPercentage != null
    ? course.progressPercentage
    : null;

  return (
    <article
      className={`home-course-card tone-${tone % 4}`}
      onClick={openCourse}
      onKeyDown={(event) => event.key === "Enter" && openCourse()}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${title}`}
      style={{ animationDelay: `${(tone % 8) * 70}ms` }}
    >
      <div className="home-course-cover">
        <span className="home-course-mark">{initials(title)}</span>
        {course.enrolled && <span className="home-course-badge">Enrolled</span>}
      </div>

      <div className="home-course-body">
        <div className="home-course-meta">
          <span>{course.durationLabel || "Self-paced"}</span>
          <span><BiBookOpen aria-hidden="true" /> {course.moduleCount || 0}</span>
          <span><BiTimeFive aria-hidden="true" /> {course.lessonCount || course.totalLessons || 0}</span>
        </div>

        <h3>{title}</h3>
        {course.instructors?.length > 0 && (
          <p className="home-course-by">By {course.instructors.join(", ")}</p>
        )}

        {progress != null && (
          <div className="home-course-progress">
            <div className="home-course-track">
              <span style={{ width: `${progress}%` }} />
            </div>
            <small>{progress}% complete</small>
          </div>
        )}

        <div className="home-course-foot">
          <span>{course.enrolled ? "Continue" : "View course"}</span>
          <span className="home-course-arrow" aria-hidden="true">→</span>
        </div>
      </div>
    </article>
  );
}
