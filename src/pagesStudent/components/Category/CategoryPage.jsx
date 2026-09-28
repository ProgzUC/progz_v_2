import React, { useMemo, useState } from "react";
import "./CategoryPage.css";
import CourseBanner from "../CourseBanner/CourseBanner";
import CatalogCourseCard from "../Courses/CatalogCourseCard";
import { useUnifiedCatalog } from "../../../hooks/useStudentCourses";
import Loader from "../../../components/common/Loader/Loader";

const FILTERS = [
  { id: "all", label: "All courses" },
  { id: "enrolled", label: "Enrolled" },
  { id: "available", label: "Not enrolled" },
];

function CategoryPage() {
  const { courses, isLoading, isError } = useUnifiedCatalog();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");

  const visibleCourses = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return courses.filter((course) => {
      if (scope === "enrolled" && !course.enrolled) return false;
      if (scope === "available" && course.enrolled) return false;
      if (!needle) return true;
      const haystack = `${course.title || ""} ${course.description || ""} ${(course.instructors || []).join(" ")}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [courses, query, scope]);

  return (
    <div className="category-container student-category-page">
      <CourseBanner />

      <div className="jc-header-content">
        <p className="jc-course-title">Explore <span>Courses</span></p>
        <p className="jc-course-subtitle">Search the academy catalog and open a course to continue learning.</p>
      </div>

      <div className="catalog-toolbar">
        <input
          type="search"
          className="catalog-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by course or instructor"
          aria-label="Search courses"
        />
        <div className="catalog-filters" role="tablist" aria-label="Course filters">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={scope === filter.id}
              className={`catalog-filter ${scope === filter.id ? "active" : ""}`}
              onClick={() => setScope(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Loader message="Loading courses..." />
      ) : isError ? (
        <p className="jc-catalog-status">The course catalog could not be loaded. Try again in a moment.</p>
      ) : visibleCourses.length === 0 ? (
        <p className="jc-catalog-status">No courses match this search.</p>
      ) : (
        <div className="jc-course-grid">
          {visibleCourses.map((course) => (
            <CatalogCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
