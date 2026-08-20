import axiosInstance from './axiosInstance';
import {
  saveAuthSession,
  clearAuthSession,
  setAccessToken,
} from '../utils/authStorage';

/**
 * Signup API
 * payload: { name, email, password, ... }
 */
export async function signup(payload) {
    const res = await axiosInstance.post('/auth/signup', payload);
    return res.data;
}

export async function getMe() {
    const res = await axiosInstance.get('/auth/me');
    return res.data;
}

/**
 * Login API
 * payload: { email, password }
 * Stores only access token + minimal user info in session/local storage.
 * Refresh tokens and full profile data are not persisted on the client.
 */
export async function login(payload, rememberMe = false) {
    const res = await axiosInstance.post("/auth/login", payload);
    const data = res.data || {};

    const meData = await getMe();

    saveAuthSession({
        user: meData.user,
        rememberMe,
    });

    return {
        ...data,
        ...meData,
    };
}

/**
 * Forgot Password API
 * payload: { email }
 */
export async function forgotPassword(payload) {
    const res = await axiosInstance.post("/auth/forgot-password", payload);
    return res.data;
}

/**
 * Reset Password API
 * payload: { password }
 */
export async function resetPassword(payload, token) {
    const res = await axiosInstance.post(`/auth/reset-password/${token || payload.token}`, payload);
    return res.data;
}

/**
 * Logout: clears server cookies & client auth storage
 */
export async function logout() {
    try {
        await axiosInstance.post("/auth/logout");
    } catch {
        // ignore errors on logout request
    }
    clearAuthSession();
}
