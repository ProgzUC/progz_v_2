import axios from 'axios';
import { getAccessToken } from '../utils/authStorage';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5002/api"
    : "https://progz-backend.onrender.com/api"); // set VITE_API_BASE_URL for Linode in production

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error.response?.data;
    const base = data?.message || data?.msg || error.response?.statusText || error.message;
    const detail = data?.error && data.error !== base ? ` (${data.error})` : "";
    return Promise.reject(new Error(base + detail));
  }
);

export default axiosInstance;
