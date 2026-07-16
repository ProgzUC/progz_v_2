import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BiTimeFive, BiBarChartAlt2, BiBriefcase, BiTrophy, BiArrowBack } from "react-icons/bi";
import "./CourseDetails.css";

export default function CourseDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const course = location.state?.course;

  if (!course) {
    return (
      <div className="course-details-page student-container">
        <button className="course-details-back" type="button" onClick={() => navigate(-1)}>
          <BiArrowBack /> Back
        </button>
        <div className="course-details-empty">
          <h2>Course not found</h2>
          <p>Please select a course from Browse or Trending Courses.</p>
          <button type="button" className="student-btn-primary" onClick={() => navigate("/student-dashboard/browse")}>
            Go to Browse
          </button>
        </div>
      </div>
    );
  }

  const roles = Array.isArray(course.roles)
    ? course.roles
    : typeof course.roles === "string"
      ? course.roles.replace(/^In Demand Roles:\s*/i, "").split(",").map((r) => r.trim()).filter(Boolean)
      : [];

  return (
    <div className="course-details-page">
      <div className="student-container">
        <button className="course-details-back" type="button" onClick={() => navigate(-1)}>
          <BiArrowBack /> Back
        </button>

        <div className="course-details-hero">
          <div className="course-details-image-wrap">
            <img src={course.img} alt={course.title} className="course-details-image" />
          </div>
          <div className="course-details-info">
            {course.category && <span className="course-details-category">{course.category}</span>}
            <h1 className="course-details-title">{course.title}</h1>
            <p className="course-details-desc">{course.desc}</p>

            <div className="course-details-meta">
              <span><BiBarChartAlt2 /> {course.level || "Intermediate"}</span>
              <span><BiTimeFive /> {course.duration || "6 Months"}</span>
              {course.salary && <span><BiTrophy /> {course.salary}</span>}
            </div>

            {roles.length > 0 && (
              <div className="course-details-roles">
                <label><BiBriefcase /> In-demand roles</label>
                <div className="course-details-role-tags">
                  {roles.map((role) => (
                    <span key={role} className="course-details-role-pill">{role}</span>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              className="student-btn-primary course-details-cta"
              onClick={() => navigate("/student-dashboard/my-courses")}
            >
              Go to My Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
