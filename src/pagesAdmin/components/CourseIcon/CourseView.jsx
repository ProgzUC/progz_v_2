import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaBook } from "react-icons/fa";
import { BiChevronRight, BiChevronLeft } from "react-icons/bi";
import "./CourseView.css";
import RichTextContent from "../../../components/common/RichTextEditor/RichTextContent";
import { isHtmlEmpty } from "../../../components/common/RichTextEditor/richTextUtils";
import SectionDetails from "../../../components/common/CourseCurriculum/SectionDetails";
import CoursePreviewModal from "../../../components/common/CoursePreviewModal/CoursePreviewModal";

import { useCourse } from "../../../hooks/useCourses";
import Loader from "../../../components/common/Loader/Loader";

const CourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data: course, isLoading, isError, error } = useCourse(id);

  if (isLoading) return <Loader />;
  if (isError) return <div className="error-state">Error: {error?.message}</div>;
  if (!course) return <div className="error-state">Course not found</div>;

  const handleModuleClick = (moduleId) => {
    setSelectedModule(moduleId);
    setExpandedSection(null);
  };

  const backToModules = () => {
    setSelectedModule(null);
    setExpandedSection(null);
  };

  const backToSections = () => {
    setExpandedSection(null);
  };

  const lessonsCount = course.modules?.reduce((acc, mod) => acc + (mod.sections?.length || 0), 0) || 0;
  const thumbnailUrl = course.thumbnail?.url || null;
  const activeModule = selectedModule !== null ? course.modules?.[selectedModule] : null;
  const activeSection =
    expandedSection !== null && activeModule ? activeModule.sections?.[expandedSection] : null;

  return (
    <div className="course-view-page">

      <div className="cv-header-container">
        <div
          className={`cv-header-bg${thumbnailUrl ? " has-thumbnail" : ""}`}
          style={
            thumbnailUrl
              ? {
                  backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 50%, rgba(16,185,129,0.55) 100%), url(${thumbnailUrl})`,
                }
              : undefined
          }
        >
          <span className="cv-header-id">Course ID: {course.courseId}</span>
        </div>

        <div className="cv-header-content">
          <div className="cv-icon-circle">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="" className="cv-icon-thumb" />
            ) : (
              <FaBook className="cv-book-icon" />
            )}
          </div>

          <div className="cv-title-block">
            <h1>{course.courseName}</h1>
            <div className="cv-meta-row">
              <span className="cv-lessons">{lessonsCount} lessons</span>
            </div>
          </div>

          <div className="cv-header-actions">
            <button type="button" className="cv-preview-btn" onClick={() => setShowPreview(true)}>
              Preview
            </button>
            <button className="cv-edit-btn" onClick={() => navigate(`/admin/edit-course/${id}`)}>
              Edit
            </button>
          </div>
        </div>
      </div>

      <div className="cv-body-content">

        <div className="cv-section-title">Course Description</div>
        <div className="cv-description-box">
          {isHtmlEmpty(course.courseDescription) ? (
            "No description available."
          ) : (
            <RichTextContent html={course.courseDescription} />
          )}
        </div>

        <div className="cv-curriculum">
          <div className="cv-column-header">
            <span>Curriculum</span>
            <button type="button" className="cv-preview-link" onClick={() => setShowPreview(true)}>
              Full preview
            </button>
          </div>

          {(!course.modules || course.modules.length === 0) && (
            <div className="cv-empty-state">No modules found</div>
          )}

          {selectedModule === null && (
            <div className="cv-drill-list">
              {course.modules?.map((mod, index) => (
                <button
                  key={index}
                  type="button"
                  className="cv-module-toggle"
                  onClick={() => handleModuleClick(index)}
                >
                  <div className="cv-module-toggle-left">
                    <span className="cv-module-index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="cv-module-toggle-text">
                      <span className="cv-module-title">{mod.title}</span>
                      <span className="cv-module-meta">
                        {mod.sections?.length || 0} section{(mod.sections?.length || 0) === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  <BiChevronRight className="cv-list-icon" />
                </button>
              ))}
            </div>
          )}

          {selectedModule !== null && expandedSection === null && activeModule && (
            <div className="cv-drill-panel">
              <button type="button" className="cv-drill-back" onClick={backToModules}>
                <BiChevronLeft /> All modules
              </button>

              <div className="cv-active-topic">
                <span className="cv-module-index">{String(selectedModule + 1).padStart(2, "0")}</span>
                <div className="cv-module-toggle-text">
                  <span className="cv-module-title">{activeModule.title}</span>
                  <span className="cv-module-meta">
                    {activeModule.sections?.length || 0} section{(activeModule.sections?.length || 0) === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              {activeModule.sections && activeModule.sections.length > 0 ? (
                <div className="cv-drill-list">
                  {activeModule.sections.map((sec, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="cv-section-toggle"
                      onClick={() => setExpandedSection(idx)}
                    >
                      <span>{sec.sectionName}</span>
                      <BiChevronRight className="cv-list-icon" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="cv-empty-state">No sections in this module</div>
              )}
            </div>
          )}

          {selectedModule !== null && expandedSection !== null && activeSection && (
            <div className="cv-drill-panel">
              <button type="button" className="cv-drill-back" onClick={backToSections}>
                <BiChevronLeft /> {activeModule?.title || "Sections"}
              </button>

              <div className="cv-section-card open">
                <div className="cv-section-toggle active">
                  <span>{activeSection.sectionName}</span>
                </div>
                <div className="cv-section-details">
                  <SectionDetails sec={activeSection} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="cv-footer">
          <button className="cv-back-btn" onClick={() => navigate(-1)}>Back</button>
        </div>

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
