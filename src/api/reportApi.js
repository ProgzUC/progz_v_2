import axiosInstance from './axiosInstance';

export const fetchOperationalSummary = () => 
    axiosInstance.get('/admin/reports/operational-summary').then(res => res.data);

export const fetchAttendanceAnalytics = (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.batchId) params.append('batchId', filters.batchId);
    return axiosInstance.get(`/admin/reports/attendance-analytics?${params.toString()}`).then(res => res.data);
};

export const fetchEnrollmentAnalytics = () => 
    axiosInstance.get('/admin/reports/enrollment-analytics').then(res => res.data);

export const fetchTrainerUtilization = () => 
    axiosInstance.get('/admin/reports/trainer-utilization').then(res => res.data);

export const fetchBatchHealth = () => 
    axiosInstance.get('/admin/reports/batch-health').then(res => res.data);

// Download CSV direct endpoint approach, can also use frontend CSV gen
export const downloadAttendanceCSV = async (batchId) => {
    const url = batchId 
        ? `/admin/reports/export/attendance?batchId=${batchId}` 
        : `/admin/reports/export/attendance`;
        
    const response = await axiosInstance.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'text/csv' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `attendance_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
};
