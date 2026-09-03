import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateCourse.css";
import "../../../components/common/ModuleNavigator/ModuleNavigator.css";
import { uploadToCloudinary } from "../../../utils/cloudinary";
import { createCourse } from "../../../api/courseApi";
import { confirmDelete } from "../../../utils/confirmDelete";
import { promptInput } from "../../../utils/promptInput";
import { showSuccess, showError, showWarning } from "../../../utils/toast";
import Loader from "../../../components/common/Loader/Loader";
import CourseCurriculumEditor from "./CourseCurriculumEditor";
import ModuleNavigator from "../../../components/common/ModuleNavigator/ModuleNavigator";
import CoursePreviewModal from "../../../components/common/CoursePreviewModal/CoursePreviewModal";
import RichTextEditor from "../../../components/common/RichTextEditor/RichTextEditor";
import { isHtmlEmpty } from "../../../components/common/RichTextEditor/richTextUtils";
import { COURSE_FILE_ACCEPT } from "../../../utils/fileDrop";
import {
  createEmptyModule,
  createEmptySection,
} from "../../../utils/courseBuilder";
import CourseTitleModal from "../../../components/common/CourseBuilder/CourseTitleModal";
import CourseBuilderShell from "../../../components/common/CourseBuilder/CourseBuilderShell";
import CourseInformationPanel from "../../../components/common/CourseBuilder/CourseInformationPanel";
import "../../../components/common/CourseBuilder/CourseBuilder.css";

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [builderStarted, setBuilderStarted] = useState(false);
  const [activeStep, setActiveStep] = useState("information");
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [lightbox, setLightbox] = useState({ isOpen: false, type: "", src: "" });

  const validateInformation = () => {
    if (!validateForm()) {
      showWarning("Please fill all required fields correctly.");
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showWarning("Please fill all required fields correctly.");
      return;
    }
    setLoading(true);
    try {
      // 1. Thumbnail (single)
      let thumbnailData = null;
      if (course.thumbnail instanceof File) {
        thumbnailData = await uploadToCloudinary(
          course.thumbnail,
          "courses/thumbnails"
        );
      }

      // 2. Modules & Sections
      const processedModules = await Promise.all(
        course.modules.map(async (mod) => {
          const processedSections = await Promise.all(
            mod.sections.map(async (sec) => {
              // Upload multiple learning materials
              const materialUploads = await Promise.all(
                (sec.materialFiles || []).map((f) =>
                  uploadToCloudinary(f, "courses/materials")
                )
              );

              // Upload multiple challenge files
              const challengeUploads = await Promise.all(
                (sec.challengeFiles || []).map((f) =>
                  uploadToCloudinary(f, "courses/challenges")
                )
              );

              return {
                sectionName: sec.title,
                lessonType: sec.lessonType,
                learningMaterialNotes: sec.notes,
                learningMaterialFile: materialUploads, // ARRAY
                codeChallengeInstructions: sec.challengeInstructions,
                codeChallengeFile: challengeUploads,   // ARRAY
                videoReferences: sec.videos,
              };
            })
          );

          return {
            title: mod.title,
            sections: processedSections,
          };
        })
      );

      const payload = {
        courseName: course.courseName,
        courseId: course.courseId,
        courseDescription: course.courseDescription,
        courseDuration: Number(course.courseDuration),
        thumbnail: thumbnailData
          ? { url: thumbnailData.url, publicId: thumbnailData.publicId }
          : null,
        modules: processedModules,
      };

      await createCourse(payload);

      showSuccess("Course created successfully!");
      setShowPreview(false);
      navigate("/admin/courses");
    } catch (err) {
      console.error(err);
      showError(err.message || "Upload failed");
      } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!builderStarted && (
        <CourseTitleModal
          onContinue={handleTitleContinue}
          onClose={() => navigate("/admin/courses")}
        />
      )}

      {builderStarted && (
        <CourseBuilderShell
          activeStep={activeStep}
          onStepChange={handleStepChange}
          courseName={course.courseName}
          footer={
            <div className="step-footer">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/admin/courses")}
                disabled={loading}
              >
                Cancel
              </button>
              {activeStep === "information" ? (
                <button
                  type="button"
                  className="submit-btn"
                  onClick={() => handleStepChange("curriculum")}
                  disabled={loading}
                >
                  Continue to Curriculum
                </button>
              ) : (
                <button
                  type="button"
                  className="submit-btn"
                  onClick={handlePreview}
                  disabled={loading}
                >
                  Preview & Create
                </button>
              )}
            </div>
          }
        >
          {loading && <Loader />}

          {activeStep === "information" && (
            <div className="admin-create-course-page course-info-wrap">
              <CourseInformationPanel
                course={course}
                errors={errors}
                updateField={updateField}
                setErrors={setErrors}
                onThumbnailPreview={(src) => openLightbox("image", src)}
              />
            </div>
          )}

          {activeStep === "curriculum" && (
            <CourseCurriculumEditor 
              course={course} 
              setCourse={setCourse} 
              errors={errors} 
              setErrors={setErrors} 
              openLightbox={openLightbox} 
            />
          )}
        </CourseBuilderShell>
      )}

      {showPreview && (
        <CoursePreviewModal
          course={course}
          loading={loading}
          onClose={() => setShowPreview(false)}
          onConfirmSave={handleSubmit}
        />
      )}

      {/* LIGHTBOX MODAL */}
      {lightbox.isOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <i className="bi bi-x-lg lightbox-close" onClick={closeLightbox}></i>
            {lightbox.type === "image" && (
              <img src={lightbox.src} alt="Full Preview" className="lightbox-image" />
            )}
            {lightbox.type === "video" && (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${lightbox.src}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCourse;
