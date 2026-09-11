/**
 * Shared batch form helpers for create/edit modals.
 */

export const emptyBatchForm = () => ({
  name: "",
  courseId: "",
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
  courseId: batch?.course?._id || batch?.course || "",
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
  const payload = {
    name: batchData.name,
    course: batchData.courseId,
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
