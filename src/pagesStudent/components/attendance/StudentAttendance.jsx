import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import "./StudentAttendance.css";
import { useStudentAttendance } from "../../../hooks/useStudentAttendance";
import Loader from "../../../components/common/Loader/Loader";

function summarize(rows) {
    const present = rows.filter((row) => row.status === "Present").length;
    const late = rows.filter((row) => row.status === "Late").length;
    const absent = rows.filter((row) => row.status === "Absent").length;
    const totalSessions = rows.length;
    const attendancePercentage = totalSessions > 0
        ? Math.round(((present + late) / totalSessions) * 100)
        : 0;
    return { totalSessions, present, late, absent, attendancePercentage };
}

export default function StudentAttendance() {
    const { data, isLoading, isError } = useStudentAttendance();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedBatchId = searchParams.get("batchId") || "";
    const attendanceHistory = data?.attendanceHistory || [];
    const batches = useMemo(() => {
        const map = new Map();
        attendanceHistory.forEach((row) => {
            if (!row.batchId) return;
            map.set(String(row.batchId), row.batchName || "Batch");
        });
        return Array.from(map, ([id, name]) => ({ id, name }));
    }, [attendanceHistory]);

    if (isLoading) {
        return <Loader message="Loading your attendance..." />;
    }

    if (isError) {
        return (
            <div className="error-container">
                <i className="bi bi-exclamation-triangle"></i>
                <p>Failed to load attendance data</p>
            </div>
        );
    }

    const visibleHistory = selectedBatchId
        ? attendanceHistory.filter((row) => String(row.batchId) === String(selectedBatchId))
        : attendanceHistory;
    const summary = selectedBatchId ? summarize(visibleHistory) : (data?.summary || summarize(visibleHistory));
    const { totalSessions, present, late, absent, attendancePercentage } = summary;
    const selectedBatchName = batches.find((batch) => batch.id === String(selectedBatchId))?.name;

    // Calculate circular progress
    const circumference = 2 * Math.PI * 70; // radius = 70
    const offset = circumference - (attendancePercentage / 100) * circumference;

    return (
        <div className="student-attendance-container">
            {/* Attendance Summary */}
            <div className="attendance-summary-section">
                <h2>
                    <i className="bi bi-calendar-check"></i>
                    My Attendance
                </h2>

                <div className="summary-cards">
                    {/* Circular Progress Card */}
                    <div className="circular-progress-card">
                        <svg className="progress-circle" width="180" height="180">
                            <circle
                                className="progress-circle-bg"
                                cx="90"
                                cy="90"
                                r="70"
                                fill="none"
                                stroke="#e9ecef"
                                strokeWidth="12"
                            />
                            <circle
                                className="progress-circle-fill"
                                cx="90"
                                cy="90"
                                r="70"
                                fill="none"
                                stroke="#198754"
                                strokeWidth="12"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                transform="rotate(-90 90 90)"
                            />
                        </svg>
                        <div className="progress-text">
                            <h3>{attendancePercentage}%</h3>
                            <p>Attendance</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-cards">
                        <div className="stat-card">
                            <div className="stat-icon total">
                                <i className="bi bi-calendar3"></i>
                            </div>
                            <div className="stat-content">
                                <h4>{totalSessions}</h4>
                                <p>Total Classes</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon present">
                                <i className="bi bi-check-circle-fill"></i>
                            </div>
                            <div className="stat-content">
                                <h4>{present}</h4>
                                <p>Present</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon late">
                                <i className="bi bi-clock-fill"></i>
                            </div>
                            <div className="stat-content">
                                <h4>{late}</h4>
                                <p>Late</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon absent">
                                <i className="bi bi-x-circle-fill"></i>
                            </div>
                            <div className="stat-content">
                                <h4>{absent}</h4>
                                <p>Absent</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance History */}
            <div className="attendance-history-section">
                <h3>Attendance History</h3>

                {batches.length > 0 && (
                    <div className="attendance-batch-filters" role="tablist" aria-label="Filter attendance by batch">
                        <button
                            type="button"
                            className={`attendance-batch-chip ${selectedBatchId ? "" : "active"}`}
                            onClick={() => setSearchParams({})}
                        >
                            All batches
                        </button>
                        {batches.map((batch) => (
                            <button
                                key={batch.id}
                                type="button"
                                className={`attendance-batch-chip ${selectedBatchId === batch.id ? "active" : ""}`}
                                onClick={() => setSearchParams({ batchId: batch.id })}
                            >
                                {batch.name}
                            </button>
                        ))}
                    </div>
                )}

                {selectedBatchName && (
                    <p className="attendance-filter-note">Showing attendance for {selectedBatchName}.</p>
                )}

                {visibleHistory.length === 0 ? (
                    <div className="empty-history">
                        <i className="bi bi-calendar-x"></i>
                        <p>No attendance records yet</p>
                    </div>
                ) : (
                    <div className="history-table-container">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Batch</th>
                                    <th>Trainer</th>
                                    <th>Joined</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleHistory.map((session, index) => {
                                    const sessionDate = new Date(session.date);

                                    return (
                                        <tr key={session.sessionId || index}>
                                            <td>
                                                <div className="date-cell">
                                                    <span className="date-day">
                                                        {sessionDate.toLocaleDateString("en-IN", {
                                                            day: "2-digit",
                                                            month: "short",
                                                        })}
                                                    </span>
                                                    <span className="date-year">
                                                        {sessionDate.getFullYear()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{session.batchName}</td>
                                            <td>{session.trainerName}</td>
                                            <td>
                                                {session.joinedAt
                                                    ? new Date(session.joinedAt).toLocaleTimeString("en-IN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                    : "—"}
                                            </td>
                                            <td>{session.duration || "N/A"}</td>
                                            <td>
                                                <span className={`status-badge ${session.status.toLowerCase()}`}>
                                                    {session.status === "Present" && <i className="bi bi-check-circle-fill"></i>}
                                                    {session.status === "Late" && <i className="bi bi-clock-fill"></i>}
                                                    {session.status === "Absent" && <i className="bi bi-x-circle-fill"></i>}
                                                    {session.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
