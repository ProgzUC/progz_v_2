import React, { useEffect, useState } from "react";
import "./AttendanceReport.css";
import { useBatchAttendanceReport } from "../../../hooks/useClassSession";
import { useBatches } from "../../../hooks/useBatches";
import Loader from "../../../components/common/Loader/Loader";
import { EmptyState, ErrorState } from "../../../components/common/PageState";
import { showError, showSuccess } from "../../../utils/toast";
import { getErrorMessage } from "../../../utils/apiError";
import AppSelect from "../../../components/common/AppSelect/AppSelect";
import { downloadAttendanceCSV } from "../../../api/reportApi";
import { Link } from "react-router-dom";

export default function AttendanceReport() {
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [autoSelected, setAutoSelected] = useState(false);

  const { data: batchesData, isLoading: batchesLoading, isError: batchesError, refetch: refetchBatches } = useBatches();
  const { data, isLoading, isError, refetch } = useBatchAttendanceReport(selectedBatchId);

  const batches = batchesData || [];
  const studentCount = data?.studentReports?.length || 0;

  useEffect(() => {
    if (autoSelected || batchesLoading || !batches.length) return;
    if (!selectedBatchId) {
      setSelectedBatchId(batches[0]._id);
      setAutoSelected(true);
    }
  }, [batches, batchesLoading, selectedBatchId, autoSelected]);

  const handleBatchChange = (e) => {
    setSelectedBatchId(e.target.value);
    setAutoSelected(true);
  };

  const handleExport = async () => {
    if (!selectedBatchId) return;
    try {
      await downloadAttendanceCSV(selectedBatchId);
      showSuccess("Attendance file is downloading.");
    } catch (error) {
      showError(getErrorMessage(error, "Attendance could not be exported."));
    }
  };

  const avgAttendance =
    studentCount > 0
      ? Math.round(
          data.studentReports.reduce((acc, s) => acc + s.attendancePercentage, 0) / studentCount
        )
      : 0;

  return (
    <div className="admin-attendance-page">
      <header className="page-hero">
        <h1 className="page-title">Attendance Reports</h1>
        <p className="page-subtitle">
          Review batch attendance, spot low participation, and export student-wise reports.
        </p>
        <Link to="/admin/reports" className="back-link">
          <i className="bi bi-arrow-left" aria-hidden="true" />
          Back to Operational Analytics
        </Link>
      </header>

      <div className="content-card">
        <div className="card-toolbar">
          <div className="toolbar-copy">
            <p className="card-kicker">Reports</p>
            <h2 className="card-title">Student-wise attendance</h2>
          </div>

          <div className="toolbar-actions">
            <div className="batch-selector">
              <label htmlFor="batch-select" className="sr-only">
                Select batch
              </label>
              <AppSelect
                id="batch-select"
                className="batch-dropdown"
                value={selectedBatchId}
                onChange={handleBatchChange}
                disabled={batchesLoading || batches.length === 0}
                aria-label="Select batch"
                searchable
                searchPlaceholder="Search batches…"
                options={
                  batches.length > 0
                    ? batches.map((batch) => ({
                        value: batch._id,
                        label: batch.name,
                      }))
                    : [
                        {
                          value: "",
                          label: batchesLoading ? "Loading batches..." : "No batches available",
                        },
                      ]
                }
              />
            </div>
            <button
              type="button"
              className="export-btn"
              onClick={handleExport}
              disabled={!selectedBatchId || isLoading || studentCount === 0}
            >
              <i className="bi bi-download" aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>

        {batchesError ? (
          <ErrorState
            title="Batches could not be loaded"
            message="Attendance needs at least one batch. Try again."
            onRetry={() => refetchBatches()}
          />
        ) : batchesLoading && !selectedBatchId ? (
          <div className="empty-panel">
            <Loader message="Loading batches..." inline />
          </div>
        ) : !batches.length ? (
          <div className="empty-panel">
            <EmptyState
              title="No batches yet"
              message="Create a batch first, then attendance reports will appear here."
              icon="bi-collection"
            />
          </div>
        ) : !selectedBatchId || isLoading ? (
          <div className="empty-panel">
            <Loader message="Generating attendance report..." inline />
          </div>
        ) : isError ? (
          <ErrorState
            title="Attendance report could not be loaded"
            message="The batch is still there. Try loading the report again."
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <div className="report-overview" role="list">
              <div className="overview-stat" role="listitem">
                <span className="stat-label">Batch</span>
                <strong className="stat-value" title={data?.batchName || "N/A"}>
                  {data?.batchName || "N/A"}
                </strong>
              </div>
              <div className="overview-stat" role="listitem">
                <span className="stat-label">Classes</span>
                <strong className="stat-value">{data?.totalSessions || 0}</strong>
              </div>
              <div className="overview-stat" role="listitem">
                <span className="stat-label">Students</span>
                <strong className="stat-value">{studentCount}</strong>
              </div>
              <div className="overview-stat" role="listitem">
                <span className="stat-label">Avg attendance</span>
                <strong className="stat-value">{avgAttendance}%</strong>
              </div>
            </div>

            {studentCount === 0 ? (
              <div className="no-data">
                <i className="bi bi-inbox" aria-hidden="true" />
                <p>No attendance data available for this batch yet.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Present</th>
                      <th>Late</th>
                      <th>Absent</th>
                      <th>Total</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.studentReports?.map((student, index) => (
                      <tr key={student.studentId}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="student-name-cell">
                            <div className="student-avatar">
                              {(student.studentName || "?").charAt(0).toUpperCase()}
                            </div>
                            <span>{student.studentName}</span>
                          </div>
                        </td>
                        <td className="email-cell">{student.studentEmail}</td>
                        <td>
                          <span className="count-badge present">{student.present}</span>
                        </td>
                        <td>
                          <span className="count-badge late">{student.late}</span>
                        </td>
                        <td>
                          <span className="count-badge absent">{student.absent}</span>
                        </td>
                        <td>{student.totalSessions}</td>
                        <td>
                          <div className="percentage-cell">
                            <div
                              className={`percentage-bar ${
                                student.attendancePercentage >= 75
                                  ? "good"
                                  : student.attendancePercentage >= 50
                                    ? "average"
                                    : "poor"
                              }`}
                            >
                              <div
                                className="percentage-fill"
                                style={{ width: `${student.attendancePercentage}%` }}
                              />
                            </div>
                            <span className="percentage-value">
                              {student.attendancePercentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
