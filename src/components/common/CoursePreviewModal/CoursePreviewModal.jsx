import React, { useState, useMemo } from "react";
import { FaBook } from "react-icons/fa";
import { BiChevronDown, BiChevronUp, BiX } from "react-icons/bi";
import "./CoursePreviewModal.css";
import RichTextContent from "../RichTextEditor/RichTextContent";
import { isHtmlEmpty } from "../RichTextEditor/richTextUtils";
import SectionDetails from "../CourseCurriculum/SectionDetails";

const getThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return null;
  if (typeof thumbnail === "string") return thumbnail;
  if (thumbnail.url) return thumbnail.url;
  if (thumbnail instanceof File) return URL.createObjectURL(thumbnail);
  return null;
};

const CoursePreviewModal = ({
  course,
  isEditMode = false,
  loading = false,
  viewOnly = false,
  onClose,
  onConfirmSave,
}) => {
  const [selectedModule, setSelectedModule] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);

  const thumbnailUrl = useMemo(() => getThumbnailUrl(course?.thumbnail), [course?.thumbnail]);
  const lessonsCount =
    course?.modules?.reduce((acc, mod) => acc + (mod.sections?.length || 0), 0) || 0;

  if (!course) return null;

  const activeModule = course.modules?.[selectedModule];

  return (
    <div className="course-preview-overlay" role="dialog" aria-modal="true">
      <div className="course-preview-panel">
        <div className="course-preview-topbar">
          <div>
            <p className="course-preview-eyebrow">Course Preview</p>
            <h2>{viewOnly ? "Full course overview" : `Review before ${isEditMode ? "saving" : "creating"}`}</h2>
          </div>
          <button type="button" className="course-preview-close" onClick={onClose} aria-label="Close preview">
            <BiX />
          </button>
        </div>

        <div className="course-preview-scroll">
          <div className="course-preview-header">
            <div
              className={`course-preview-hero${thumbnailUrl ? " has-thumb" : ""}`}
              style={
                thumbnailUrl
                  ? {
                      backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.5), rgba(15,169,88,0.45)), url(${thumbnailUrl})`,
                    }
                  : undefined
              }
            >
              <span>Course ID: {course.courseId || "Auto-generated"}</span>
            </div>

            <div className="course-preview-title-row">
              <div className="course-preview-icon">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="" />
                ) : (
                  <FaBook />
                )}
              </div>
              <div className="course-preview-title-text">
                <h1>{course.courseName || "Untitled Course"}</h1>
                <p>
                  {lessonsCount} lessons · {course.modules?.length || 0} modules
                  {course.courseDuration ? ` · ${course.courseDuration} hrs` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="course-preview-section">
            <h3>Description</h3>
            {isHtmlEmpty(course.courseDescription) ? (
              <p>No description added.</p>
            ) : (
              <RichTextContent html={course.courseDescription} />
            )}
          </div>

          <div className="course-preview-body">
            <aside className="course-preview-modules">
              <h3>Modules</h3>
              {(course.modules || []).map((mod, index) => (
                <button
                  key={mod.id || index}
                  type="button"
                  className={`course-preview-module-btn ${selectedModule === index ? "active" : ""}`}
                  onClick={() => {
                    setSelectedModule(index);
                    setExpandedSection(null);
                  }}
                >
                  <span>{mod.title || `Module ${index + 1}`}</span>
                  <small>{mod.sections?.length || 0} sections</small>
                </button>
              ))}
            </aside>

            <div className="course-preview-sections">
              <h3>{activeModule?.title || "Module"} — Sections</h3>
              {(activeModule?.sections || []).length === 0 && (
                <p className="course-preview-empty">No sections in this module.</p>
              )}
              {(activeModule?.sections || []).map((sec, sIndex) => {
                const sectionTitle = sec.sectionName || sec.title || `Section ${sIndex + 1}`;
                const isOpen = expandedSection === sIndex;

                return (
                  <div key={sec.id || sIndex} className="course-preview-section-card">
                    <button
                      type="button"
                      className="course-preview-section-toggle"
                      onClick={() => setExpandedSection(isOpen ? null : sIndex)}
                    >
                      <span>{sectionTitle}</span>
                      {isOpen ? <BiChevronUp /> : <BiChevronDown />}
                    </button>

                    {isOpen && (
                      <div className="course-preview-section-body">
                        <SectionDetails sec={sec} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="course-preview-footer">
          {viewOnly ? (
            <button type="button" className="course-preview-save-btn" onClick={onClose}>
              Close
            </button>
          ) : (
            <>
              <button type="button" className="course-preview-edit-btn" onClick={onClose} disabled={loading}>
                Edit
              </button>
              <button
                type="button"
                className="course-preview-save-btn"
                onClick={onConfirmSave}
                disabled={loading}
              >
                {loading
                  ? isEditMode
                    ? "Saving..."
                    : "Creating..."
                  : isEditMode
                    ? "Confirm & Save"
                    : "Confirm & Create"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePreviewModal;
