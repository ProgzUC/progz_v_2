import axiosInstance from './axiosInstance';

const withRangeParams = (range = {}) => {
    const params = new URLSearchParams();
    if (range.startDate) params.append('startDate', range.startDate);
    if (range.endDate) params.append('endDate', range.endDate);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
};

export const fetchAdminStats = (range = {}) =>
    axiosInstance.get(`/admin/stats${withRangeParams(range)}`).then(res => res.data);

export const fetchEnrollmentTrends = (range = {}) =>
    axiosInstance.get(`/admin/enrollment-trends${withRangeParams(range)}`).then(res => res.data);

export const fetchUserDistribution = (range = {}) =>
    axiosInstance.get(`/admin/user-distribution${withRangeParams(range)}`).then(res => res.data);

export const fetchRecentActivities = (range = {}) =>
    axiosInstance.get(`/admin/recent-activity${withRangeParams(range)}`).then(res => res.data);

export const sendAnnouncementEmail = (payload) =>
    axiosInstance.post("/admin/announcements/email", payload).then((res) => res.data);
