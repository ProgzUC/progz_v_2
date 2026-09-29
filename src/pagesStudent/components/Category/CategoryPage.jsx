import React, { useMemo, useState } from "react";
import "./CategoryPage.css";
import CourseBanner from "../CourseBanner/CourseBanner";
import CatalogCourseCard from "../Courses/CatalogCourseCard";
import { useUnifiedCatalog } from "../../../hooks/useStudentCourses";
import { EmptyState, ErrorState, Skeleton } from "../../../components/common/PageState";

const FILTERS = [
  { id: "all", label: "All courses" },
  { id: "enrolled", label: "Enrolled" },
  { id: "available", label: "Not enrolled" },
];

function CategoryPage() {
  const { courses, isLoading, isError, refetch } = useUnifiedCatalog();
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
        <Skeleton variant="cards" label="Loading courses" />
      ) : isError ? (
        <ErrorState
          title="Catalog could not be loaded"
          message="Search will work again once the course list loads."
          onRetry={() => refetch()}
        />
      ) : visibleCourses.length === 0 ? (
        <EmptyState
          title="No courses match"
          message="Try a different search or filter."
          icon="bi-search"
        />
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
