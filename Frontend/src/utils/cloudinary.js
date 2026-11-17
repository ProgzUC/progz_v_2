import axiosInstance from "../api/axiosInstance";

export const uploadToCloudinary = async (file, folder = "courses") => {
  if (!file) return null;

  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`${file.name} exceeds 10MB limit`);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  // Do not set Content-Type manually — axios/browser must add multipart boundary
  const response = await axiosInstance.post("/uploads", formData);

  return response.data;
};
