/**
 * Course builder domain state: empty form, API hydrate, and field validation.
 * UI components should import from here instead of redefining these helpers.
 */
import { createEmptyModule, withStableIds } from "../../utils/courseBuilder";
import { hasMeaningfulHtml } from "../../components/common/RichTextEditor/richTextUtils";

export const emptyCourseState = () => ({
  courseName: "",
  courseId: "",
  courseDescription: "",
  courseDuration: "",
  courseDurationMonths: "",
  instructor: "",
  thumbnail: null,
  modules: [createEmptyModule()],
});

/**
 * Map an API course document into editable builder state.
 * Preserves saved Cloudinary files separately from new File uploads.
 */
export const hydrateCourseState = (data = {}) => {
  const instructorDisplay =
    typeof data.instructor === "string"
      ? data.instructor
      : data.instructor?.[0]?.firstName ||
        data.instructor?.[0]?.name ||
        "";

  return {
    courseName: data.courseName || data.title || "",
    courseId: data.courseId || data.id || "",
    courseDescription: data.courseDescription || data.description || "",
    courseDuration: data.courseDuration || data.duration || "",
    courseDurationMonths:
      data.courseDurationMonths != null && data.courseDurationMonths !== ""
        ? String(data.courseDurationMonths)
        : data.durationMonths != null && data.durationMonths !== ""
          ? String(data.durationMonths)
          : "",
    instructor: instructorDisplay,
    thumbnail: data.thumbnail || null,
    modules: withStableIds(
      (data.modules || []).map((mod) => ({
        title: mod.title,
        sections: (mod.sections || []).map((sec) => ({
          title: sec.sectionName || sec.title || "",
          lessonType: sec.lessonType || "Theory",
          expanded: false,
          savedMaterialFiles: sec.learningMaterialFile || [],
          savedChallengeFiles: sec.codeChallengeFile || [],
          materialFiles: [],
          challengeFiles: [],
          notes: sec.learningMaterialNotes || sec.notes || "",
          challengeInstructions: sec.codeChallengeInstructions || "",
          videos: sec.videoReferences || sec.videos || [],
        })),
      }))
    ),
  };
};

/**
 * Validate information-step fields. Returns { valid, errors }.
 */
export const validateCourseInformation = (course) => {
  const errors = {};
  if (!String(course?.courseName || "").trim()) {
    errors.courseName = "Course Name is required";
  }
  if (!hasMeaningfulHtml(course?.courseDescription, { minChars: 10 })) {
    errors.courseDescription = "Enter a proper course description (at least a short sentence)";
  }
  if (!course?.courseDuration) {
    errors.courseDuration = "Duration is required";
  }
  if (course?.courseDurationMonths !== "" && course?.courseDurationMonths != null) {
    const months = Number(course.courseDurationMonths);
    if (!Number.isFinite(months) || months < 1) {
      errors.courseDurationMonths = "Enter a valid duration in months";
    }
  }
  if (!course?.thumbnail) {
    errors.thumbnail = "Thumbnail is required";
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
