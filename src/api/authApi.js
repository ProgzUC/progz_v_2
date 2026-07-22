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

/**
 * Login API
 * payload: { email, password }
 * Stores only access token + minimal user info in session/local storage.
 * Refresh tokens and full profile data are not persisted on the client.
 */
export async function login(payload, rememberMe = false) {
    const res = await axiosInstance.post("/auth/login", payload);
    const data = res.data || {};

    saveAuthSession({
        accessToken: data.accessToken,
        user: data.user,
        rememberMe,
    });

    return data;
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
 * Logout: clears all client auth storage
 */
export function logout() {
    clearAuthSession();
}

/**
 * Utility to manually set/clear access token
 */
export function setAuthToken(token) {
    setAccessToken(token);
}
