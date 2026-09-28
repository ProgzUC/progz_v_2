import React from 'react'
import './Hero.css'
import heroImage from '/student/hero.jpg';
import vector1 from '/student/vector1.png';
import vector2 from '/student/vector2.png';
import vector3 from '/student/vector3.png';

import { Link } from 'react-router-dom';
import { FaPlay } from "react-icons/fa";
import { TbBook } from "react-icons/tb";
import { useStudentCourses } from "../../hooks/useStudentCourses";
import { formatNextClass } from "../utils/formatNextClass";

export default function Hero() {
  const { data } = useStudentCourses();
  const continueLearning = data?.continueLearning || null;
  const nextClass = data?.nextClass || null;
  const continueState = continueLearning
    ? { courseId: continueLearning.courseId, openContinue: true }
    : undefined;

  return (
    <section
      className="hero-container student-hero-section"
      style={{ '--hero-bg': `url(${heroImage})` }}
    >
      <div className="hero-overlay" />

      {/* Decorative Vectors */}
      <div
        className="vector vector-1"
        style={{ backgroundImage: `url(${vector1})` }}
      />

      <div
        className="vector vector-2"
        style={{ backgroundImage: `url(${vector2})` }}
      />

      <div
        className="vector vector-3"
        style={{ backgroundImage: `url(${vector3})` }}
      />

      <div className="hero-content">
        <p className="hero-title">
          Unlock Your Potential
          <br />
          with Expert-Led Online
          <br />
          Courses
        </p>

        <p className="hero-sub">
          Continue your learning journey and master new skills with our expert-led courses.
        </p>

        <div className="hero-buttons">
          <Link
            to={continueLearning ? "/student-dashboard/my-courses" : "/student-dashboard/browse"}
            state={continueState}
            className="student-hero-btn continue-learning-btn"
          >
            <div className="btn-icon">
              <FaPlay className="icon-svg" />
            </div>
            <span className="btn-text">{continueLearning ? "Continue Learning" : "Browse Courses"}</span>
          </Link>

          {continueLearning && (
            <Link to="/student-dashboard/browse" className="student-hero-btn browse-all-btn">
              <div className="btn-icon">
                <TbBook className="icon-svg" />
              </div>
              <span className="btn-text">Browse All Courses</span>
            </Link>
          )}
        </div>

        {continueLearning && (
          <p className="hero-continue-meta">
            {continueLearning.courseName}
            {continueLearning.lesson?.title ? ` · ${continueLearning.lesson.title}` : ""}
            {typeof continueLearning.progressPercentage === "number" ? ` · ${continueLearning.progressPercentage}%` : ""}
          </p>
        )}

        {nextClass && (
          <div className="hero-next-class">
            <span className="hero-next-label">Next class</span>
            <strong>{nextClass.courseName}</strong>
            <span>{formatNextClass(nextClass.nextClassAt)}</span>
            <div className="hero-next-links">
              <Link to="/student-dashboard/my-courses" state={{ courseId: nextClass.courseId }}>
                Open course
              </Link>
              {nextClass.batchId && (
                <Link to={`/student-dashboard/my-attendance?batchId=${nextClass.batchId}`}>
                  Attendance
                </Link>
              )}
            </div>
          </div>
        )}
      </div>


      <div className="scroll-indicator">
        <span className="scroll-text">Scroll Down</span>
        <div className="mouse-wheel"></div>
      </div>

      <div className="hero-bottom-fade" />
    </section >
  );
}
