import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CourseBuilder } from "../../../features/course-builder";
import { useRollbackCourse } from "../../../hooks/useCourses";
import { showSuccess, showError } from "../../../utils/toast";
import { getErrorMessage } from "../../../utils/apiError";
import VersionHistory from "./VersionHistory";

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showHistory, setShowHistory] = useState(false);
  const { mutate: rollbackCourseMutation, isPending } = useRollbackCourse();

  const goToCourses = () => navigate("/admin/courses");

  const handleRollback = (versionId) => {
    rollbackCourseMutation(
      { courseId: id, versionId },
      {
        onSuccess: () => {
          showSuccess("Course has been reverted to the selected version.");
          setShowHistory(false);
        },
        onError: (err) => {
          showError(getErrorMessage(err, "Rollback failed"));
        },
      }
    );
  };

  return (
    <>
      <CourseBuilder
        isEditMode
        courseIdToEdit={id}
        onBack={goToCourses}
        onSave={goToCourses}
        extraHeader={
          <button
            type="button"
            className="step-header-icon-btn"
            title="Version History"
            aria-label="Version History"
            onClick={() => setShowHistory(true)}
            disabled={isPending}
          >
            <i className="bi bi-clock-history" />
          </button>
        }
      />
      <VersionHistory
        courseId={id}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onRollback={handleRollback}
      />
    </>
  );
};

export default EditCourse;
