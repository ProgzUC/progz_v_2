import React, { useState, useEffect } from "react";
import { triggerManualSync, fetchSyncStatus, fetchSyncLogs } from "../../../api/userApi";
import Swal from "sweetalert2";
import "./SyncFromZen.css";

const SyncFromZen = () => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadSyncDashboard();
  }, [page]);

  const loadSyncDashboard = async () => {
    try {
      setFetching(true);
      const status = await fetchSyncStatus();
      setSyncStatus(status && status.startTime ? status : null);

      const logsData = await fetchSyncLogs({ page, limit: 10 });
      setSyncLogs(logsData.logs || []);
      setTotalPages(logsData.totalPages || 1);
    } catch (err) {
      console.error("Failed to load sync dashboard:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleManualSync = async () => {
    if (loading) return;
    setLoading(true);

    Swal.fire({
      title: "Triggering Sync",
      text: "Connecting to Zen CRM API and downloading records...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const result = await triggerManualSync();
      Swal.fire({
        title: "Sync Completed",
        text: `Successfully completed. Status: ${result.status}`,
        icon: result.status === "success" ? "success" : "warning",
        confirmButtonText: "Okay"
      });
      loadSyncDashboard();
    } catch (err) {
      console.error("Manual sync failed:", err);
      Swal.fire({
        title: "Sync Failed",
        text: err.message || "External Zen API endpoint timeout or connection issue.",
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="sync-dashboard-container p-4">
      <div className="sync-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Zen CRM Data Synchronization</h2>
          <p className="text-secondary">Manage integrations, view pipeline history, and resolve sync errors</p>
        </div>
        <button
          onClick={handleManualSync}
          disabled={loading}
          className="btn btn-emerald sync-trigger-btn d-flex align-items-center gap-2"
        >
          <i className={`bi bi-arrow-repeat ${loading ? "spin-icon" : ""}`}></i>
          {loading ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {fetching ? (
        <div className="sync-loader-wrapper py-5 text-center">
          <div className="spinner-border text-emerald" role="status"></div>
          <p className="mt-2 text-secondary">Loading sync metrics...</p>
        </div>
      ) : (
        <>
          {/* Latest Sync Status Dashboard */}
          {syncStatus ? (
            <div className="sync-status-cards mb-4">
              <div className="sync-metric-card glass-card">
                <div className="metric-icon success"><i className="bi bi-cloud-check"></i></div>
                <div className="metric-info">
                  <span className="label">Latest Sync Status</span>
                  <strong className={`value ${syncStatus.status}`}>
                    {syncStatus.status === "success" ? "Success" : "Failed"}
                  </strong>
                  <span className="subtext">{formatTime(syncStatus.endTime || syncStatus.startTime)}</span>
                </div>
              </div>

              <div className="sync-metric-card glass-card">
                <div className="metric-icon info"><i className="bi bi-person-video3"></i></div>
                <div className="metric-info">
                  <span className="label">Instructors Synced</span>
                  <strong className="value">{syncStatus.instructorsSynced || 0}</strong>
                  <span className="subtext">Pending users created</span>
                </div>
              </div>

              <div className="sync-metric-card glass-card">
                <div className="metric-icon info"><i className="bi bi-mortarboard"></i></div>
                <div className="metric-info">
                  <span className="label">Students Synced</span>
                  <strong className="value">{syncStatus.studentsSynced || 0}</strong>
                  <span className="subtext">Leads imported/linked</span>
                </div>
              </div>

              <div className="sync-metric-card glass-card">
                <div className="metric-icon warning"><i className="bi bi-files"></i></div>
                <div className="metric-info">
                  <span className="label">Duplicates Skipped</span>
                  <strong className="value">{syncStatus.duplicatesDetected || 0}</strong>
                  <span className="subtext">Matched email/phone filters</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning mb-4">
              <i className="bi bi-exclamation-triangle-fill"></i> No synchronization history recorded yet. Trigger a manual sync to initiate logs.
            </div>
          )}

          {/* Sync History Table */}
          <div className="sync-history-panel glass-card p-4">
            <h3 className="panel-title mb-3">Sync Execution Logs</h3>
            <div className="table-responsive">
              <table className="sync-history-table">
                <thead>
                  <tr>
                    <th>Start Time</th>
                    <th>Trigger</th>
                    <th>Actor</th>
                    <th>Status</th>
                    <th>Imported</th>
                    <th>Duplicates</th>
                    <th>Execution Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {syncLogs.length > 0 ? (
                    syncLogs.map((log) => (
                      <tr key={log._id}>
                        <td>{formatTime(log.startTime)}</td>
                        <td>
                          <span className={`trigger-badge ${log.triggerType}`}>
                            {log.triggerType}
                          </span>
                        </td>
                        <td>
                          {log.triggeredBy ? (
                            <div className="actor-info">
                              <strong>{log.triggeredBy.name}</strong>
                              <span>{log.triggeredBy.email}</span>
                            </div>
                          ) : (
                            <span className="text-secondary">System Scheduler</span>
                          )}
                        </td>
                        <td>
                          <span className={`sync-status-badge ${log.status}`}>
                            {log.status}
                          </span>
                        </td>
                        <td>
                          <div className="imports-badge">
                            <span>🎓 {log.studentsSynced || 0}</span>
                            <span>💼 {log.instructorsSynced || 0}</span>
                          </div>
                        </td>
                        <td>{log.duplicatesDetected || 0}</td>
                        <td>{log.executionTimeMs ? `${log.executionTimeMs}ms` : "N/A"}</td>
                        <td>
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="btn btn-sm glass-btn d-flex align-items-center gap-1"
                          >
                            <i className="bi bi-journal-text"></i> Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-secondary">No sync logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="sync-pagination d-flex justify-content-center align-items-center gap-3 mt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className="btn glass-btn"
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(prev => prev + 1)}
                  className="btn glass-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* SYNC RUN DETAILS MODAL */}
      {selectedLog && (
        <div className="sync-details-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="sync-details-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
              <h4 className="m-0">Sync Event Diagnostics</h4>
              <button className="close-btn" onClick={() => setSelectedLog(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body p-4">
              <div className="details-grid mb-4">
                <div className="details-item">
                  <span className="lbl">Log ID:</span>
                  <span className="val monospace">{selectedLog._id}</span>
                </div>
                <div className="details-item">
                  <span className="lbl">Start Time:</span>
                  <span className="val">{formatTime(selectedLog.startTime)}</span>
                </div>
                <div className="details-item">
                  <span className="lbl">Duration:</span>
                  <span className="val">{selectedLog.executionTimeMs ? `${selectedLog.executionTimeMs}ms` : "N/A"}</span>
                </div>
                <div className="details-item">
                  <span className="lbl">Trigger:</span>
                  <span className="val text-uppercase">{selectedLog.triggerType}</span>
                </div>
              </div>

              <div className="details-summary-row mb-4">
                <div className="summ-box">
                  <strong>{selectedLog.studentsSynced || 0}</strong>
                  <span>Students Synced</span>
                </div>
                <div className="summ-box">
                  <strong>{selectedLog.instructorsSynced || 0}</strong>
                  <span>Instructors Synced</span>
                </div>
                <div className="summ-box">
                  <strong>{selectedLog.duplicatesDetected || 0}</strong>
                  <span>Duplicates Detected</span>
                </div>
              </div>

              {selectedLog.errors && selectedLog.errors.length > 0 ? (
                <div className="errors-log-box">
                  <h5 className="text-danger mb-2">Sync Run Exceptions & Warnings ({selectedLog.errors.length}):</h5>
                  <pre className="monospace p-3 bg-dark text-danger-emphasis border border-danger-subtle rounded">
                    {selectedLog.errors.map((err, idx) => `[Err ${idx + 1}] ${err}`).join("\n")}
                  </pre>
                </div>
              ) : (
                <div className="alert alert-success d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill"></i> No execution errors logged for this synchronization run.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncFromZen;
