import React, { useState } from "react";
import { FaBook } from "react-icons/fa";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import "./CourseView.css";
import { useCourse } from "../../../hooks/useCourses";
import Loader from "../../../components/common/Loader/Loader";

const CourseView = ({ courseData, onBack, onEdit }) => {
  const courseId = courseData?._id || courseData?.courseId;
  const { data: fullCourse, isLoading, isError, error } = useCourse(courseId);

  const [selectedModule, setSelectedModule] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  if (isLoading) return <Loader message="Loading course details..." />;
  if (isError) return <div className="error-state">Error: {error?.message || "Failed to load course"}</div>;
  if (!fullCourse) return <div className="error-state">Course not found</div>;

  const course = fullCourse; // Use the fetched full details

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
  };

  // Calculate stats
  const lessonsCount = course.modules?.reduce((acc, mod) => acc + (mod.sections?.length || 0), 0) || 0;

  // Create formatted ID if not present
  const displayId = course.courseId ||
    (course._id ? `CRS-${(course.courseName || "GEN").substr(0, 3).toUpperCase().replace(/\s/g, '')}-001` : "N/A");

  const getViewUrl = (url, fileName) => {
    if (!url) return "#";
    const lowerUrl = url.toLowerCase();
    const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const isOfficeFile = officeExtensions.some(ext => lowerUrl.endsWith(ext) || lowerUrl.includes(`.${ext}?`));

    if (isOfficeFile) {
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
    }
    return url;
  };

  return (
    <div className="course-view-page">

      {/* HEADER SECTION */}
      <div className="cv-header-container">
        <div className="cv-header-bg">
          <span className="cv-header-id">Course ID: {displayId}</span>
        </div>

        <div className="cv-header-content">
          <div className="cv-icon-circle">
            <FaBook className="cv-book-icon" />
          </div>

          <div className="cv-title-block">
            <h1>{course.courseName}</h1>
            <div className="cv-meta-row">
              <span className="cv-lessons">{lessonsCount} lessons</span>
              <span className="cv-lessons">{course.modules?.length || 0} Modules</span>
            </div>
          </div>

          <button className="cv-edit-btn" onClick={onEdit}>
            Edit
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="cv-body-content">

        {/* DESCRIPTION */}
        <div className="cv-section-title">Course Description</div>
        <div className="cv-description-box">
          {course.courseDescription || "No description available."}
        </div>

        {/* MOBILE: Accordion - sections open below the module list */}
        <div className="cv-mobile-accordion">
          <div className="cv-column-header">
            <span>Module</span>
          </div>
          {course.modules?.map((mod, index) => (
            <div key={`mobile-${index}`} className="cv-mobile-module-block">
              <div
                className={`cv-list-item ${selectedModule === index ? 'active' : ''}`}
                onClick={() => handleModuleClick(index)}
              >
                <span>{mod.title}</span>
                {selectedModule === index ? (
                  <BiChevronUp className="cv-list-icon" />
                ) : (
                  <BiChevronDown className="cv-list-icon" />
                )}
              </div>
              {selectedModule === index && (
                <div className="cv-mobile-sections-inner">
                  <div className="cv-column-header cv-mobile-sections-header">
                    <span>Sections</span>
                  </div>
                  {mod.sections && mod.sections.length > 0 ? (
                    <div className="cv-list">
                      {mod.sections.map((sec, idx) => (
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
                          {expandedSection === idx && (
                            <div className="cv-section-details">
                              {sec.learningMaterialNotes && (
                                <div className="cv-detail-block">
                                  <h4>Notes:</h4>
                                  <p>{sec.learningMaterialNotes}</p>
                                </div>
                              )}
                              {sec.learningMaterialFile && sec.learningMaterialFile.length > 0 && (
                                <div className="cv-detail-block">
                                  <h4>Materials:</h4>
                                  <ul className="cv-file-list">
                                    {sec.learningMaterialFile.map((file, i) => (
                                      <li key={i} className="cv-file-item">
                                        <span className="cv-file-name">
                                          <i className="bi bi-file-earmark-text"></i> {file.originalName || "Material"}
                                        </span>
                                        <div className="cv-file-actions">
                                          <a href={getViewUrl(file.url, file.originalName)} target="_blank" rel="noopener noreferrer" className="cv-action-icon view" title="View">
                                            <i className="bi bi-box-arrow-up-right"></i>
                                          </a>
                                          <a href={file.url} download={file.originalName} className="cv-action-icon download" title="Download">
                                            <i className="bi bi-download"></i>
                                          </a>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
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
                              {(sec.codeChallengeInstructions || (sec.codeChallengeFile && sec.codeChallengeFile.length > 0)) && (
                                <div className="cv-detail-block challenge-block">
                                  <h4>Code Challenge:</h4>
                                  {sec.codeChallengeInstructions && <p>{sec.codeChallengeInstructions}</p>}
                                  {sec.codeChallengeFile && sec.codeChallengeFile.length > 0 && (
                                    <ul className="cv-file-list">
                                      {sec.codeChallengeFile.map((file, i) => (
                                        <li key={i} className="cv-file-item">
                                          <span className="cv-file-name">
                                            <i className="bi bi-code-square"></i> {file.originalName || "Challenge"}
                                          </span>
                                          <div className="cv-file-actions">
                                            <a href={getViewUrl(file.url, file.originalName)} target="_blank" rel="noopener noreferrer" className="cv-action-icon view" title="View">
                                              <i className="bi bi-box-arrow-up-right"></i>
                                            </a>
                                            <a href={file.url} download={file.originalName} className="cv-action-icon download" title="Download">
                                              <i className="bi bi-download"></i>
                                            </a>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                              {!sec.learningMaterialNotes && (!sec.learningMaterialFile || sec.learningMaterialFile.length === 0) && (!sec.videoReferences || sec.videoReferences.length === 0) && !sec.codeChallengeInstructions && (!sec.codeChallengeFile || sec.codeChallengeFile.length === 0) && (
                                <div className="cv-detail-empty">No content in this section.</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="cv-empty-state">No sections in this module</div>
                  )}
                </div>
              )}
            </div>
          ))}
          {(!course.modules || course.modules.length === 0) && (
            <div className="cv-empty-state">No modules found</div>
          )}
        </div>

        {/* DESKTOP: Two columns */}
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
              {(!course.modules || course.modules.length === 0) && (
                <div className="cv-empty-state">No modules found</div>
              )}
            </div>
          </div>

          {/* SECTIONS COLUMN */}
          <div className="cv-column">
            <div className="cv-column-header">
              <span>Sections</span>
            </div>

            {selectedModule !== null && course.modules?.[selectedModule] ? (
              <div className="cv-list">
                {course.modules[selectedModule].sections && course.modules[selectedModule].sections.length > 0 ? (
                  course.modules[selectedModule].sections.map((sec, idx) => (
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
                                  <li key={i} className="cv-file-item">
                                    <span className="cv-file-name">
                                      <i className="bi bi-file-earmark-text"></i> {file.originalName || "Material"}
                                    </span>
                                    <div className="cv-file-actions">
                                      <a href={getViewUrl(file.url, file.originalName)} target="_blank" rel="noopener noreferrer" className="cv-action-icon view" title="View">
                                        <i className="bi bi-box-arrow-up-right"></i>
                                      </a>
                                      <a href={file.url} download={file.originalName} className="cv-action-icon download" title="Download">
                                        <i className="bi bi-download"></i>
                                      </a>
                                    </div>
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
                                    <li key={i} className="cv-file-item">
                                      <span className="cv-file-name">
                                        <i className="bi bi-code-square"></i> {file.originalName || "Challenge"}
                                      </span>
                                      <div className="cv-file-actions">
                                        <a href={getViewUrl(file.url, file.originalName)} target="_blank" rel="noopener noreferrer" className="cv-action-icon view" title="View">
                                          <i className="bi bi-box-arrow-up-right"></i>
                                        </a>
                                        <a href={file.url} download={file.originalName} className="cv-action-icon download" title="Download">
                                          <i className="bi bi-download"></i>
                                        </a>
                                      </div>
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
                  ))
                ) : (
                  <div className="cv-empty-state">No sections in this module</div>
                )}
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
          <button type="button" className="trainer-back-btn" onClick={onBack}>
            <span className="trainer-back-btn-circle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            </span>
            <span className="trainer-back-btn-label">Back to Courses</span>
          </button>
        </div>

      </div>

    </div>
  );
};

export default CourseView;
