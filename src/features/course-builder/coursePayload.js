/**
 * Build API payloads from course builder state, including Cloudinary uploads.
 * Shared by admin create, admin edit, and trainer create/edit flows.
 */
import { uploadToCloudinary } from "../../utils/cloudinary";

const formatUploadedFile = (file) => ({
  url: file.url,
  publicId: file.publicId,
  fileType: file.fileType,
  originalName: file.originalName,
});

const normalizeThumbnail = async (thumbnail) => {
  if (!thumbnail) return null;
  if (thumbnail instanceof File) {
    const uploaded = await uploadToCloudinary(thumbnail, "courses/thumbnails");
    return { url: uploaded.url, publicId: uploaded.publicId };
  }
  if (thumbnail.url) {
    return { url: thumbnail.url, publicId: thumbnail.publicId };
  }
  return thumbnail;
};

const processSection = async (sec) => {
  const materialUploads = await Promise.all(
    (sec.materialFiles || []).map((f) => uploadToCloudinary(f, "courses/materials"))
  );
  const challengeUploads = await Promise.all(
    (sec.challengeFiles || []).map((f) => uploadToCloudinary(f, "courses/challenges"))
  );

  return {
    sectionName: sec.title,
    lessonType: sec.lessonType,
    learningMaterialNotes: sec.notes,
    learningMaterialFile: [
      ...(sec.savedMaterialFiles || []),
      ...materialUploads.map(formatUploadedFile),
    ],
    codeChallengeInstructions: sec.challengeInstructions,
    codeChallengeFile: [
      ...(sec.savedChallengeFiles || []),
      ...challengeUploads.map(formatUploadedFile),
    ],
    videoReferences: sec.videos || [],
  };
};

/**
 * Upload new files and assemble the course create/update payload.
 */
export const buildCoursePayload = async (course) => {
  const thumbnail = await normalizeThumbnail(course.thumbnail);

  const modules = await Promise.all(
    (course.modules || []).map(async (mod) => ({
      title: mod.title,
      sections: await Promise.all((mod.sections || []).map(processSection)),
    }))
  );

  return {
    courseName: course.courseName,
    courseId: course.courseId,
    courseDescription: course.courseDescription,
    courseDuration: Number(course.courseDuration),
    thumbnail,
    modules,
  };
};
