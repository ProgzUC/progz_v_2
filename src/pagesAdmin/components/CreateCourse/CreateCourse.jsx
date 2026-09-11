import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateCourse.css";
import { useCreateCourse } from "../../../hooks/useCourses";
import { showSuccess, showError, showWarning } from "../../../utils/toast";
import { getErrorMessage } from "../../../utils/apiError";
import Loader from "../../../components/common/Loader/Loader";
import CourseCurriculumEditor from "./CourseCurriculumEditor";
import CoursePreviewModal from "../../../components/common/CoursePreviewModal/CoursePreviewModal";
import CourseTitleModal from "../../../components/common/CourseBuilder/CourseTitleModal";
import CourseBuilderShell from "../../../components/common/CourseBuilder/CourseBuilderShell";
import CourseInformationPanel from "../../../components/common/CourseBuilder/CourseInformationPanel";
import "../../../components/common/CourseBuilder/CourseBuilder.css";
import {
  emptyCourseState,
  validateCourseInformation,
  buildCoursePayload,
} from "../../../features/course-builder";

const CreateCourse = () => {
  const navigate = useNavigate();
  const { mutateAsync: createCourseMutation } = useCreateCourse();

  const [loading, setLoading] = useState(false);
  const [builderStarted, setBuilderStarted] = useState(false);
  const [activeStep, setActiveStep] = useState("information");
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [lightbox, setLightbox] = useState({ isOpen: false, type: "", src: "" });
  const [course, setCourse] = useState(() => emptyCourseState());

  const validateForm = () => {
    const { valid, errors: nextErrors } = validateCourseInformation(course);
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return valid;
  };

  const handleTitleContinue = (title) => {
    setCourse((prev) => ({ ...prev, courseName: title }));
    setBuilderStarted(true);
    setActiveStep("information");
  };

  const handleStepChange = (step) => {
    if (step === "curriculum" && !validateForm()) {
      showWarning("Please fill all required fields correctly.");
      return;
    }
    setActiveStep(step);
  };

  const updateField = (field, value) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const openLightbox = (type, src) => setLightbox({ isOpen: true, type, src });
  const closeLightbox = () => setLightbox({ isOpen: false, type: "", src: "" });

  const handlePreview = () => {
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
      const payload = await buildCoursePayload(course);
      await createCourseMutation(payload);
      showSuccess("Course created successfully!");
      setShowPreview(false);
      navigate("/admin/courses");
    } catch (err) {
      showError(getErrorMessage(err, "Upload failed"));
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
