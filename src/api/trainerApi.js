import axiosInstance from './axiosInstance';

export const fetchTrainerBootstrap = () =>
    axiosInstance.get("/trainer/trainer-summary").then(res => res.data);

export const fetchBatchDetails = batchId =>
    axiosInstance.get(`/trainer/trainer-batch-details/${batchId}`).then(res => res.data);

export const toggleSectionCompletion = payload =>
    axiosInstance.post("/trainer/trainer-section-complete", payload);

export const fetchTrainerProfile = () =>
    axiosInstance.get("/trainer/trainer-profile").then(res => res.data);

export const updateTrainerProfile = data =>
    axiosInstance.put("/trainer/trainer-profile", data).then(res => res.data);

export const fetchTrainerCourses = () =>
    axiosInstance.get("/trainer/trainer-courses").then(res => res.data);
