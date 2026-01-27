import axiosInstance from './axiosInstance';

// Profile endpoints
export const fetchStudentProfile = () =>
    axiosInstance.get("/student/profile").then(res => res.data);

export const updateStudentProfile = (data) =>
    axiosInstance.put("/student/profile", data).then(res => res.data);

export const changeStudentPassword = (payload) =>
    axiosInstance.post("/student/change-password", payload).then(res => res.data);

// Course endpoints
export const fetchStudentCourses = () =>
    axiosInstance.get("/student/my-courses").then(res => res.data);

export const fetchCourseProgress = (courseId) =>
    axiosInstance.get(`/student/course/${courseId}/progress`).then(res => res.data);
