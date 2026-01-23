import axiosInstance from "./axiosInstance";

export const fetchCourses = async () => {
  const response = await axiosInstance.get("/courses");
  return response.data;
};

export const fetchCourseById = async (courseId) => {
  const response = await axiosInstance.get(`/courses/${courseId}`);
  return response.data;
};

export const createCourse = async (courseData) => {
  // axios automatically handles Content-Type for FormData if courseData is an instance of FormData
  const response = await axiosInstance.post("/courses", courseData);
  return response.data;
};

export const updateCourse = async (courseId, courseData) => {
  const response = await axiosInstance.put(`/courses/${courseId}`, courseData);
  return response.data;
};

export const deleteCourse = async (courseId) => {
  const response = await axiosInstance.delete(`/courses/${courseId}`);
  return response.data;
};
