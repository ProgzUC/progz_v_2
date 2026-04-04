import axiosInstance from './axiosInstance';

export const fetchPendingUsers = () =>
    axiosInstance.get("/users/pending").then((res) => res.data);

export const fetchAllUsers = () =>
    axiosInstance.get("/users/allUsers").then((res) => res.data);

export const approveUser = (id) =>
    axiosInstance.post(`/users/approve/${id}`).then((res) => res.data);

export const rejectUser = (id) =>
    axiosInstance.delete(`/users/pending/${id}`).then((res) => res.data);

export const deleteUser = (id) =>
    axiosInstance.delete(`/users/${id}`).then((res) => res.data);

export const triggerManualSync = () =>
    axiosInstance.post("/sync/manual").then((res) => res.data);

export const registerUser = (payload) =>
    axiosInstance.post("/users/register", payload).then((res) => res.data);

export const adminCreateUser = (payload) =>
    axiosInstance.post("/users/admin-create", payload).then((res) => res.data);

/* Recycle Bin APIs */
export const fetchBinItems = () =>
    axiosInstance.get("/bin").then((res) => res.data);

export const restoreBinItem = (id) =>
    axiosInstance.post(`/bin/${id}/restore`).then((res) => res.data);

export const permanentlyDeleteBinItem = (id) =>
    axiosInstance.delete(`/bin/${id}`).then((res) => res.data);

export const updateUser = (id, data) =>
    axiosInstance.put(`/users/${id}`, data).then((res) => res.data);
