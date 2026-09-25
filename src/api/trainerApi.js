import axiosInstance from './axiosInstance';

export const fetchTrainerBootstrap = () =>
    axiosInstance.get("/trainer/trainer-summary").then(res => res.data);

export const fetchBatchDetails = batchId =>
    axiosInstance.get(`/trainer/trainer-batch-details/${batchId}`).then(res => res.data);

export const toggleSectionCompletion = payload =>
    axiosInstance.post("/trainer/trainer-section-complete", payload).then(res => res.data);

export const fetchTrainerProfile = () =>
    axiosInstance.get("/trainer/trainer-profile").then(res => res.data);

export const updateTrainerProfile = data =>
    axiosInstance.put("/trainer/trainer-profile", data).then(res => res.data);

export const fetchTrainerCourses = () =>
    axiosInstance.get("/trainer/trainer-courses").then(res => res.data);

export const fetchTrainerAnnouncements = () =>
    axiosInstance.get("/trainer/announcements").then((res) => res.data);

export const fetchTrainerBatchAnnouncements = (batchId) =>
    axiosInstance.get(`/trainer/batches/${batchId}/announcements`).then((res) => res.data);

export const createTrainerBatchAnnouncement = (batchId, payload) =>
    axiosInstance
        .post(`/trainer/batches/${batchId}/announcements`, payload, { timeout: 120000 })
        .then((res) => res.data);

export const updateTrainerBatchAnnouncement = (id, payload) =>
    axiosInstance.patch(`/trainer/announcements/${id}`, payload).then((res) => res.data);

export const deleteTrainerBatchAnnouncement = (id) =>
    axiosInstance.delete(`/trainer/announcements/${id}`).then((res) => res.data);
