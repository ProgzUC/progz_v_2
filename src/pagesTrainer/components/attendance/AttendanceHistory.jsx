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
            hour12: true,
        });
    };

    const formatDisplayDate = (dateValue) => {
        if (!dateValue) return "—";
        return new Date(dateValue).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const rangeLabel = () => {
        if (dateFilter.startDate && dateFilter.endDate) {
            return `${formatDisplayDate(dateFilter.startDate)} → ${formatDisplayDate(dateFilter.endDate)}`;
        }
        if (dateFilter.startDate) return `From ${formatDisplayDate(dateFilter.startDate)}`;
        if (dateFilter.endDate) return `Until ${formatDisplayDate(dateFilter.endDate)}`;
        return "All dates";
    };

    return (
        <div className="attendance-history-container">
            <div className="history-header">
                <h2>
                    <i className="bi bi-calendar2-check"></i>
                    Attendance History
                </h2>

                <div className="date-filters">
                    <div className="date-range-chip" title={rangeLabel()}>
                        <i className="bi bi-calendar3"></i>
                        <span>{rangeLabel()}</span>
                    </div>
                    <input
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        aria-label="Start date"
                    />
                    <input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        aria-label="End date"
                    />
                    {(dateFilter.startDate || dateFilter.endDate) && (
                        <button type="button" className="clear-filters-btn" onClick={clearFilters}>
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
                                    <th>Date & Session</th>
                                    <th>Timing</th>
                                    <th>Trainer</th>
                                    <th>Duration</th>
                                    <th>Attendance Summary</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session, index) => {
                                    const isActive = !session.endTime;
                                    const sessionDate = new Date(session.date);
                                    const sessionNumber = sessions.length - index;
                                    const present = session.attendanceSummary?.present ?? 0;
                                    const absent = session.attendanceSummary?.absent ?? 0;
                                    const late = session.attendanceSummary?.late ?? 0;

                                    return (
                                        <tr key={session._id}>
                                            <td className="date-col">
                                                {sessionDate.toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                                <span className="date-sub">Session {sessionNumber}</span>
                                            </td>
                                            <td>
                                                <div className="timing-info">
                                                    <span>{formatTime(session.startTime)}</span>
                                                    {session.endTime && (
                                                        <>
                                                            <span className="timing-dash">-</span>
                                                            <span>{formatTime(session.endTime)}</span>
                                                        </>
                                                    )}
                                                    {!session.endTime && <span className="timing-dash">…</span>}
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
                                                        <span className="duration-live">In Progress</span>
                                                    ) : (
                                                        <span>{session.duration || "N/A"}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="attendance-summary-cell">
                                                    <span className="summary-badge present" title="Present">
                                                        <i className="bi bi-check-lg"></i>
                                                        {present} Present
                                                    </span>
                                                    {late > 0 && (
                                                        <span className="summary-badge late" title="Late">
                                                            <i className="bi bi-clock"></i>
                                                            {late} Late
                                                        </span>
                                                    )}
                                                    <span className="summary-badge absent" title="Absent">
                                                        {absent} Absent
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {isActive ? (
                                                    <span className="status-badge live">
                                                        <i className="bi bi-broadcast"></i>
                                                        Live
                                                    </span>
                                                ) : (
                                                    <span className="status-badge completed">
                                                        <i className="bi bi-check-lg"></i>
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
