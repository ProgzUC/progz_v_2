import React, { useState } from "react";
import "./AttendanceReport.css";
import { useBatchAttendanceReport } from "../../../hooks/useClassSession";
import { useBatches } from "../../../hooks/useBatches";
import Loader from "../../../components/common/Loader/Loader";

export default function AttendanceReport() {
    const [selectedBatchId, setSelectedBatchId] = useState("");

    const { data: batchesData, isLoading: batchesLoading } = useBatches();
    const { data, isLoading, isError } = useBatchAttendanceReport(selectedBatchId);

    const batches = batchesData || [];

    const handleBatchChange = (e) => {
        setSelectedBatchId(e.target.value);
    };

    return (
        <div className="attendance-report-container">
            <div className="report-header">
                <h2>
                    <i className="bi bi-graph-up"></i>
                    Attendance Reports
                </h2>

                <div className="batch-selector">
                    <label htmlFor="batch-select">Select Batch:</label>
                    <select
                        id="batch-select"
                        value={selectedBatchId}
                        onChange={handleBatchChange}
                        className="batch-dropdown"
                        disabled={batchesLoading}
                    >
                        <option value="">
                            {batchesLoading ? "Loading batches..." : "-- Select a Batch --"}
                        </option>
                        {batches?.map((batch) => (
                            <option key={batch._id} value={batch._id}>
                                {batch.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {!selectedBatchId ? (
                <div className="no-selection">
                    <i className="bi bi-cursor"></i>
                    <h3>Select a Batch to View Report</h3>
                    <p>Choose a batch from the dropdown above to see detailed attendance statistics</p>
                </div>
            ) : isLoading ? (
                <Loader message="Generating attendance report..." />
            ) : isError ? (
                <div className="error-state">
                    <i className="bi bi-exclamation-triangle"></i>
                    <p>Failed to load attendance report</p>
                </div>
            ) : (
                <>
                    {/* Report Overview */}
                    <div className="report-overview">
                        <div className="overview-card">
                            <div className="overview-icon">
                                <i className="bi bi-building"></i>
                            </div>
                            <div className="overview-content">
                                <h4>{data?.batchName || "N/A"}</h4>
                                <p>Batch Name</p>
                            </div>
                        </div>

                        <div className="overview-card">
                            <div className="overview-icon">
                                <i className="bi bi-calendar-event"></i>
                            </div>
                            <div className="overview-content">
                                <h4>{data?.totalSessions || 0}</h4>
                                <p>Total Classes</p>
                            </div>
                        </div>

                        <div className="overview-card">
                            <div className="overview-icon">
                                <i className="bi bi-people"></i>
                            </div>
                            <div className="overview-content">
                                <h4>{data?.studentReports?.length || 0}</h4>
                                <p>Students</p>
                            </div>
                        </div>

                        <div className="overview-card">
                            <div className="overview-icon">
                                <i className="bi bi-percent"></i>
                            </div>
                            <div className="overview-content">
                                <h4>
                                    {data?.studentReports?.length > 0
                                        ? Math.round(
                                            data.studentReports.reduce(
                                                (acc, s) => acc + s.attendancePercentage,
                                                0
                                            ) / data.studentReports.length
                                        )
                                        : 0}
                                    %
                                </h4>
                                <p>Avg Attendance</p>
                            </div>
                        </div>
                    </div>

                    {/* Student Reports Table */}
                    <div className="student-reports-section">
                        <div className="section-header">
                            <h3>Student-wise Attendance</h3>
                            {/* Future: Export button */}
                            {/* <button className="export-btn">
                <i className="bi bi-download"></i>
                Export CSV
              </button> */}
                        </div>

                        {data?.studentReports?.length === 0 ? (
                            <div className="no-data">
                                <i className="bi bi-inbox"></i>
                                <p>No attendance data available for this batch</p>
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
                                                <td className="student-name-cell">
                                                    <div className="student-avatar">
                                                        {student.studentName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{student.studentName}</span>
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
                                                            className={`percentage-bar ${student.attendancePercentage >= 75
                                                                ? "good"
                                                                : student.attendancePercentage >= 50
                                                                    ? "average"
                                                                    : "poor"
                                                                }`}
                                                        >
                                                            <div
                                                                className="percentage-fill"
                                                                style={{ width: `${student.attendancePercentage}%` }}
                                                            ></div>
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
                    </div>
                </>
            )}
        </div>
    );
}
