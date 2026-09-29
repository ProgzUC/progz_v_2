import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import { BiBookOpen, BiCalendar, BiCheckCircle, BiGridAlt } from "react-icons/bi";
import { useStudentCourses, useUnifiedCatalog } from "../../hooks/useStudentCourses";
import { useStudentProfile } from "../../hooks/useStudentProfile";
import { formatNextClass } from "../utils/formatNextClass";
import heroImage from "/student/hero.jpg";
import "./Hero.css";

export default function Hero() {
  const { data } = useStudentCourses();
  const { courses } = useUnifiedCatalog();
  const { data: profile } = useStudentProfile();
  const [photoReady, setPhotoReady] = useState(true);

  const continueLearning = data?.continueLearning || null;
  const nextClass = data?.nextClass || null;
  const enrolled = data?.enrolledCourses || [];
  const lessonsDone = enrolled.reduce((sum, course) => sum + (course.completedLessons || 0), 0);
  const firstName = profile?.name?.trim().split(/\s+/)[0] || "";
  const continueState = continueLearning
    ? { courseId: continueLearning.courseId, openContinue: true }
    : undefined;

  const stats = [
    {
      icon: <BiBookOpen />,
      value: data ? String(enrolled.length) : "—",
      label: "Enrolled courses",
    },
    {
      icon: <BiCheckCircle />,
      value: data ? String(lessonsDone) : "—",
      label: "Lessons completed",
    },
    {
      icon: <BiGridAlt />,
      value: courses.length ? String(courses.length) : "—",
      label: "Courses in catalog",
    },
    {
      icon: <BiCalendar />,
      value: nextClass ? formatNextClass(nextClass.nextClassAt) : "None yet",
      label: "Next class",
      compact: true,
    },
  ];

  return (
    <section className="home-hero">
      <div className="home-hero-panel">
        <div className="home-hero-copy">
          <p className="home-kicker">
            <span className="home-kicker-dot" aria-hidden="true" />
            {firstName ? `Hi, ${firstName}` : "Your learning space"}
          </p>

          <h1 className="home-title">
            Grow your skills and
            <span className="home-script"> advance</span>
            <br />
            your career
          </h1>

          <p className="home-lead">
            {continueLearning
              ? `Pick up ${continueLearning.courseName}${continueLearning.lesson?.title ? ` at ${continueLearning.lesson.title}` : ""}.`
              : "Start, switch, or go deeper with the programs published for your academy."}
          </p>

          <div className="home-actions">
            <Link
              to={continueLearning ? "/student-dashboard/my-courses" : "/student-dashboard/browse"}
              state={continueState}
              className="home-btn home-btn-primary"
            >
              <FaPlay aria-hidden="true" />
              {continueLearning ? "Continue learning" : "Browse courses"}
            </Link>
            <Link to="/student-dashboard/browse" className="home-btn home-btn-ghost">
              <BiBookOpen aria-hidden="true" />
              Explore catalog
            </Link>
          </div>

          {typeof continueLearning?.progressPercentage === "number" && (
            <p className="home-progress-note">
              {continueLearning.progressPercentage}% complete
              {continueLearning.totalLessons
                ? ` · ${continueLearning.completedLessons || 0}/${continueLearning.totalLessons} lessons`
                : ""}
            </p>
          )}
        </div>

        <div className="home-visual" aria-hidden="true">
          <div className="home-stage">
            <span className="home-blob" />
            <span className="home-ring home-ring-outer" />
            <span className="home-ring home-ring-inner" />
            <span className="home-spark home-spark-a" />
            <span className="home-spark home-spark-b" />

            <div className="home-portrait">
            {photoReady ? (
              <img
                src={heroImage}
                alt=""
                onError={() => setPhotoReady(false)}
              />
            ) : (
              <div className="home-portrait-fallback">
                <BiBookOpen />
              </div>
            )}
            </div>
          </div>

          <article className="home-float home-float-progress">
            <p>Continue</p>
            <strong>{continueLearning?.courseName || "Pick a course"}</strong>
            <div className="home-mini-track">
              <span style={{ width: `${continueLearning?.progressPercentage || 8}%` }} />
            </div>
          </article>

          <article className="home-float home-float-class">
            <p>Next class</p>
            <strong>{nextClass?.courseName || "Nothing scheduled"}</strong>
            <span>{nextClass ? formatNextClass(nextClass.nextClassAt) : "We’ll show it here"}</span>
          </article>

          <article className="home-float home-float-chip">
            <BiCheckCircle />
            <span>{enrolled.length ? `${enrolled.length} active` : "Ready to start"}</span>
          </article>
        </div>
      </div>

      <div className="home-stats">
        {stats.map((stat) => (
          <article key={stat.label} className="home-stat">
            <span className="home-stat-icon">{stat.icon}</span>
            <div>
              <strong className={stat.compact ? "is-compact" : ""}>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
