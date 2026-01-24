import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaBook } from "react-icons/fa";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import "./CourseView.css";

import { useCourse } from "../../../hooks/useCourses";
import Loader from "../../../components/common/Loader/Loader";

const CourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const { data: course, isLoading, isError, error } = useCourse(id);

  if (isLoading) return <Loader />;
  if (isError) return <div className="error-state">Error: {error?.message}</div>;
  if (!course) return <div className="error-state">Course not found</div>;

  const handleModuleClick = (moduleId) => {
    if (selectedModule === moduleId) {
      setSelectedModule(null);
    } else {
      setSelectedModule(moduleId);
    }
    setExpandedSection(null); // Reset section selection when module changes
  };

  const toggleSection = (idx) => {
    setExpandedSection(expandedSection === idx ? null : idx);
  }

  // Calculate stats if needed
  const lessonsCount = course.modules?.reduce((acc, mod) => acc + (mod.sections?.length || 0), 0) || 0;
  const progress = 0; // Backend doesn't seem to provide progress yet for admin view, defaulting to 0 or remove.

  return (
    <div className="course-view-page">

      {/* HEADER SECTION */}
      <div className="cv-header-container">
        <div className="cv-header-bg">
          <span className="cv-header-id">Course ID: {course.courseId}</span>
        </div>

        <div className="cv-header-content">
          <div className="cv-icon-circle">
            <FaBook className="cv-book-icon" />
          </div>

          <div className="cv-title-block">
            <h1>{course.courseName}</h1>
            <div className="cv-meta-row">
              <span className="cv-lessons">{lessonsCount} lessons</span>
              {/* <div className="cv-progress-container">
                <div className="cv-progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="cv-progress-text">{progress}%</span> */}
            </div>
          </div>

          <button className="cv-edit-btn" onClick={() => navigate(`/admin/edit-course/${id}`)}>
            Edit
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="cv-body-content">

        {/* DESCRIPTION */}
        <div className="cv-section-title">Course Description</div>
        <div className="cv-description-box">{course.courseDescription}</div>

        {/* COLUMNS */}
        <div className="cv-columns-grid">

          {/* MODULES COLUMN */}
          <div className="cv-column">
            <div className="cv-column-header">
              <span>Module</span>
            </div>

            <div className="cv-list">
              {course.modules?.map((mod, index) => (
                <div
                  className={`cv-list-item ${selectedModule === index ? 'active' : ''}`}
                  key={index}
                  onClick={() => handleModuleClick(index)}
                >
                  <span>{mod.title}</span>
                  {selectedModule === index ? (
                    <BiChevronUp className="cv-list-icon" />
                  ) : (
                    <BiChevronDown className="cv-list-icon" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTIONS COLUMN */}
          <div className="cv-column">
            <div className="cv-column-header">
              <span>Sections</span>
            </div>

            {selectedModule !== null && course.modules?.[selectedModule] ? (
              <div className="cv-list">
                {course.modules[selectedModule].sections?.map((sec, idx) => (
                  <div key={idx} className="cv-section-wrapper">
                    <div
                      className={`cv-list-item ${expandedSection === idx ? 'active' : ''}`}
                      onClick={() => toggleSection(idx)}
                    >
                      <span>{sec.sectionName}</span>
                      {expandedSection === idx ? (
                        <BiChevronUp className="cv-list-icon" />
                      ) : (
                        <BiChevronDown className="cv-list-icon" />
                      )}
                    </div>

                    {/* EXPANDED SECTION DETAILS */}
                    {expandedSection === idx && (
                      <div className="cv-section-details">
                        {/* Learning Material Notes */}
                        {sec.learningMaterialNotes && (
                          <div className="cv-detail-block">
                            <h4>Notes:</h4>
                            <p>{sec.learningMaterialNotes}</p>
                          </div>
                        )}

                        {/* Learning Material Files */}
                        {sec.learningMaterialFile && sec.learningMaterialFile.length > 0 && (
                          <div className="cv-detail-block">
                            <h4>Materials:</h4>
                            <ul className="cv-file-list">
                              {sec.learningMaterialFile.map((file, i) => (
                                <li key={i}>
                                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                                    <i className="bi bi-file-earmark-text"></i> {file.originalName || "Download File"}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Video References */}
                        {sec.videoReferences && sec.videoReferences.length > 0 && (
                          <div className="cv-detail-block">
                            <h4>Videos:</h4>
                            <ul className="cv-video-list">
                              {sec.videoReferences.map((vid, i) => (
                                <li key={i}>
                                  <a href={vid} target="_blank" rel="noopener noreferrer">
                                    <i className="bi bi-play-circle"></i> {vid}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Code Challenge */}
                        {(sec.codeChallengeInstructions || (sec.codeChallengeFile && sec.codeChallengeFile.length > 0)) && (
                          <div className="cv-detail-block challenge-block">
                            <h4>Code Challenge:</h4>
                            {sec.codeChallengeInstructions && <p>{sec.codeChallengeInstructions}</p>}

                            {sec.codeChallengeFile && sec.codeChallengeFile.length > 0 && (
                              <ul className="cv-file-list">
                                {sec.codeChallengeFile.map((file, i) => (
                                  <li key={i}>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                      <i className="bi bi-code-square"></i> {file.originalName || "Challenge File"}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}

                        {/* Empty State if nothing */}
                        {!sec.learningMaterialNotes && (!sec.learningMaterialFile || sec.learningMaterialFile.length === 0) && (!sec.videoReferences || sec.videoReferences.length === 0) && !sec.codeChallengeInstructions && (!sec.codeChallengeFile || sec.codeChallengeFile.length === 0) && (
                          <div className="cv-detail-empty">No content in this section.</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="cv-empty-state">
                Select a module to view sections
              </div>
            )}
          </div>

        </div>

        {/* FOOTER ACTION */}
        <div className="cv-footer">
          <button className="cv-back-btn" onClick={() => navigate(-1)}>Back</button>
        </div>

      </div>

    </div>
  );
};

export default CourseView;
