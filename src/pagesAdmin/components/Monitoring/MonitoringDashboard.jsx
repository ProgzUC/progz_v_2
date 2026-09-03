import React, { useState, useEffect } from "react";
import {
  fetchSystemMetrics,
  fetchAuditLogs,
  fetchErrorLogs,
  resolveErrorLog,
  deleteErrorLog,
  fetchHistoricalMetrics
} from "../../../api/monitoringApi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import "./MonitoringDashboard.css";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];
const PIE_COLORS = {
  "2xx": "#10B981",
  "3xx": "#3B82F6",
  "4xx": "#F59E0B",
  "5xx": "#EF4444"
};

export default function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState("performance");

  // Performance Tab State
  const [metrics, setMetrics] = useState(null);
  const [historical, setHistorical] = useState([]);
  const [historyHours, setHistoryHours] = useState(24);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Audit Logs Tab State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit] = useState(15);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditAction, setAuditAction] = useState("");
  const [auditRole, setAuditRole] = useState("");
  const [auditEmail, setAuditEmail] = useState("");
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);

  // Error Logs Tab State
  const [errorLogs, setErrorLogs] = useState([]);
  const [errorTotal, setErrorTotal] = useState(0);
  const [errorPage, setErrorPage] = useState(1);
  const [errorLimit] = useState(15);
  const [errorSearch, setErrorSearch] = useState("");
  const [errorResolved, setErrorResolved] = useState("all");
  const [expandedErrorId, setExpandedErrorId] = useState(null);
  const [errorLoading, setErrorLoading] = useState(false);

  // Auto-refresh interval reference
  useEffect(() => {
    let intervalId;
    if (activeTab === "performance") {
      loadPerformanceData();
      intervalId = setInterval(loadPerformanceData, 10000); // refresh metrics every 10s
    } else if (activeTab === "audit") {
      loadAuditLogs();
    } else if (activeTab === "errors") {
      loadErrorLogs();
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    activeTab,
    historyHours,
    auditPage,
    auditSearch,
    auditAction,
    auditRole,
    auditEmail,
    errorPage,
    errorSearch,
    errorResolved
  ]);

  const loadPerformanceData = async () => {
    try {
      const liveStats = await fetchSystemMetrics();
      setMetrics(liveStats);
      const history = await fetchHistoricalMetrics(historyHours);
      setHistorical(history);
    } catch (err) {
      console.error("Error fetching performance metrics:", err);
    } finally {
      setMetricsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const data = await fetchAuditLogs({
        page: auditPage,
        limit: auditLimit,
        search: auditSearch,
        action: auditAction,
        role: auditRole,
        email: auditEmail
      });
      setAuditLogs(data.logs);
      setAuditTotal(data.totalLogs);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  const loadErrorLogs = async () => {
    setErrorLoading(true);
    try {
      const data = await fetchErrorLogs({
        page: errorPage,
        limit: errorLimit,
        search: errorSearch,
        resolved: errorResolved === "all" ? undefined : errorResolved
      });
      setErrorLogs(data.logs);
      setErrorTotal(data.totalErrors);
    } catch (err) {
      console.error("Error fetching error logs:", err);
    } finally {
      setErrorLoading(false);
    }
  };

  const handleResolveError = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await resolveErrorLog(id, newStatus);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Error marked as ${newStatus ? "resolved" : "unresolved"}`,
        showConfirmButton: false,
        timer: 2000
      });
      loadErrorLogs();
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to update error status", "error");
    }
  };

  const handleDeleteError = async (id) => {
    Swal.fire({
      title: "Delete Error Log?",
      text: "Are you sure you want to permanently delete this error log entry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteErrorLog(id);
          Swal.fire("Deleted", "Error entry deleted successfully", "success");
          loadErrorLogs();
        } catch (err) {
          Swal.fire("Error", err.message || "Failed to delete error", "error");
        }
      }
    });
  };

  const formatUptime = (seconds) => {
    if (!seconds) return "0s";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(" ");
  };

  const getStatusBadgeClass = (status) => {
    if (status >= 200 && status < 300) return "status-badge success";
    if (status >= 300 && status < 400) return "status-badge info";
    if (status >= 400 && status < 500) return "status-badge warning";
    return "status-badge danger";
  };

  const getActionBadgeClass = (action) => {
    if (action.includes("delete") || action.includes("reject")) return "action-badge danger";
    if (action.includes("create") || action.includes("approve") || action.includes("enroll")) return "action-badge success";
    if (action.includes("update") || action.includes("rollback")) return "action-badge info";
    return "action-badge secondary";
  };

  // Pie chart data formatter
  const getPieData = () => {
    if (!metrics) return [];
    return Object.keys(metrics.statusCodes).map((key) => ({
      name: key,
      value: metrics.statusCodes[key]
    })).filter(item => item.value > 0);
  };

  // Line chart date formatter
  const formatHistoricalDate = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="monitoring-container">
      <div className="monitoring-header">
        <div>
          <h1>System Diagnostics & Monitoring</h1>
          <p className="subtitle">Real-time health, operations audit, and telemetry</p>
        </div>
        <div className="tab-buttons">
          <button
            onClick={() => setActiveTab("performance")}
            className={activeTab === "performance" ? "active" : ""}
          >
            <i className="bi bi-cpu"></i> Performance
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={activeTab === "audit" ? "active" : ""}
          >
            <i className="bi bi-shield-check"></i> Audit Logs
          </button>
          <button
            onClick={() => setActiveTab("errors")}
            className={activeTab === "errors" ? "active" : ""}
          >
            <i className="bi bi-bug"></i> Error Tracker
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: PERFORMANCE */}
        {activeTab === "performance" && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="tab-content"
          >
            {metricsLoading ? (
              <div className="monitor-loader">
                <div className="spinner-border text-emerald" role="status"></div>
                <span>Gathering telemetry...</span>
              </div>
            ) : (
              <>
                {/* Stats Cards Row */}
                <div className="monitor-grid-4">
                  <div className="monitor-card glass">
                    <div className="card-icon info-icon"><i className="bi bi-clock-history"></i></div>
                    <div className="card-data">
                      <h3>System Uptime</h3>
                      <p className="metric-val">{formatUptime(metrics?.uptimeSeconds)}</p>
                      <span className="subtext">Since last backend start</span>
                    </div>
                  </div>

                  <div className="monitor-card glass">
                    <div className="card-icon success-icon"><i className="bi bi-arrow-repeat"></i></div>
                    <div className="card-data">
                      <h3>Request Volume</h3>
                      <p className="metric-val">{metrics?.totalRequests}</p>
                      <span className="subtext">HTTP requests serviced</span>
                    </div>
                  </div>

                  <div className="monitor-card glass">
                    <div className="card-icon warning-icon"><i className="bi bi-lightning"></i></div>
                    <div className="card-data">
                      <h3>Avg Latency</h3>
                      <p className="metric-val">{metrics?.averageLatencyMs}ms</p>
                      <span className="subtext">Round-trip response time</span>
                    </div>
                  </div>

                  <div className="monitor-card glass">
                    <div className="card-icon danger-icon">
                      <i className={`bi bi-database ${metrics?.dbReadyState === 1 ? "text-emerald" : "text-danger"}`}></i>
                    </div>
                    <div className="card-data">
                      <h3>Database Status</h3>
                      <p className={`metric-val ${metrics?.dbReadyState === 1 ? "status-up" : "status-down"}`}>
                        {metrics?.dbStatus}
                      </p>
                      <span className="subtext">MongoDB Connection</span>
                    </div>
                  </div>
                </div>

                {/* Resource Gauges & Charts */}
                <div className="monitor-grid-2-3 mt-4">
                  {/* Gauge Widget */}
                  <div className="monitor-card glass resource-usage">
                    <h3>Host Resource Usage</h3>
                    
                    <div className="gauge-item mt-3">
                      <div className="gauge-label">
                        <span>CPU Usage</span>
                        <span>{metrics?.cpuUsagePercent}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${Math.min(metrics?.cpuUsagePercent || 0, 100)}%`, backgroundColor: (metrics?.cpuUsagePercent > 70 ? "#EF4444" : "#10B981") }}></div>
                      </div>
                    </div>

                    <div className="gauge-item mt-4">
                      <div className="gauge-label">
                        <span>Heap Memory Used</span>
                        <span>{metrics?.memory.heapUsedMB} MB / {metrics?.memory.heapTotalMB} MB</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill info-fill" style={{ width: `${Math.min(((metrics?.memory.heapUsedMB || 0) / (metrics?.memory.heapTotalMB || 1)) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Status Code Pie Chart */}
                    <div className="pie-container mt-4">
                      <h4>Status Code Share</h4>
                      {getPieData().length > 0 ? (
                        <div className="pie-layout">
                          <div className="pie-graphic">
                            <ResponsiveContainer width="100%" height={140}>
                              <PieChart>
                                <Pie
                                  data={getPieData()}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={60}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {getPieData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="pie-legend">
                            {getPieData().map((entry, idx) => (
                              <div key={idx} className="legend-row">
                                <span className="legend-dot" style={{ backgroundColor: PIE_COLORS[entry.name] }}></span>
                                <span className="legend-label">{entry.name}: {entry.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="no-data-text">No requests logged yet</p>
                      )}
                    </div>
                  </div>

                  {/* Historical Trends Graph */}
                  <div className="monitor-card glass trends-chart">
                    <div className="chart-header">
                      <h3>API Throughput & Latency Trend</h3>
                      <select
                        value={historyHours}
                        onChange={(e) => setHistoryHours(Number(e.target.value))}
                        className="form-select-sm glass-input"
                      >
                        <option value={6}>Last 6 Hours</option>
                        <option value={12}>Last 12 Hours</option>
                        <option value={24}>Last 24 Hours</option>
                        <option value={48}>Last 48 Hours</option>
                      </select>
                    </div>

                    <div className="chart-wrapper">
                      {historical.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={historical} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.2} />
                            <XAxis dataKey="timestamp" tickFormatter={formatHistoricalDate} stroke="#718096" fontSize={11} />
                            <YAxis yAxisId="left" stroke="#10B981" fontSize={11} label={{ value: "Requests", angle: -90, position: "insideLeft", fill: "#10B981", fontSize: 11 }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" fontSize={11} label={{ value: "Latency (ms)", angle: 90, position: "insideRight", fill: "#F59E0B", fontSize: 11 }} />
                            <Tooltip contentStyle={{ backgroundColor: "#1A202C", borderColor: "#4A5568", color: "#FFF" }} />
                            <Area yAxisId="left" type="monotone" dataKey="requestCount" name="Throughput" stroke="#10B981" fillOpacity={1} fill="url(#colorReqs)" strokeWidth={2} />
                            <Area yAxisId="right" type="monotone" dataKey="averageLatency" name="Avg Latency" stroke="#F59E0B" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="no-data-text">No historical logs available yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent API Requests Stream */}
                <div className="monitor-card glass mt-4">
                  <h3>Live API Requests (Last {metrics?.recentRequests?.length || 0})</h3>
                  <div className="table-responsive">
                    <table className="monitor-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Method</th>
                          <th>Endpoint</th>
                          <th>Status</th>
                          <th>Latency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics?.recentRequests && metrics.recentRequests.length > 0 ? (
                          metrics.recentRequests.map((req, idx) => (
                            <tr key={idx}>
                              <td>{new Date(req.timestamp).toLocaleTimeString()}</td>
                              <td>
                                <span className={`method-badge ${req.method.toLowerCase()}`}>{req.method}</span>
                              </td>
                              <td className="monospace truncate">{req.url}</td>
                              <td>
                                <span className={getStatusBadgeClass(req.statusCode)}>{req.statusCode}</span>
                              </td>
                              <td>{req.latencyMs}ms</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center py-4">No active connections logged.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* TAB 2: AUDIT LOGS */}
        {activeTab === "audit" && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="tab-content"
          >
            {/* Filters Bar */}
            <div className="filter-card glass mb-4">
              <div className="filter-grid">
                <div className="filter-input-group">
                  <label>Search Keyword</label>
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => { setAuditSearch(e.target.value); setAuditPage(1); }}
                    placeholder="Search action, user, ID..."
                    className="glass-input"
                  />
                </div>
                <div className="filter-input-group">
                  <label>Action Type</label>
                  <select
                    value={auditAction}
                    onChange={(e) => { setAuditAction(e.target.value); setAuditPage(1); }}
                    className="glass-input"
                  >
                    <option value="">All Actions</option>
                    <option value="approve_user">User Approval</option>
                    <option value="reject_user">User Rejection</option>
                    <option value="delete_user">User Delete</option>
                    <option value="create_course">Create Course</option>
                    <option value="update_course">Edit Course</option>
                    <option value="rollback_course">Rollback Course</option>
                    <option value="delete_course">Delete Course</option>
                    <option value="enroll_student">Enroll Student</option>
                    <option value="unenroll_student">Unenroll Student</option>
                    <option value="sync_zen">Zen Sync Activity</option>
                    <option value="restore_item">Restore Bin Item</option>
                    <option value="permanently_delete_item">Permanent Delete</option>
                  </select>
                </div>
                <div className="filter-input-group">
                  <label>User Role</label>
                  <select
                    value={auditRole}
                    onChange={(e) => { setAuditRole(e.target.value); setAuditPage(1); }}
                    className="glass-input"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="trainer">Trainer</option>
                    <option value="student">Student</option>
                    <option value="system">System / Cron</option>
                  </select>
                </div>
                <div className="filter-input-group">
                  <label>User Email</label>
                  <input
                    type="text"
                    value={auditEmail}
                    onChange={(e) => { setAuditEmail(e.target.value); setAuditPage(1); }}
                    placeholder="Filter by email..."
                    className="glass-input"
                  />
                </div>
              </div>
            </div>

            {/* Audit Table */}
            <div className="monitor-card glass">
              <div className="table-header-info">
                <h3>System Operations Audit Trail</h3>
                <span className="total-badge">{auditTotal} activities recorded</span>
              </div>
              
              <div className="table-responsive">
                <table className="monitor-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Role</th>
                      <th>Action</th>
                      <th>Target</th>
                      <th>IP Address</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLoading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div className="spinner-border text-emerald" role="status"></div>
                        </td>
                      </tr>
                    ) : auditLogs.length > 0 ? (
                      auditLogs.map((log) => (
                        <tr key={log._id}>
                          <td>{new Date(log.timestamp).toLocaleString()}</td>
                          <td>
                            <div className="user-info-col">
                              <strong>{log.userName}</strong>
                              <span>{log.userEmail}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`role-badge ${log.userRole}`}>{log.userRole}</span>
                          </td>
                          <td>
                            <span className={getActionBadgeClass(log.action)}>{log.action.replace(/_/g, " ")}</span>
                          </td>
                          <td>
                            <div className="target-col">
                              <strong>{log.targetType}</strong>
                              <span className="monospace text-xs truncate">{log.targetId || "N/A"}</span>
                            </div>
                          </td>
                          <td>{log.ipAddress}</td>
                          <td>
                            <button
                              onClick={() => setSelectedAudit(log)}
                              className="btn-inspect glass-btn"
                            >
                              <i className="bi bi-info-circle"></i> Inspect
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">No audit logs match criteria.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {auditTotal > auditLimit && (
                <div className="monitor-pagination">
                  <button
                    disabled={auditPage === 1}
                    onClick={() => setAuditPage(prev => Math.max(prev - 1, 1))}
                    className="glass-btn"
                  >
                    Previous
                  </button>
                  <span>Page {auditPage} of {Math.ceil(auditTotal / auditLimit)}</span>
                  <button
                    disabled={auditPage >= Math.ceil(auditTotal / auditLimit)}
                    onClick={() => setAuditPage(prev => prev + 1)}
                    className="glass-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: ERROR TRACKER */}
        {activeTab === "errors" && (
          <motion.div
            key="errors"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="tab-content"
          >
            {/* Filters Bar */}
            <div className="filter-card glass mb-4">
              <div className="filter-grid-3">
                <div className="filter-input-group">
                  <label>Search Keyword</label>
                  <input
                    type="text"
                    value={errorSearch}
                    onChange={(e) => { setErrorSearch(e.target.value); setErrorPage(1); }}
                    placeholder="Search error message, endpoint..."
                    className="glass-input"
                  />
                </div>
                <div className="filter-input-group">
                  <label>Resolution Status</label>
                  <select
                    value={errorResolved}
                    onChange={(e) => { setErrorResolved(e.target.value); setErrorPage(1); }}
                    className="glass-input"
                  >
                    <option value="all">All Errors</option>
                    <option value="false">Unresolved</option>
                    <option value="true">Resolved</option>
                  </select>
                </div>
                <div className="filter-input-group align-self-end text-end pt-4">
                  <span className="total-badge text-lg">{errorTotal} Exception Logs</span>
                </div>
              </div>
            </div>

            {/* Errors List */}
            <div className="monitor-card glass">
              <div className="table-responsive">
                <table className="monitor-table">
                  <thead>
                    <tr>
                      <th style={{ width: "30px" }}></th>
                      <th>Time</th>
                      <th>Method & Endpoint</th>
                      <th>Error Message</th>
                      <th>IP Address</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorLoading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div className="spinner-border text-emerald" role="status"></div>
                        </td>
                      </tr>
                    ) : errorLogs.length > 0 ? (
                      errorLogs.map((log) => (
                        <React.Fragment key={log._id}>
                          <tr>
                            <td>
                              <button
                                onClick={() => setExpandedErrorId(expandedErrorId === log._id ? null : log._id)}
                                className="btn-expand"
                                aria-label="Expand error stack trace"
                              >
                                <i className={`bi ${expandedErrorId === log._id ? "bi-chevron-down" : "bi-chevron-right"}`}></i>
                              </button>
                            </td>
                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                            <td>
                              <div className="endpoint-col">
                                <span className={`method-badge ${log.method?.toLowerCase() || "process"}`}>
                                  {log.method || "PROCESS"}
                                </span>
                                <span className="monospace text-xs truncate">{log.url || "INTERNAL"}</span>
                              </div>
                            </td>
                            <td className="error-message truncate-2-lines">{log.message}</td>
                            <td>{log.ipAddress || "System"}</td>
                            <td>
                              <span className={`resolved-status ${log.resolved ? "resolved" : "unresolved"}`}>
                                {log.resolved ? "Resolved" : "Unresolved"}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons-group">
                                <button
                                  onClick={() => handleResolveError(log._id, log.resolved)}
                                  className={`btn-action-resolve ${log.resolved ? "btn-unresolve" : "btn-resolve"}`}
                                >
                                  {log.resolved ? "Unresolve" : "Resolve"}
                                </button>
                                <button
                                  onClick={() => handleDeleteError(log._id)}
                                  className="btn-action-delete"
                                  title="Delete log"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Expanded Row showing Stack Trace */}
                          <AnimatePresence>
                            {expandedErrorId === log._id && (
                              <tr className="expanded-row-bg">
                                <td colSpan="7">
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="stack-trace-container"
                                  >
                                    <div className="stack-metadata">
                                      {log.userId && (
                                        <span>
                                          <strong>Actor:</strong> {log.userId.name} ({log.userId.email}) - {log.userRole}
                                        </span>
                                      )}
                                      {log.resolved && log.resolvedBy && (
                                        <span>
                                          <strong>Resolved By:</strong> {log.resolvedBy.name} ({log.resolvedBy.email}) at {new Date(log.resolvedAt).toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                    <h4>Stack Trace:</h4>
                                    <pre className="monospace">{log.stack || "No stack trace available."}</pre>
                                  </motion.div>
                                </td>
                              </tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">No exception logs match search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {errorTotal > errorLimit && (
                <div className="monitor-pagination">
                  <button
                    disabled={errorPage === 1}
                    onClick={() => setErrorPage(prev => Math.max(prev - 1, 1))}
                    className="glass-btn"
                  >
                    Previous
                  </button>
                  <span>Page {errorPage} of {Math.ceil(errorTotal / errorLimit)}</span>
                  <button
                    disabled={errorPage >= Math.ceil(errorTotal / errorLimit)}
                    onClick={() => setErrorPage(prev => prev + 1)}
                    className="glass-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INSPECT AUDIT LOG MODAL */}
      <AnimatePresence>
        {selectedAudit && (
          <div className="audit-modal-overlay" onClick={() => setSelectedAudit(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="audit-modal glass"
            >
              <div className="modal-header">
                <h2>Audit Event Details</h2>
                <button className="close-btn" onClick={() => setSelectedAudit(null)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <strong>Activity ID:</strong>
                  <span className="monospace">{selectedAudit._id}</span>
                </div>
                <div className="detail-row">
                  <strong>Timestamp:</strong>
                  <span>{new Date(selectedAudit.timestamp).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <strong>Action:</strong>
                  <span className={`badge-text ${getActionBadgeClass(selectedAudit.action)}`}>
                    {selectedAudit.action.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Target Resource:</strong>
                  <span>{selectedAudit.targetType} ({selectedAudit.targetId || "N/A"})</span>
                </div>
                <div className="detail-row">
                  <strong>Actor:</strong>
                  <span>{selectedAudit.userName} ({selectedAudit.userEmail}) - <span className="text-xs uppercase">{selectedAudit.userRole}</span></span>
                </div>
                <div className="detail-row">
                  <strong>IP / Agent:</strong>
                  <span>{selectedAudit.ipAddress} <span className="agent-text">({selectedAudit.userAgent})</span></span>
                </div>
                <div className="detail-metadata">
                  <h4>Metadata Payload:</h4>
                  <pre className="monospace">
                    {JSON.stringify(selectedAudit.details || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
