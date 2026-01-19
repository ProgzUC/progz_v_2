import axios from 'axios';

// /Users/savitha/progz_v_2/src/api/axiosInstance.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from localStorage to each request if present
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: simple response interceptor to surface meaningful errors
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    // normalize error message
    const message =
      error.response?.data?.message || error.response?.statusText || error.message;
    return Promise.reject(new Error(message));
  }
);

/**
 * Signup API
 * payload: { name, email, password, ... }
 */
export async function signup(payload) {
  try {
    const res = await axiosInstance.post('/auth/signup', payload);
    return res.data;
  } catch (err) {
    throw err;
  }
}

/**
 * Login API
 * payload: { email, password }
 * stores accessToken/refreshToken in localStorage if returned by backend
 */
export async function login(payload, rememberMe = false) {
  try {
    const res = await axiosInstance.post("/auth/login", payload);
    const data = res.data || {};

    const storage = rememberMe ? localStorage : sessionStorage;


    if (data.accessToken) storage.setItem("accessToken", data.accessToken);
    if (data.refreshToken) storage.setItem("refreshToken", data.refreshToken);
    if (data.user) storage.setItem("user", JSON.stringify(data.user));

    return data;
  } catch (err) {
    throw err;
  }
}

/**
 *Forgot Password API
 * payload: { email }
 */
export async function forgotPassword(payload) {
  try {
    const res = await axiosInstance.post("/auth/forgot-password", payload);
    return res.data;
  } catch (err) {
    throw err;
  }
}

/**
 * Reset Password API
 * payload: { password }
 */
export async function resetPassword(payload) {
  try {
    const res = await axiosInstance.post(`/auth/reset-password/${token}`, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
}




/**
 * Logout: clears tokens from localStorage
 */
export function logout() {
  localStorage.clear();
  sessionStorage.clear();
}

/**
 * Utility to manually set/clear Authorization header (useful for SSR/tests)
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
}


/**
 * 
 * Trainer APIs
 */
export const fetchTrainerBootstrap = () =>
  axiosInstance.get("/trainer/trainer-summary").then(res => res.data);

export const fetchBatchDetails = batchId =>
  api.get(`/trainer/batch/${batchId}`).then(res => res.data);

export const toggleSectionCompletion = payload =>
  api.post("/trainer/batch/section/toggle", payload);
export const fetchTrainerProfile = () =>
  axiosInstance.get("/trainer/trainer-profile").then(res => res.data);

export const updateTrainerProfile = data =>
  axiosInstance.put("/trainer/trainer-profile", data).then(res => res.data);







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

export default axiosInstance;

