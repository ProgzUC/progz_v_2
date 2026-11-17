import axiosInstance from "./axiosInstance";

export const fetchSystemMetrics = () =>
  axiosInstance.get("/admin/monitoring/metrics").then((res) => res.data);

export const fetchAuditLogs = (params) =>
  axiosInstance.get("/admin/monitoring/audit-logs", { params }).then((res) => res.data);

export const fetchErrorLogs = (params) =>
  axiosInstance.get("/admin/monitoring/error-logs", { params }).then((res) => res.data);

export const resolveErrorLog = (id, resolved) =>
  axiosInstance.put(`/admin/monitoring/error-logs/${id}/resolve`, { resolved }).then((res) => res.data);

export const deleteErrorLog = (id) =>
  axiosInstance.delete(`/admin/monitoring/error-logs/${id}`).then((res) => res.data);

export const fetchHistoricalMetrics = (hours = 24) =>
  axiosInstance.get("/admin/monitoring/historical", { params: { hours } }).then((res) => res.data);
