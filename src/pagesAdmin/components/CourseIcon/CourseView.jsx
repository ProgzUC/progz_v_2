import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaBook } from "react-icons/fa";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import "./CourseView.css";

const CourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState(null);

  // Mock Data with modules containing sections
  const course = {
    title: "RPA",
    courseId: "CRS-RPA-001",
    lessonsCount: 4,
    progress: 65,
    modules: [
      {
        id: 0,
        name: "Module - 1",
        sections: [
          { name: "Section - 1" },
          { name: "Section - 2" },
          { name: "Section - 3" },
        ]
      },
      {
        id: 1,
        name: "Module - 2",
        sections: [
          { name: "Section - 1" },
          { name: "Section - 2" },
          { name: "Section - 3" },
          { name: "Section - 4" },
        ]
      },
      {
        id: 2,
        name: "Module - 3",
        sections: [
          { name: "Section - 1" },
          { name: "Section - 2" },
        ]
      },
    ]
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

          <button className="cv-edit-btn" onClick={() => navigate(`/admin/edit-course/${id}`)}>
            Edit
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="cv-body-content">

        {/* DESCRIPTION */}
        <div className="cv-section-title">Course Description</div>
        <div className="cv-description-box"></div>

        {/* COLUMNS */}
        <div className="cv-columns-grid">

          {/* MODULES COLUMN */}
          <div className="cv-column">
            <div className="cv-column-header">
              <span>Module</span>
            </div>

            <div className="cv-list">
              {course.modules.map((mod) => (
                <div
                  className={`cv-list-item ${selectedModule === mod.id ? 'active' : ''}`}
                  key={mod.id}
                  onClick={() => handleModuleClick(mod.id)}
                >
                  <span>{mod.name}</span>
                  {selectedModule === mod.id ? (
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
                {course.modules[selectedModule].sections.map((sec, idx) => (
                  <div className="cv-list-item" key={idx}>
                    <span>{sec.name}</span>
                    <BiChevronDown className="cv-list-icon" />
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
