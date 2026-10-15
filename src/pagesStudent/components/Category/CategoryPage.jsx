import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CategoryPage.css";
import { useUnifiedCatalog } from "../../../hooks/useStudentCourses";
import { EmptyState, ErrorState, Skeleton } from "../../../components/common/PageState";
import AppSelect from "../../../components/common/AppSelect/AppSelect";
import {
  BiSearch,
  BiFilterAlt,
  BiTimeFive,
  BiBookOpen,
  BiX,
  BiLogoHtml5,
  BiLogoCss3,
  BiLogoJavascript,
  BiLogoReact,
  BiLogoNodejs,
  BiLogoPython,
  BiLogoGit,
  BiLogoFigma,
} from "react-icons/bi";

// Supported filter categories matching the reference UI
const LEVEL_OPTIONS = [
  { id: "Beginner", label: "Beginner" },
  { id: "Intermediate", label: "Intermediate" },
  { id: "Advanced", label: "Advanced" },
];

const TOPIC_OPTIONS = [
  { id: "javascript", label: "JavaScript" },
  { id: "react", label: "React" },
  { id: "css", label: "CSS & Styling" },
  { id: "html", label: "HTML Basics" },
  { id: "python", label: "Python" },
  { id: "nodejs", label: "Node.js & Backend" },
  { id: "git", label: "Git & GitHub" },
  { id: "figma", label: "UI/UX & Figma" },
];

const DURATION_OPTIONS = [
  { id: "under_5", label: "Under 5 hours" },
  { id: "5_to_10", label: "5–10 hours" },
  { id: "10_plus", label: "10+ hours" },
];

const TYPE_OPTIONS = [
  { id: "all", label: "All Courses" },
  { id: "enrolled", label: "Enrolled" },
  { id: "available", label: "Available to Join" },
];

const SORT_OPTIONS = [
  { value: "relevant", label: "Most relevant" },
  { value: "newest", label: "Newest" },
  { value: "lessons_desc", label: "Most lessons" },
  { value: "title_asc", label: "Title (A – Z)" },
];

// Helper: resolve clean tech logo for card
function getTechLogo(course) {
  const text = `${course.title || ""} ${course.description || ""}`.toLowerCase();
  if (text.includes("html")) {
    return {
      icon: <BiLogoHtml5 />,
      bg: "#FFF1EB",
      color: "#E44D26",
      label: "HTML5",
    };
  }
  if (text.includes("css") || text.includes("tailwind") || text.includes("bootstrap")) {
    return {
      icon: <BiLogoCss3 />,
      bg: "#EFF6FF",
      color: "#264DE4",
      label: "CSS3",
    };
  }
  if (text.includes("javascript") || text.includes(" js ") || text.endsWith(" js")) {
    return {
      icon: <BiLogoJavascript />,
      bg: "#FEF9C3",
      color: "#CA8A04",
      label: "JS",
    };
  }
  if (text.includes("react")) {
    return {
      icon: <BiLogoReact />,
      bg: "#ECFEFF",
      color: "#0891B2",
      label: "React",
    };
  }
  if (text.includes("node") || text.includes("express") || text.includes("backend")) {
    return {
      icon: <BiLogoNodejs />,
      bg: "#F0FDF4",
      color: "#16A34A",
      label: "Node",
    };
  }
  if (text.includes("python")) {
    return {
      icon: <BiLogoPython />,
      bg: "#EFF6FF",
      color: "#2563EB",
      label: "Python",
    };
  }
  if (text.includes("git") || text.includes("github")) {
    return {
      icon: <BiLogoGit />,
      bg: "#FEF2F2",
      color: "#EA580C",
      label: "Git",
    };
  }
  if (text.includes("figma") || text.includes("design") || text.includes("ui/ux")) {
    return {
      icon: <BiLogoFigma />,
      bg: "#FAF5FF",
      color: "#9333EA",
      label: "Figma",
    };
  }

  // Fallback: ProgZ branded monogram
  const initials = String(course.title || "ProgZ")
    .trim()
    .slice(0, 2)
    .toUpperCase();
  return {
    icon: <span className="tech-badge-text">{initials}</span>,
    bg: "#E6F6F0",
    color: "#10A879",
    label: initials,
  };
}

// Helper: deduce level
function getCourseLevel(course) {
  if (course.level) return course.level;
  const text = `${course.title || ""} ${course.description || ""}`.toLowerCase();
  if (text.includes("advanced") || text.includes("expert") || text.includes("mastery")) return "Advanced";
  if (text.includes("intermediate") || text.includes("full stack") || text.includes("deep dive")) return "Intermediate";
  return "Beginner";
}

// Helper: deduce duration label
function getCourseDuration(course) {
  if (course.durationLabel) return course.durationLabel;
  if (course.courseDuration) return course.courseDuration;
  if (course.lessonCount) {
    const hours = Math.max(4, Math.round(course.lessonCount * 0.75));
    return `${hours} hrs`;
  }
  return "Self-paced";
}

// Helper: check duration bucket
function matchesDuration(course, bucketId) {
  const text = `${course.durationLabel || ""} ${course.courseDuration || ""}`.toLowerCase();
  const lessonCount = course.lessonCount || 0;

  if (bucketId === "under_5") {
    if (text.includes("hour") && parseInt(text, 10) < 5) return true;
    if (lessonCount > 0 && lessonCount <= 6) return true;
    if (text.includes("day") || text.includes("crash")) return true;
    return false;
  }
  if (bucketId === "5_to_10") {
    if (text.includes("hour")) {
      const h = parseInt(text, 10);
      if (h >= 5 && h <= 10) return true;
    }
    if (lessonCount > 6 && lessonCount <= 15) return true;
    if (text.includes("1 month") || text.includes("2 weeks")) return true;
    return false;
  }
  if (bucketId === "10_plus") {
    if (text.includes("hour") && parseInt(text, 10) > 10) return true;
    if (lessonCount > 15) return true;
    if (text.includes("month") || text.includes("year")) return true;
    return false;
  }
  return true;
}

// Helper: check topic match
function matchesTopic(course, topicId) {
  const text = `${course.title || ""} ${course.description || ""}`.toLowerCase();
  switch (topicId) {
    case "javascript":
      return text.includes("javascript") || text.includes(" js");
    case "react":
      return text.includes("react");
    case "css":
      return text.includes("css") || text.includes("tailwind") || text.includes("bootstrap") || text.includes("style");
    case "html":
      return text.includes("html");
    case "python":
      return text.includes("python");
    case "nodejs":
      return text.includes("node") || text.includes("express") || text.includes("backend");
    case "git":
      return text.includes("git") || text.includes("github");
    case "figma":
      return text.includes("figma") || text.includes("design") || text.includes("ui");
    default:
      return true;
  }
}

function CategoryPage() {
  const navigate = useNavigate();
  const { courses, isLoading, isError, refetch } = useUnifiedCatalog();

  // Filters state
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [sortBy, setSortBy] = useState("relevant");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Toggle filter in array
  const toggleLevel = (id) => {
    setSelectedLevels((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleTopic = (id) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleDuration = (id) => {
    setSelectedDurations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setQuery("");
    setSelectedType("all");
    setSelectedLevels([]);
    setSelectedTopics([]);
    setSelectedDurations([]);
    setSortBy("relevant");
  };

  const totalActiveFilters =
    (query ? 1 : 0) +
    (selectedType !== "all" ? 1 : 0) +
    selectedLevels.length +
    selectedTopics.length +
    selectedDurations.length;

  // Filtered & Sorted Courses
  const visibleCourses = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = courses.filter((course) => {
      // Type filter
      if (selectedType === "enrolled" && !course.enrolled) return false;
      if (selectedType === "available" && course.enrolled) return false;

      // Level filter
      if (selectedLevels.length > 0) {
        const level = getCourseLevel(course);
        if (!selectedLevels.includes(level)) return false;
      }

      // Topic filter
      if (selectedTopics.length > 0) {
        const hasTopic = selectedTopics.some((t) => matchesTopic(course, t));
        if (!hasTopic) return false;
      }

      // Duration filter
      if (selectedDurations.length > 0) {
        const hasDuration = selectedDurations.some((d) => matchesDuration(course, d));
        if (!hasDuration) return false;
      }

      // Search needle
      if (needle) {
        const haystack = `${course.title || ""} ${course.description || ""} ${(course.instructors || []).join(" ")} ${course.code || ""}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }

      return true;
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        return (b.id || "").localeCompare(a.id || "");
      }
      if (sortBy === "lessons_desc") {
        return (b.lessonCount || 0) - (a.lessonCount || 0);
      }
      if (sortBy === "title_asc") {
        return String(a.title || "").localeCompare(String(b.title || ""));
      }
      // "relevant": enrolled first, then alphabetical
      if (a.enrolled !== b.enrolled) return a.enrolled ? -1 : 1;
      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  }, [courses, query, selectedType, selectedLevels, selectedTopics, selectedDurations, sortBy]);

  const handleCardClick = (course) => {
    navigate(`/student-dashboard/course-details/${course.id || course.courseId}`);
  };

  return (
    <div className="student-catalog-page">
      {/* Top Header Banner matching ProgZ Forest + Mint Theme */}
      <header className="catalog-header">
        <div className="catalog-header-container">
          <div className="catalog-header-badge">
            <span className="badge-pulse-dot" />
            <span>Student Catalog</span>
          </div>
          <h1 className="catalog-header-title">
            Explore &amp; Master <span>Tech Skills</span>
          </h1>
          <p className="catalog-header-subtitle">
            Industry-aligned courses, real-world coding challenges, and live instructor mentorship to power your developer career.
          </p>
        </div>
      </header>

      {/* Main Catalog Layout: Left Filter Sidebar + Right Cards Grid */}
      <div className="catalog-main-container">
        {/* Mobile Filter Toggle Bar */}
        <div className="catalog-mobile-bar">
          <button
            type="button"
            className="mobile-filter-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open filter options"
          >
            <BiFilterAlt />
            <span>Filters</span>
            {totalActiveFilters > 0 && (
              <span className="filter-count-badge">{totalActiveFilters}</span>
            )}
          </button>
          <span className="mobile-results-count">
            {visibleCourses.length} {visibleCourses.length === 1 ? "course" : "courses"}
          </span>
        </div>

        {/* Backdrop for mobile drawer */}
        {isMobileDrawerOpen && (
          <div
            className="catalog-drawer-backdrop"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── LEFT SIDEBAR FILTERS ── */}
        <aside className={`catalog-sidebar ${isMobileDrawerOpen ? "open" : ""}`}>
          <div className="catalog-sidebar-header">
            <div className="catalog-sidebar-title-group">
              <BiFilterAlt className="catalog-sidebar-filter-icon" />
              <span className="catalog-sidebar-title">Filters</span>
            </div>
            {totalActiveFilters > 0 && (
              <button
                type="button"
                className="catalog-sidebar-clear-btn"
                onClick={clearAllFilters}
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              className="catalog-sidebar-close-mobile"
              onClick={() => setIsMobileDrawerOpen(false)}
              aria-label="Close filters"
            >
              <BiX />
            </button>
          </div>

          {/* Filter Group: Type */}
          <div className="filter-group">
            <h4 className="filter-group-title">Type</h4>
            <div className="filter-options">
              {TYPE_OPTIONS.map((opt) => (
                <label key={opt.id} className="filter-checkbox-label">
                  <input
                    type="radio"
                    name="courseType"
                    checked={selectedType === opt.id}
                    onChange={() => setSelectedType(opt.id)}
                    className="filter-radio"
                  />
                  <span className="filter-label-text">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter Group: Level */}
          <div className="filter-group">
            <h4 className="filter-group-title">Level</h4>
            <div className="filter-options">
              {LEVEL_OPTIONS.map((opt) => (
                <label key={opt.id} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(opt.id)}
                    onChange={() => toggleLevel(opt.id)}
                    className="filter-checkbox"
                  />
                  <span className="filter-label-text">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter Group: Topic */}
          <div className="filter-group">
            <h4 className="filter-group-title">Topic</h4>
            <div className="filter-options">
              {TOPIC_OPTIONS.map((opt) => (
                <label key={opt.id} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(opt.id)}
                    onChange={() => toggleTopic(opt.id)}
                    className="filter-checkbox"
                  />
                  <span className="filter-label-text">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter Group: Average Length */}
          <div className="filter-group">
            <h4 className="filter-group-title">Average Length</h4>
            <div className="filter-options">
              {DURATION_OPTIONS.map((opt) => (
                <label key={opt.id} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedDurations.includes(opt.id)}
                    onChange={() => toggleDuration(opt.id)}
                    className="filter-checkbox"
                  />
                  <span className="filter-label-text">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mobile Drawer Apply Action */}
          <div className="sidebar-mobile-footer">
            <button
              type="button"
              className="sidebar-apply-btn"
              onClick={() => setIsMobileDrawerOpen(false)}
            >
              Show {visibleCourses.length} Results
            </button>
          </div>
        </aside>

        {/* ── RIGHT MAIN CATALOG CONTENT ── */}
        <main className="catalog-content">
          {/* Top Search & Sort Bar */}
          <div className="catalog-toolbar-row">
            <div className="catalog-search-box">
              <BiSearch className="search-box-icon" />
              <input
                type="search"
                className="catalog-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for? Type to search"
                aria-label="Search courses"
              />
              {query && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <BiX />
                </button>
              )}
            </div>

            <div className="catalog-sort-wrapper">
              <AppSelect
                id="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={SORT_OPTIONS}
                aria-label="Sort courses by"
                className="catalog-app-select"
              />
            </div>
          </div>

          {/* Active Filter Chips Row */}
          {totalActiveFilters > 0 && (
            <div className="active-chips-row">
              <span className="chips-label">Active:</span>

              {selectedType !== "all" && (
                <button
                  type="button"
                  className="active-chip"
                  onClick={() => setSelectedType("all")}
                >
                  Type: {selectedType === "enrolled" ? "Enrolled" : "Available"}
                  <BiX className="chip-remove" />
                </button>
              )}

              {selectedLevels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className="active-chip"
                  onClick={() => toggleLevel(lvl)}
                >
                  {lvl}
                  <BiX className="chip-remove" />
                </button>
              ))}

              {selectedTopics.map((topicId) => {
                const opt = TOPIC_OPTIONS.find((t) => t.id === topicId);
                return (
                  <button
                    key={topicId}
                    type="button"
                    className="active-chip"
                    onClick={() => toggleTopic(topicId)}
                  >
                    {opt?.label || topicId}
                    <BiX className="chip-remove" />
                  </button>
                );
              })}

              {selectedDurations.map((durId) => {
                const opt = DURATION_OPTIONS.find((d) => d.id === durId);
                return (
                  <button
                    key={durId}
                    type="button"
                    className="active-chip"
                    onClick={() => toggleDuration(durId)}
                  >
                    {opt?.label || durId}
                    <BiX className="chip-remove" />
                  </button>
                );
              })}

              {query && (
                <button
                  type="button"
                  className="active-chip"
                  onClick={() => setQuery("")}
                >
                  &ldquo;{query}&rdquo;
                  <BiX className="chip-remove" />
                </button>
              )}

              <button
                type="button"
                className="chip-clear-all"
                onClick={clearAllFilters}
              >
                Reset all
              </button>
            </div>
          )}

          {/* Results Summary Counter */}
          <div className="catalog-results-counter">
            <span>
              Showing <strong>{visibleCourses.length}</strong> {visibleCourses.length === 1 ? "course" : "courses"}
            </span>
          </div>

          {/* Courses Grid States */}
          {isLoading ? (
            <Skeleton variant="cards" label="Loading catalog..." />
          ) : isError ? (
            <ErrorState
              title="Catalog could not be loaded"
              message="Please check your connection and try again."
              onRetry={() => refetch()}
            />
          ) : visibleCourses.length === 0 ? (
            <EmptyState
              title="No courses match your criteria"
              message="Try broadening your search or resetting some of the filters."
              icon="bi-search"
              action={
                <button
                  type="button"
                  className="empty-reset-btn"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              }
            />
          ) : (
            <div className="catalog-grid">
              {visibleCourses.map((course) => {
                const tech = getTechLogo(course);
                const level = getCourseLevel(course);
                const duration = getCourseDuration(course);
                const title = course.title || course.courseName || "Course";

                return (
                  <article
                    key={course.id || course.courseId}
                    className="catalog-card"
                    onClick={() => handleCardClick(course)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleCardClick(course)}
                    aria-label={`View ${title}`}
                  >
                    {/* Top Row: Tech Logo + Badges */}
                    <div className="card-top-row">
                      <div
                        className="card-tech-logo"
                        style={{
                          backgroundColor: tech.bg,
                          color: tech.color,
                        }}
                        aria-label={tech.label}
                      >
                        {tech.icon}
                      </div>

                      <div className="card-badges-row">
                        {course.enrolled && (
                          <span className="badge-enrolled">
                            <span className="enrolled-dot" />
                            Enrolled
                          </span>
                        )}
                        <span className={`badge-level level-${level.toLowerCase()}`}>
                          {level}
                        </span>
                        <span className="badge-duration">
                          <BiTimeFive aria-hidden="true" />
                          {duration}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Title with Diagonal Arrow */}
                    <div className="card-title-group">
                      <h3 className="card-title">
                        <span>{title}</span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="card-arrow"
                          aria-hidden="true"
                        >
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="7 7 17 7 17 17" />
                        </svg>
                      </h3>
                    </div>

                    {/* Description snippet */}
                    <p className="card-description">
                      {course.description ||
                        "Explore essential concepts, hands-on lessons, and practical exercises curated by expert instructors."}
                    </p>

                    {/* Card Footer: Metadata & Action */}
                    <div className="card-footer">
                      <div className="card-stats">
                        <span className="card-modules-count">
                          <BiBookOpen aria-hidden="true" />
                          {course.moduleCount || 1} {course.moduleCount === 1 ? "module" : "modules"}
                        </span>
                        {course.lessonCount > 0 && (
                          <span className="card-lessons-count">
                            &bull; {course.lessonCount} lessons
                          </span>
                        )}
                      </div>

                      <span className="card-action-text">
                        {course.enrolled ? "Continue" : "View course"} &rarr;
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CategoryPage;
