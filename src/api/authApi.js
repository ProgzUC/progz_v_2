import axiosInstance from './axiosInstance';

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
 * Forgot Password API
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
export async function resetPassword(payload, token) {
    try {
        // Note: Added token parameter which was missing in original file
        const res = await axiosInstance.post(`/auth/reset-password/${token || payload.token}`, payload);
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
