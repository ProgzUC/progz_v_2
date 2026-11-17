import React from "react";
import { BiX } from "react-icons/bi";
import "./CoursePreviewModal.css";
import StudentCoursePreviewView from "./StudentCoursePreviewView";

const CoursePreviewModal = ({
  course,
  isEditMode = false,
  loading = false,
  viewOnly = false,
  onClose,
  onConfirmSave,
}) => {
  if (!course) return null;

  return (
    <div
      className="course-preview-overlay course-preview-overlay--student"
      role="dialog"
      aria-modal="true"
    >
      <div className="course-preview-panel course-preview-panel--student">
        <div className="course-preview-topbar">
          <div>
            <p className="course-preview-eyebrow">Student Preview</p>
            <h2>
              {viewOnly
                ? "How students will see this course"
                : `Review before ${isEditMode ? "saving" : "creating"}`}
            </h2>
          </div>
          <button type="button" className="course-preview-close" onClick={onClose} aria-label="Close preview">
            <BiX />
          </button>
        </div>

        <div className="course-preview-scroll">
          <StudentCoursePreviewView course={course} />
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
