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


export default axiosInstance;

