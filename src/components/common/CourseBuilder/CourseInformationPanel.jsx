import React from "react";
import FileDropZone from "../FileDropZone/FileDropZone";
import RichTextEditor from "../RichTextEditor/RichTextEditor";

export default function CourseInformationPanel({
  course,
  errors,
  updateField,
  onThumbnailPreview,
  setErrors,
}) {
  const thumbnailSrc =
    course.thumbnail instanceof File
      ? URL.createObjectURL(course.thumbnail)
      : course.thumbnail?.url;

  return (
    <>
      <div className="input-grid">
        <div>
          <label>Course Name</label>
          <input
            value={course.courseName}
            onChange={(e) => updateField("courseName", e.target.value)}
            placeholder="e.g. Advanced React"
          />
          {errors.courseName && <span className="error-text">{errors.courseName}</span>}
        </div>

        <div>
          <label>Duration (Hours)</label>
          <input
            type="number"
            value={course.courseDuration}
            onChange={(e) => updateField("courseDuration", e.target.value)}
            placeholder="e.g. 40"
          />
          {errors.courseDuration && <span className="error-text">{errors.courseDuration}</span>}
        </div>
      </div>

      <div className="input-full">
        <label>Course Description</label>
        <RichTextEditor
          value={course.courseDescription}
          onChange={(html) => updateField("courseDescription", html)}
          placeholder="Describe the course content..."
        />
        {errors.courseDescription && <span className="error-text">{errors.courseDescription}</span>}
      </div>

      <div className="input-full">
        <label>Thumbnail Image</label>
        <FileDropZone
            accept="image/*"
            hint="Drag image from Google or your computer"
            error={errors.thumbnail}
            onFiles={(file) => {
              updateField("thumbnail", file);
              if (errors.thumbnail) setErrors((prev) => ({ ...prev, thumbnail: null }));
            }}
          >
            {course.thumbnail && thumbnailSrc && (
              <div className="file-preview-list">
                <div className="file-preview-media">
                  <span
                    className="remove-file-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateField("thumbnail", null);
                    }}
                  >
                    ×
                  </span>
                  <div className="image-preview-wrapper" onClick={() => onThumbnailPreview(thumbnailSrc)}>
                    <img src={thumbnailSrc} className="preview-image-consistent" alt="Preview" />
                  </div>
                  {course.thumbnail instanceof File && (
                    <p className="file-name-media" title={course.thumbnail.name}>
                      {course.thumbnail.name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </FileDropZone>
      </div>
    </>
  );
}
