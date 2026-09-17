import axiosInstance from './axiosInstance';

export const fetchAdminStats = () =>
    axiosInstance.get("/admin/stats").then(res => res.data);

export const fetchEnrollmentTrends = () =>
    axiosInstance.get("/admin/enrollment-trends").then(res => res.data);

export const fetchUserDistribution = () =>
    axiosInstance.get("/admin/user-distribution").then(res => res.data);

export const fetchRecentActivities = () =>
    axiosInstance.get("/admin/recent-activity").then(res => res.data);
