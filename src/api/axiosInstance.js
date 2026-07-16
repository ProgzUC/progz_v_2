import axios from 'axios';

// /Users/savitha/progz_v_2/src/api/axiosInstance.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5002/api"
    : "https://progz-backend.onrender.com/api");

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// Attach access token from localStorage to each request if present
const getActiveToken = () => {
  if (sessionStorage.getItem('user') && sessionStorage.getItem('accessToken')) {
    return sessionStorage.getItem('accessToken');
  }
  if (localStorage.getItem('user') && localStorage.getItem('accessToken')) {
    return localStorage.getItem('accessToken');
  }
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

axiosInstance.interceptors.request.use((config) => {
  const token = getActiveToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: simple response interceptor to surface meaningful errors
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    // normalize error message, keeping any extra server-side detail
    const data = error.response?.data;
    const base = data?.message || data?.msg || error.response?.statusText || error.message;
    const detail = data?.error && data.error !== base ? ` (${data.error})` : "";
    return Promise.reject(new Error(base + detail));
  }
);


export default axiosInstance;

