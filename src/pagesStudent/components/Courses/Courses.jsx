import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Courses.css";
import CatalogCourseCard from "./CatalogCourseCard";
import { useUnifiedCatalog } from "../../../hooks/useStudentCourses";
import { EmptyState, ErrorState, Skeleton } from "../../../components/common/PageState";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "enrolled", label: "Enrolled" },
  { id: "available", label: "Available" },
];

export default function Courses() {
  const { courses, continueLearning, isLoading, isError, refetch } = useUnifiedCatalog();
  const [scope, setScope] = useState("all");

  const visible = useMemo(() => {
    return courses.filter((course) => {
      if (scope === "enrolled") return course.enrolled;
      if (scope === "available") return !course.enrolled;
      return true;
    }).slice(0, 8);
  }, [courses, scope]);

  return (
    <section className="home-catalog">
      <div className="student-container">
        <div className="home-catalog-head">
          <div>
            <h2>Most popular courses</h2>
            <p>Programs from your academy catalog, with the ones you are already enrolled in first.</p>
          </div>
          <div className="home-catalog-tabs" role="tablist" aria-label="Course filters">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={scope === filter.id}
                className={scope === filter.id ? "is-active" : ""}
                onClick={() => setScope(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Skeleton variant="cards" label="Loading courses" />
        ) : isError ? (
          <ErrorState
            title="Catalog could not be loaded"
            message="The course list did not come through. Try again in a moment."
            onRetry={() => refetch()}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title={scope === "all" ? "No courses published yet" : "Nothing in this filter"}
            message={scope === "all" ? "Published programs will show up here." : "Try another filter to see more courses."}
          />
        ) : (
          <div className="home-course-grid" key={scope}>
            {visible.map((course, index) => (
              <CatalogCourseCard key={course.id} course={course} tone={index} />
            ))}
          </div>
        )}

        <div className="home-cta">
          <div>
            <h3>{continueLearning ? "Pick up where you left off" : "Find your next course"}</h3>
            <p>
              {continueLearning
                ? `${continueLearning.courseName} is waiting at ${continueLearning.progressPercentage || 0}% complete.`
                : "Open the full catalog and start a program that matches what you want to learn."}
            </p>
          </div>
          <Link
            to={continueLearning ? "/student-dashboard/my-courses" : "/student-dashboard/browse"}
            state={continueLearning ? { courseId: continueLearning.courseId, openContinue: true } : undefined}
            className="home-cta-btn"
          >
            {continueLearning ? "Continue" : "Browse all courses"}
          </Link>
        </div>

        {courses.length > 8 && (
          <div className="home-catalog-more">
            <Link to="/student-dashboard/browse" className="student-btn-primary">
              Browse all {courses.length} courses
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
