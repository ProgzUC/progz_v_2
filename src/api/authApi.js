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
 * Uses login response user first. /auth/me is optional (backend may not expose it).
 */
export async function login(payload, rememberMe = false) {
    const res = await axiosInstance.post("/auth/login", payload);
    const data = res.data || {};

    let user = data.user || null;

    // Optional profile refresh — do not fail login if /auth/me is missing (404)
    try {
        const meData = await getMe();
        if (meData?.user) user = meData.user;
    } catch {
        // Keep login response user when /auth/me is unavailable
    }

    if (!user) {
        throw new Error(data.msg || "Login succeeded but user data is missing");
    }

    saveAuthSession({
        user,
        rememberMe,
    });

    return {
        ...data,
        user,
        role: user.role || data.role,
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
