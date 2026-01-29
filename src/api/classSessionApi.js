import axiosInstance from './axiosInstance';

// Start a new class session
export const startClass = (batchId) =>
    axiosInstance.post("/class-session/start", { batchId }).then(res => res.data);

// Mark attendance for students in a session
export const markAttendance = (sessionId, attendance) =>
    axiosInstance.patch(`/class-session/${sessionId}/attendance`, { attendance }).then(res => res.data);

// End a class session
export const endClass = (sessionId, notes) =>
    axiosInstance.patch(`/class-session/${sessionId}/end`, { notes }).then(res => res.data);

// Get class sessions for a batch
export const getClassSessions = (batchId, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return axiosInstance.get(`/class-session/batch/${batchId}?${params}`).then(res => res.data);
};

// Get student's own attendance history
export const getStudentAttendance = () =>
    axiosInstance.get("/class-session/student/me").then(res => res.data);

// Get batch attendance report (admin/trainer)
export const getBatchAttendanceReport = (batchId) =>
    axiosInstance.get(`/class-session/batch/${batchId}/report`).then(res => res.data);
