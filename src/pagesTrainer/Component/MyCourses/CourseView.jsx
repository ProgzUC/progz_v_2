import React, { useState } from "react";

import { FaBook } from "react-icons/fa";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import "./CourseView.css";

const CourseView = ({ courseData, onBack, onEdit }) => {
  const [selectedModule, setSelectedModule] = useState(null);

  // Helper to generate dummy modules
  const generateModules = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Module - ${i + 1}`,
      sections: [
        { name: "Introduction" },
        { name: "Core Concepts" },
        { name: "Practical Application" },
        { name: "Summary & Quiz" },
      ]
    }));
  };

  // Determine what modules to show
  // 1. If courseData.modules is an array, use it directly.
  // 2. If it's a number, generate that many dummy modules.
  // 3. Otherwise, fall back to a default set of 3 modules.
  let modulesToRender = [];
  if (Array.isArray(courseData?.modules)) {
    modulesToRender = courseData.modules;
  } else if (typeof courseData?.modules === 'number') {
    modulesToRender = generateModules(courseData.modules);
  } else {
    modulesToRender = generateModules(4); // Default to 4 if nothing provided
  }

  // Create formatted ID
  const formattedId = courseData?.courseId ||
    (courseData?.id
      ? `CRS-${(courseData?.title || "GEN").substr(0, 3).toUpperCase().replace(/\s/g, '')}-00${courseData.id}`
      : "CRS-RPA-001");

  // Merge passed data with safe defaults
  const course = {
    title: courseData?.title || "RPA",
    courseId: formattedId,
    lessonsCount: modulesToRender.length * 4, // estimate
    progress: courseData?.progress || 0,
    description: courseData?.description || "This course covers the fundamentals and advanced topics necessary to master the subject. Click on modules below to expand details.",
    modules: modulesToRender
  };

  const handleModuleClick = (moduleId) => {
    setSelectedModule(selectedModule === moduleId ? null : moduleId);
  };

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
            <h1>{course.title}</h1>
            <div className="cv-meta-row">
              <span className="cv-lessons">{course.lessonsCount} lessons</span>
              <div className="cv-progress-container">
                <div className="cv-progress-bar" style={{ width: `${course.progress}%` }}></div>
              </div>
              <span className="cv-progress-text">{course.progress}%</span>
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
          {course.description ? <p style={{ padding: '20px', color: '#666' }}>{course.description}</p> : null}
        </div>

        {/* COLUMNS */}
        <div className="cv-columns-grid">

          {/* MODULES COLUMN */}
          <div className="cv-column">
            <div className="cv-column-header">
              <span>Module</span>
            </div>

            <div className="cv-list">
              {course.modules.map((mod, index) => (
                <div
                  className={`cv-list-item ${selectedModule === (mod.id ?? index) ? 'active' : ''}`}
                  key={mod.id ?? index}
                  onClick={() => handleModuleClick(mod.id ?? index)}
                >
                  <span>{mod.name || `Module - ${index + 1}`}</span>
                  {selectedModule === (mod.id ?? index) ? (
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

            {selectedModule !== null ? (
              <div className="cv-list">
                {/* Find the module by matching id or index */}
                {(() => {
                  const activeMod = course.modules.find((m, i) => (m.id ?? i) === selectedModule);
                  const sections = activeMod?.sections || [];

                  return sections.length > 0 ? (
                    sections.map((sec, idx) => (
                      <div className="cv-list-item" key={idx}>
                        <span>{sec.name}</span>
                        <BiChevronDown className="cv-list-icon" />
                      </div>
                    ))
                  ) : (
                    <div className="cv-empty-state">No sections available</div>
                  );
                })()}
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
          <button className="cv-back-btn" onClick={onBack}>Back</button>
        </div>

      </div>

    </div>
  );
};

export default CourseView;
