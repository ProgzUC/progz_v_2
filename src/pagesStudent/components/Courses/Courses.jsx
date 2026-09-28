import React from "react";
import { Link } from "react-router-dom";
import "./Courses.css";
import CatalogCourseCard from "./CatalogCourseCard";
import { useUnifiedCatalog } from "../../../hooks/useStudentCourses";
import Loader from "../../../components/common/Loader/Loader";

export default function Courses() {
  const { courses, isLoading, isError } = useUnifiedCatalog();
  const preview = courses.slice(0, 6);

  return (
    <section className="jc-course-section">
      <div className="student-container">
        <div className="jc-header-content">
          <p className="jc-course-title">Course <span>Catalog</span></p>
          <p className="jc-course-subtitle">
            The same programs you can open in My Courses, including the ones you are already enrolled in.
          </p>
        </div>

        {isLoading ? (
          <Loader message="Loading courses..." />
        ) : isError ? (
          <p className="jc-catalog-status">The course catalog could not be loaded. Try again in a moment.</p>
        ) : preview.length === 0 ? (
          <p className="jc-catalog-status">No courses have been published yet.</p>
        ) : (
          <>
            <div className="jc-course-grid">
              {preview.map((course) => (
                <CatalogCourseCard key={course.id} course={course} />
              ))}
            </div>
            {courses.length > preview.length && (
              <div className="jc-catalog-more">
                <Link to="/student-dashboard/browse" className="student-btn-primary">
                  Browse all {courses.length} courses
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
