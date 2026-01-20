import axiosInstance from "./instance";

const fetchCourses = async () => {
  const response = await axiosInstance.get("/courses");
  return response.data;
};

const createCourse = async (courseData) => {
  const response = await axiosInstance.post("/courses", courseData);
  return response.data;
};

const updateCourse = async (courseId, courseData) => {
  const response = await axiosInstance.put(`/courses/${courseId}`, courseData);
  return response.data;
};

const deleteCourse = async (courseId) => {
  const response = await axiosInstance.delete(`/courses/${courseId}`);
  return response.data;
};

export { fetchCourses, createCourse, updateCourse, deleteCourse };
