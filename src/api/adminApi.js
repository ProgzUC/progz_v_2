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

export const fetchAnnouncementRecipients = (audience, email = "") =>
    axiosInstance
        .get("/admin/announcements/recipients", { params: { audience, email } })
        .then((res) => res.data);

export const fetchAdminAnnouncements = () =>
    axiosInstance.get("/admin/announcements").then((res) => res.data);

export const createAnnouncement = (payload) =>
    axiosInstance.post("/admin/announcements", payload, { timeout: 120000 }).then((res) => res.data);

export const updateAnnouncement = (id, payload) =>
    axiosInstance.patch(`/admin/announcements/${id}`, payload).then((res) => res.data);

export const deleteAnnouncement = (id) =>
    axiosInstance.delete(`/admin/announcements/${id}`).then((res) => res.data);
