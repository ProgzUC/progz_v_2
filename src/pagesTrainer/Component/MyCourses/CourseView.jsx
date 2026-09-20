import React, { useMemo, useState } from "react";
import {
  FaBook,
  FaCopy,
  FaEdit,
  FaPlay,
  FaImage,
  FaStar,
} from "react-icons/fa";
import {
  BiChevronDown,
  BiChevronRight,
  BiTime,
  BiBook,
  BiLayer,
  BiLogoHtml5,
  BiLogoCss3,
  BiLogoBootstrap,
  BiLogoJavascript,
} from "react-icons/bi";
import "./CourseView.css";
import { getHtmlPlainText, hasMeaningfulHtml } from "../../../components/common/RichTextEditor/richTextUtils";
import SectionDetails from "../../../components/common/CourseCurriculum/SectionDetails";
import CoursePreviewModal from "../../../components/common/CoursePreviewModal/CoursePreviewModal";
import { useCourse } from "../../../hooks/useCourses";
import Loader from "../../../components/common/Loader/Loader";

const THUMB_SKIP_WORDS = new Set([
  "complete", "course", "courses", "the", "a", "an", "and",
  "of", "for", "in", "to", "with", "using", "web", "development",
]);

function getThumbLines(name) {
  const words = String(name || "Course")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word && !THUMB_SKIP_WORDS.has(word.toLowerCase()));

  if (words.length === 0) {
    const first = String(name || "Course").trim().split(/\s+/)[0] || "Course";
    return [first.toUpperCase()];
  }
  if (words.length === 1) return [words[0].toUpperCase()];
  return [words[0].toUpperCase(), words[1].toUpperCase()];
}

function formatDuration(hours, months) {
  const parts = [];
  const monthsNum = Number(months);
  if (!Number.isNaN(monthsNum) && monthsNum > 0) {
    parts.push(`${monthsNum} month${monthsNum === 1 ? "" : "s"}`);
  }
  const hoursNum = Number(hours);
  if (!Number.isNaN(hoursNum) && hoursNum > 0) {
    parts.push(`${hoursNum}h`);
  }
  return parts.length ? parts.join(" · ") : null;
}

function getCourseLogo(name) {
  const lower = String(name || "").toLowerCase();
  if (lower.includes("html")) return <BiLogoHtml5 className="cv-brand-logo html" />;
  if (lower.includes("css")) return <BiLogoCss3 className="cv-brand-logo css" />;
  if (lower.includes("bootstrap")) return <BiLogoBootstrap className="cv-brand-logo bootstrap" />;
  if (lower.includes("javascript") || /\bjs\b/.test(lower)) {
    return <BiLogoJavascript className="cv-brand-logo js" />;
  }
  return null;
}

const CourseView = ({ courseData, onBack, onEdit }) => {
  const courseId = courseData?._id || courseData?.courseId;
  const { data: fullCourse, isLoading, isError, error } = useCourse(courseId);

  const [expandedModules, setExpandedModules] = useState(() => new Set([0]));
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const course = fullCourse;
  const modules = course?.modules || [];
  const lessonsCount = modules.reduce((acc, mod) => acc + (mod.sections?.length || 0), 0);
  const displayId =
    course?.courseId ||
    (course?._id
      ? `CRS-${(course.courseName || "GEN").substr(0, 3).toUpperCase().replace(/\s/g, "")}-001`
      : "N/A");
  const thumbnailUrl = course?.thumbnail?.url || null;
  const courseName = course?.courseName || course?.title || "Untitled Course";
  const category = course?.category || course?.zenCourseType || "";
  const durationLabel = formatDuration(
    course?.courseDuration || course?.duration,
    course?.courseDurationMonths || course?.durationMonths
  );
  const descriptionText = hasMeaningfulHtml(course?.courseDescription)
    ? getHtmlPlainText(course?.courseDescription)
    : "";
  const thumbLines = useMemo(() => getThumbLines(courseName), [courseName]);

  const allExpanded = modules.length > 0 && expandedModules.size === modules.length;

  const toggleModule = (index) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    setExpandedSection((prev) => (prev?.moduleIndex === index ? null : prev));
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedModules(new Set());
      setExpandedSection(null);
      return;
    }
    setExpandedModules(new Set(modules.map((_, index) => index)));
  };

  const copyCourseId = async () => {
    try {
      await navigator.clipboard.writeText(String(displayId));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (isLoading) return <Loader message="Loading course details..." />;
  if (isError) return <div className="error-state">Error: {error?.message || "Failed to load course"}</div>;
  if (!course) return <div className="error-state">Course not found</div>;

  const courseLogo = getCourseLogo(courseName);
  const levelLabel = course.level || course.difficulty || "";

  return (
    <div className="course-view-page">
      <div className="cv-page-inner">
        <section className="cv-hero-card">
          <div className="cv-hero-top">
            <button type="button" className="cv-course-id" onClick={copyCourseId} title="Copy course ID">
              <span>Course ID: {displayId}</span>
              <FaCopy />
              {copied && <em>Copied</em>}
            </button>
          </div>

          <div className="cv-hero-body">
            <div className="cv-hero-thumb">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="" className="cv-hero-thumb-img" />
            ) : (
              <div className="cv-hero-thumb-brand">
                {courseLogo || (
                  <p className="cv-hero-thumb-title">
                    {thumbLines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </p>
                )}
              </div>
            )}
            {levelLabel && (
              <span className="cv-level-badge">
                <FaStar /> {levelLabel}
              </span>
            )}
          </div>

          <div className="cv-hero-copy">
            {category && <span className="cv-category-pill">{category}</span>}
            <h1>{courseName}</h1>
            {descriptionText ? (
              <p className="cv-hero-desc">{descriptionText}</p>
            ) : null}
            <div className="cv-hero-meta">
              <span><BiBook /> {lessonsCount} Lessons</span>
              <span><BiLayer /> {modules.length} Modules</span>
              {durationLabel && <span><BiTime /> {durationLabel} Total</span>}
            </div>
            <div className="cv-hero-actions">
              <button type="button" className="cv-preview-btn" onClick={() => setShowPreview(true)}>
                <span className="cv-play-circle"><FaPlay /></span>
                Preview Course
              </button>
              <button type="button" className="cv-edit-btn" onClick={onEdit}>
                <span className="cv-edit-icon"><FaEdit /></span>
                Edit Course
              </button>
            </div>
          </div>

          <div className="cv-hero-art" aria-hidden="true">
            <div className="cv-hero-window">
              <div className="cv-hero-dots"><span /><span /><span /></div>
              <div className="cv-hero-window-body">
                <code>{'</>'}</code>
                <span className="cv-hero-photo"><FaImage /></span>
              </div>
            </div>
          </div>
          </div>
        </section>

        <section className="cv-curriculum-card">
          <div className="cv-column-header">
            <span className="cv-card-heading">
              <FaBook /> Curriculum
            </span>
            {modules.length > 0 && (
              <button type="button" className="cv-preview-link" onClick={toggleAll}>
                {allExpanded ? "Collapse All" : "Expand All"}
                <BiChevronDown className={`cv-list-icon ${allExpanded ? "is-open" : ""}`} />
              </button>
            )}
          </div>

          {modules.length === 0 && <div className="cv-empty-state">No modules found</div>}

          <div className="cv-module-list">
            {modules.map((mod, index) => {
              const isOpen = expandedModules.has(index);
              const sectionCount = mod.sections?.length || 0;
              return (
                <div key={mod.id || index} className={`cv-module-row ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="cv-module-toggle"
                    onClick={() => toggleModule(index)}
                  >
                    <span className="cv-module-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="cv-module-toggle-text">
                      <span className="cv-module-title">{mod.title || `Module ${index + 1}`}</span>
                      <span className="cv-module-sub">
                        {sectionCount} section{sectionCount === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="cv-module-lessons">
                      <BiBook /> {sectionCount} Lessons
                    </span>
                    <BiChevronDown className={`cv-list-icon ${isOpen ? "is-open" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="cv-module-body">
                      {sectionCount === 0 && (
                        <div className="cv-empty-state">No sections in this module</div>
                      )}
                      {mod.sections?.map((sec, idx) => {
                        const isSectionOpen =
                          expandedSection?.moduleIndex === index &&
                          expandedSection?.sectionIndex === idx;
                        return (
                          <div key={sec._id || idx} className={`cv-section-card ${isSectionOpen ? "open" : ""}`}>
                            <button
                              type="button"
                              className={`cv-section-toggle ${isSectionOpen ? "active" : ""}`}
                              onClick={() =>
                                setExpandedSection(isSectionOpen ? null : { moduleIndex: index, sectionIndex: idx })
                              }
                            >
                              <span>{sec.sectionName || sec.title}</span>
                              <BiChevronRight className="cv-list-icon" />
                            </button>
                            {isSectionOpen && (
                              <div className="cv-section-details">
                                <SectionDetails sec={sec} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {showPreview && (
        <CoursePreviewModal
          course={course}
          viewOnly
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default CourseView;
