import React, { useMemo, useState } from "react";
import { BiBook } from "react-icons/bi";
import Introduction from "../../../pagesStudent/components/Introduction/Introduction";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import "../../../pagesStudent/components/mycourses/CourseCard.css";
import "./StudentCoursePreviewView.css";

const getThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return null;
  if (typeof thumbnail === "string") return thumbnail;
  if (thumbnail.url) return thumbnail.url;
  if (thumbnail instanceof File) return URL.createObjectURL(thumbnail);
  return null;
};

const fileToPreviewObject = (file) => {
  if (!file) return null;
  if (typeof file === "string") return { url: file, name: file.split("/").pop() || "File" };
  if (file instanceof File) {
    return {
      url: URL.createObjectURL(file),
      name: file.name,
      originalName: file.name,
    };
  }
  return {
    url: file.url,
    name: file.originalName || file.name || file.fileName || "File",
    originalName: file.originalName || file.name || file.fileName,
  };
};

/** Normalize admin/trainer section shape → student Introduction shape */
export const normalizeSectionForStudent = (sec) => {
  if (!sec) return null;

  const materials = [
    ...(sec.learningMaterialFile || []),
    ...(sec.learningMaterialFiles || []),
    ...(sec.savedMaterialFiles || []),
    ...(sec.materialFiles || []),
  ]
    .map(fileToPreviewObject)
    .filter(Boolean);

  const challenges = [
    ...(sec.codeChallengeFile || []),
    ...(sec.codeChallengeFiles || []),
    ...(sec.savedChallengeFiles || []),
    ...(sec.challengeFiles || []),
  ]
    .map(fileToPreviewObject)
    .filter(Boolean);

  const videos = sec.videoReferences || sec.videos || [];

  return {
    sectionName: sec.sectionName || sec.title || "Lesson",
    title: sec.sectionName || sec.title || "Lesson",
    learningMaterialNotes: sec.learningMaterialNotes || sec.notes || "",
    learningMaterialFile: materials,
    codeChallengeInstructions: sec.codeChallengeInstructions || sec.challengeInstructions || "",
    codeChallengeFile: challenges,
    videoReferences: videos,
  };
};

function PreviewLargeCard({ course, lessonsCount }) {
  const thumb = getThumbnailUrl(course?.thumbnail);

  return (
    <div className="large-card premium-shadow student-preview-large-card">
      <div className="large-thumb-container">
        <ImageWithFallback
          src={thumb}
          alt={course?.courseName || "Course"}
          className="large-thumb"
          fallbackText={course?.courseName || "Course"}
        />
        <div className="large-badge">Student Preview</div>
      </div>

      <div className="large-content">
        <p className="large-title">{course?.courseName || "Untitled Course"}</p>
        <p className="large-batch-info">
          {course?.courseDuration ? `${course.courseDuration} hrs` : "Self-paced"}
          {" · "}
          {course?.modules?.length || 0} modules
        </p>

        <div className="large-progress-section">
          <div className="progress-info-row">
            <span className="progress-label">Course Progress</span>
            <span className="progress-value">0%</span>
          </div>
          <div className="large-progress-bar">
            <div className="large-progress-fill" style={{ width: "0%" }} />
          </div>
        </div>

        <div className="large-lessons-summary">
          <BiBook className="lesson-icon" />
          <span>
            <strong>0</strong> of {lessonsCount} Lessons Completed
          </span>
        </div>
      </div>
    </div>
  );
}

function PreviewCurriculum({ modules, onOpenLesson }) {
  const [expandedModuleIdx, setExpandedModuleIdx] = useState(0);

  if (!modules?.length) {
    return <p className="student-preview-empty">No modules available for this course yet.</p>;
  }

  return (
    <div className="course-curriculum-container">
      <p className="curriculum-main-title">Course Curriculum</p>

      <div className="curriculum-accordion">
        {modules.map((module, mIdx) => {
          const isExpanded = expandedModuleIdx === mIdx;
          const lessonCount = module.sections?.length || 0;

          return (
            <div key={module.id || mIdx} className={`module-accordion-item ${isExpanded ? "active" : ""}`}>
              <button
                type="button"
                className="module-header"
                onClick={() => setExpandedModuleIdx(isExpanded ? -1 : mIdx)}
                aria-expanded={isExpanded}
              >
                <div className="module-header-left">
                  <i className={`bi bi-chevron-down accordion-icon ${isExpanded ? "expanded" : ""}`} />
                  <span className="module-title">{module.moduleName || module.title || `Module ${mIdx + 1}`}</span>
                </div>
                <span className="module-meta">
                  {lessonCount} {lessonCount === 1 ? "Lesson" : "Lessons"}
                </span>
              </button>

              <div
                className="module-body"
                style={{
                  maxHeight: isExpanded ? "2000px" : "0",
                  opacity: isExpanded ? 1 : 0,
                }}
              >
                <div className="module-lessons-list">
                  {(module.sections || []).map((section, sIdx) => {
                    const sectionTitle = section.sectionName || section.title || `Lesson ${sIdx + 1}`;
                    return (
                      <div key={section.id || sIdx} className="lesson-row">
                        <div className="lesson-number">{sIdx + 1}</div>
                        <div className="lesson-title">{sectionTitle}</div>
                        <div className="lesson-action">
                          <button
                            type="button"
                            className="open-btn"
                            onClick={() => onOpenLesson(section, module)}
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StudentCoursePreviewView({ course }) {
  const [viewLesson, setViewLesson] = useState(null);
  const [activeModuleName, setActiveModuleName] = useState("");

  const lessonsCount = useMemo(
    () => course?.modules?.reduce((acc, mod) => acc + (mod.sections?.length || 0), 0) || 0,
    [course?.modules]
  );

  if (!course) return null;

  if (viewLesson) {
    return (
      <div className="student-mycourses-page student-course-preview-view">
        <div className="lesson-content-view">
          <button
            type="button"
            className="jc-back-btn mb-4"
            onClick={() => {
              setViewLesson(null);
              setActiveModuleName("");
            }}
          >
            <div className="back-icon-circle">
              <i className="bi bi-arrow-left" />
            </div>
            <span>Back to Course</span>
          </button>
          <Introduction
            sectionData={viewLesson}
            courseName={course.courseName || "Course"}
            moduleName={activeModuleName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="student-mycourses-page student-course-preview-view">
      <PreviewLargeCard course={course} lessonsCount={lessonsCount} />
      <PreviewCurriculum
        modules={course.modules || []}
        onOpenLesson={(section, module) => {
          setActiveModuleName(module.moduleName || module.title || "");
          setViewLesson(normalizeSectionForStudent(section));
        }}
      />
    </div>
  );
}
