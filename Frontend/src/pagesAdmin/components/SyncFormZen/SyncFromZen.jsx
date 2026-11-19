import React, { useState, useEffect } from "react";
import { runManualSyncAndWait, fetchSyncStatus, fetchSyncLogs } from "../../../api/userApi";
import { showError, showInfo, showSuccess } from "../../../utils/toast";
import { ErrorState } from "../../../components/common/PageState";
import { getErrorMessage } from "../../../utils/apiError";
import ModalPortal from "../../../components/common/ModalPortal";
import "./SyncFromZen.css";

const SyncFromZen = () => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState("");
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
      setLoadError("");
    } catch (err) {
      setLoadError(getErrorMessage(err, "Sync history could not be loaded."));
    } finally {
      setFetching(false);
    }
  };

  const handleManualSync = async () => {
    if (loading) return;
    setLoading(true);

    showInfo("Sync started… waiting for Zen CRM to finish.");

    try {
      const result = await runManualSyncAndWait();
      const ok = result?.status === "success";
      if (ok) {
        showSuccess(
          `Sync completed. Instructors: ${result.instructorsSynced || 0}, Students: ${
            result.studentsSynced || 0
          }`
        );
      } else {
        showError(result?.errorsList?.[0] || "Sync finished with errors.");
      }
      loadSyncDashboard();
    } catch (err) {
      showError(getErrorMessage(err, "The Zen connection timed out. Try the sync again."));
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="admin-sync-page">
      <div className="page-hero">
        <div>
          <h1 className="page-title">Zen CRM Data Synchronization</h1>
          <p className="page-subtitle">
            Manage integrations, view pipeline history, and resolve sync errors
          </p>
        </div>
        <button
          type="button"
          onClick={handleManualSync}
          disabled={loading}
          className="sync-trigger-btn"
        >
          <i className={`bi bi-arrow-repeat ${loading ? "spin-icon" : ""}`} aria-hidden="true" />
          {loading ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {fetching ? (
        <div className="sync-loader-wrapper">
          <div className="spinner-border" role="status" aria-label="Loading" />
          <p>Loading sync metrics...</p>
        </div>
      ) : loadError ? (
        <ErrorState
          title="Sync history could not be loaded"
          message={loadError}
          onRetry={loadSyncDashboard}
        />
      ) : (
        <>
          {syncStatus ? (
            <div className="sync-status-cards">
              <div className="sync-metric-card">
                <div className="metric-icon success">
                  <i className="bi bi-cloud-check" aria-hidden="true" />
                </div>
                <div className="metric-info">
                  <span className="label">Latest Sync Status</span>
                  <strong className={`value ${syncStatus.status}`}>
                    {syncStatus.status === "success"
                      ? "Success"
                      : syncStatus.status === "in_progress"
                        ? "In progress"
                        : "Failed"}
                  </strong>
                  <span className="subtext">
                    {formatTime(syncStatus.endTime || syncStatus.startTime)}
                  </span>
                </div>
              </div>

              <div className="sync-metric-card">
                <div className="metric-icon info">
                  <i className="bi bi-person-video3" aria-hidden="true" />
                </div>
                <div className="metric-info">
                  <span className="label">Instructors Synced</span>
                  <strong className="value">{syncStatus.instructorsSynced || 0}</strong>
                  <span className="subtext">Pending users created</span>
                </div>
              </div>

              <div className="sync-metric-card">
                <div className="metric-icon info">
                  <i className="bi bi-mortarboard" aria-hidden="true" />
                </div>
                <div className="metric-info">
                  <span className="label">Students Synced</span>
                  <strong className="value">{syncStatus.studentsSynced || 0}</strong>
                  <span className="subtext">Leads imported/linked</span>
                </div>
              </div>

              <div className="sync-metric-card">
                <div className="metric-icon warning">
                  <i className="bi bi-files" aria-hidden="true" />
                </div>
                <div className="metric-info">
                  <span className="label">Duplicates Skipped</span>
                  <strong className="value">{syncStatus.duplicatesDetected || 0}</strong>
                  <span className="subtext">Matched email/phone filters</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="sync-empty-alert" role="status">
              <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
              <span>
                No synchronization history recorded yet. Trigger a manual sync to initiate logs.
              </span>
            </div>
          )}

          <div className="content-card">
            <div className="card-title-row">
              <h2 className="card-title">Sync Execution Logs</h2>
              <span className="card-count">{syncLogs.length} shown</span>
            </div>

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
                            <span>System Scheduler</span>
                          )}
                        </td>
                        <td>
                          <span className={`sync-status-badge ${log.status}`}>
                            {log.status}
                          </span>
                        </td>
                        <td>
                          <div className="imports-badge">
                            <span>
                              <i className="bi bi-mortarboard" aria-hidden="true" />
                              {log.studentsSynced || 0}
                            </span>
                            <span>
                              <i className="bi bi-briefcase" aria-hidden="true" />
                              {log.instructorsSynced || 0}
                            </span>
                          </div>
                        </td>
                        <td>{log.duplicatesDetected || 0}</td>
                        <td>{log.executionTimeMs ? `${log.executionTimeMs}ms` : "N/A"}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="details-btn"
                            aria-label="View sync details"
                          >
                            <i className="bi bi-journal-text" aria-hidden="true" />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "32px 10px" }}>
                        No sync logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="sync-pagination">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="page-btn"
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {selectedLog && (
        <ModalPortal>
          <div
            className="sync-details-modal-overlay"
            onClick={() => setSelectedLog(null)}
            role="presentation"
          >
            <div
              className="sync-details-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="sync-details-title"
            >
              <div className="modal-header">
                <h4 id="sync-details-title">Sync Event Diagnostics</h4>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setSelectedLog(null)}
                  aria-label="Close"
                >
                  <i className="bi bi-x-lg" aria-hidden="true" />
                </button>
              </div>
              <div className="modal-body">
                <div className="details-grid">
                  <div className="details-item">
                    <span className="lbl">Log ID</span>
                    <span className="val monospace">{selectedLog._id}</span>
                  </div>
                  <div className="details-item">
                    <span className="lbl">Start Time</span>
                    <span className="val">{formatTime(selectedLog.startTime)}</span>
                  </div>
                  <div className="details-item">
                    <span className="lbl">Duration</span>
                    <span className="val">
                      {selectedLog.executionTimeMs ? `${selectedLog.executionTimeMs}ms` : "N/A"}
                    </span>
                  </div>
                  <div className="details-item">
                    <span className="lbl">Trigger</span>
                    <span className="val" style={{ textTransform: "uppercase" }}>
                      {selectedLog.triggerType}
                    </span>
                  </div>
                </div>

                <div className="details-summary-row">
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
                    <h5>
                      Sync Run Exceptions & Warnings ({selectedLog.errors.length})
                    </h5>
                    <pre className="monospace">
                      {selectedLog.errors
                        .map((err, idx) => `[Err ${idx + 1}] ${err}`)
                        .join("\n")}
                    </pre>
                  </div>
                ) : (
                  <div className="sync-ok-banner">
                    <i className="bi bi-check-circle-fill" aria-hidden="true" />
                    No execution errors logged for this synchronization run.
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default SyncFromZen;
