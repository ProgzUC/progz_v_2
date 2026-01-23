import axiosInstance from './axiosInstance';

export const fetchTrainerBootstrap = () =>
    axiosInstance.get("/trainer/trainer-summary").then(res => res.data);

export const fetchBatchDetails = batchId =>
    axiosInstance.get(`/trainer/batch/${batchId}`).then(res => res.data);

export const toggleSectionCompletion = payload =>
    axiosInstance.post("/trainer/batch/section/toggle", payload);

export const fetchTrainerProfile = () =>
    axiosInstance.get("/trainer/trainer-profile").then(res => res.data);

export const updateTrainerProfile = data =>
    axiosInstance.put("/trainer/trainer-profile", data).then(res => res.data);
