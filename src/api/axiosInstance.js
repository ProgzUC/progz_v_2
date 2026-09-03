import axios from 'axios';
import { clearAuthSession } from '../utils/authStorage';

/**
 * Resolve API base URL.
 * - Dev: Vite proxy or localhost backend
 * - Prod: VITE_API_BASE_URL, else same-origin `/api` (Vercel rewrite → Render)
 * Never return empty — empty baseURL posts to the SPA host and causes 405.
 */
const resolveApiBaseUrl = () => {
  const configured = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
  if (configured) return configured;

  if (import.meta.env.DEV) {
    return 'http://localhost:5002/api';
  }

  // Production same-origin path (proxied by vercel.json to the backend)
  return '/api';
};

const API_BASE_URL = resolveApiBaseUrl();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 60000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const refreshUrl = () => {
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}/auth/refresh`;
};

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          refreshUrl(),
          {},
          { withCredentials: true }
        );

        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
        clearAuthSession();
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const data = error.response?.data;
    const base = data?.message || data?.msg || error.response?.statusText || error.message;
    const detail = data?.error && data.error !== base ? ` (${data.error})` : "";
    return Promise.reject(new Error(base + detail));
  }
);

export default axiosInstance;
