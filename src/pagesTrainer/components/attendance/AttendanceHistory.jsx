import React, { useState } from "react";
import "./AttendanceHistory.css";
import { useClassSessions } from "../../../hooks/useClassSession";
import Loader from "../../../components/common/Loader/Loader";

export default function AttendanceHistory({ batchId }) {
    const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" });
    const { data, isLoading, isError } = useClassSessions(batchId, dateFilter);

    if (isLoading) {
        return <Loader message="Loading attendance history..." />;
    }

    if (isError) {
        return (
            <div className="error-state">
                <i className="bi bi-exclamation-triangle"></i>
                <p>Failed to load attendance history</p>
            </div>
        );
    }

    const sessions = data?.sessions || [];

    const handleFilterChange = (field, value) => {
        setDateFilter((prev) => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setDateFilter({ startDate: "", endDate: "" });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        return new Date(timeStr).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    return (
        <div className="attendance-history-container">
            <div className="history-header">
                <h2>
                    <i className="bi bi-clock-history me-2"></i>
                    Attendance History
                </h2>

                <div className="date-filters">
                    <input
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        placeholder="End Date"
                    />
                    {(dateFilter.startDate || dateFilter.endDate) && (
                        <button className="clear-filters-btn" onClick={clearFilters}>
                            <i className="bi bi-x-circle"></i>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {sessions.length === 0 ? (
                <div className="empty-state">
                    <i className="bi bi-calendar-x"></i>
                    <h3>No class sessions yet</h3>
                    <p>Start a class to begin tracking attendance</p>
                </div>
            ) : (
                <div className="history-table-container">
                    <div className="table-responsive">
                        <table className="attendance-history-table">
                            <thead>
                                <tr>
                                    <th>Date Session</th>
                                    <th>Timing</th>
                                    <th>Trainer</th>
                                    <th>Duration</th>
                                    <th>Attendance Summary</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session) => {
                                    const isActive = !session.endTime;
                                    const sessionDate = new Date(session.date);
                                    
                                    return (
                                        <tr key={session._id}>
                                            <td className="date-col">
                                                {sessionDate.toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                                <span className="date-sub">
                                                    {sessionDate.toLocaleDateString("en-IN", { weekday: "long" })}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="timing-info">
                                                    <span>{formatTime(session.startTime)}</span>
                                                    {session.endTime && (
                                                        <>
                                                            <span className="timing-dash text-muted">—</span>
                                                            <span>{formatTime(session.endTime)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="trainer-cell">
                                                    <div className="trainer-avatar">
                                                        {(session.trainer?.name || "T")[0].toUpperCase()}
                                                    </div>
                                                    <span>{session.trainer?.name || "N/A"}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="duration-info">
                                                    {isActive ? (
                                                        <span className="text-primary fw-600">In Progress</span>
                                                    ) : (
                                                        <span>{session.duration || "N/A"}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="attendance-summary-cell">
                                                    <div className="summary-pill p" title="Present">
                                                        <span className="summary-dot"></span>
                                                        <span>{session.attendanceSummary.present} P</span>
                                                    </div>
                                                    <div className="summary-pill l" title="Late">
                                                        <span className="summary-dot"></span>
                                                        <span>{session.attendanceSummary.late} L</span>
                                                    </div>
                                                    <div className="summary-pill a" title="Absent">
                                                        <span className="summary-dot"></span>
                                                        <span>{session.attendanceSummary.absent} A</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {isActive ? (
                                                    <span className="status-badge live">
                                                        <span className="status-indicator"></span>
                                                        Live Class
                                                    </span>
                                                ) : (
                                                    <span className="status-badge completed">
                                                        <span className="status-indicator"></span>
                                                        Completed
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
