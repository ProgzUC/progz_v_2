/**
 * Shared batch form helpers for create/edit modals.
 */

export const getBatchCourseIds = (batch) => {
  if (!batch) return [];
  if (Array.isArray(batch.courses) && batch.courses.length) {
    return batch.courses.map((c) => String(c?._id || c)).filter(Boolean);
  }
  const single = batch.course?._id || batch.course;
  return single ? [String(single)] : [];
};

export const getBatchCourseNames = (batch) => {
  if (!batch) return [];
  if (Array.isArray(batch.courses) && batch.courses.length) {
    const names = batch.courses
      .map((c) => (typeof c === "object" ? c.courseName : null))
      .filter(Boolean);
    if (names.length) return names;
  }
  if (batch.course?.courseName) return [batch.course.courseName];
  return [];
};

export const formatBatchCourseNames = (batch) => {
  const names = getBatchCourseNames(batch);
  return names.length ? names.join(", ") : "—";
};

export const batchHasCourse = (batch, courseId) => {
  if (!courseId) return true;
  return getBatchCourseIds(batch).includes(String(courseId));
};

export const emptyBatchForm = () => ({
  name: "",
  courseIds: [],
  daysOfWeek: [],
  classTiming: { startTime: "", endTime: "", timezone: "Asia/Kolkata" },
  meetLink: "",
  startDate: "",
  endDate: "",
  status: "active",
  trainers: [],
});

export const hydrateBatchForm = (batch) => ({
  name: batch?.name || "",
  courseIds: getBatchCourseIds(batch),
  daysOfWeek: batch?.daysOfWeek || [],
  classTiming: {
    startTime: batch?.classTiming?.startTime || "",
    endTime: batch?.classTiming?.endTime || "",
    timezone: batch?.classTiming?.timezone || "Asia/Kolkata",
  },
  meetLink: batch?.meetLink || "",
  startDate: batch?.startDate ? String(batch.startDate).split("T")[0] : "",
  endDate: batch?.endDate ? String(batch.endDate).split("T")[0] : "",
  status: batch?.status || "active",
  trainers:
    batch?.trainers?.map((t) => ({
      trainer: t.trainer?._id || t.trainer || "",
      assignedModules: t.assignedModules || [],
      fromDate: t.fromDate ? String(t.fromDate).split("T")[0] : "",
      toDate: t.toDate ? String(t.toDate).split("T")[0] : "",
      isCurrent: t.isCurrent !== undefined ? t.isCurrent : true,
    })) || [],
});

export const emptyTrainerRow = () => ({
  trainer: "",
  assignedModules: [],
  fromDate: "",
  toDate: "",
  isCurrent: true,
});

export const toBatchApiPayload = (batchData, { includeStatus = false } = {}) => {
  const courseIds = batchData.courseIds || [];
  const payload = {
    name: batchData.name,
    course: courseIds[0],
    courses: courseIds,
    daysOfWeek: batchData.daysOfWeek,
    classTiming: batchData.classTiming,
    meetLink: batchData.meetLink,
    startDate: batchData.startDate || undefined,
    endDate: batchData.endDate || undefined,
    trainers: (batchData.trainers || [])
      .filter((t) => t.trainer)
      .map((t) => ({
        trainer: t.trainer,
        assignedModules: t.assignedModules || [],
        fromDate: t.fromDate || undefined,
        toDate: t.toDate || undefined,
        isCurrent: !!t.isCurrent,
      })),
  };

  if (includeStatus && batchData.status) {
    payload.status = batchData.status;
  }

  return payload;
};

export const isTrainerRole = (user) => {
  const role = (user?.role || "").toLowerCase();
  return role === "trainer" || role === "instructor";
};
