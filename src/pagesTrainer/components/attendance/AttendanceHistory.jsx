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

    return (
        <div className="attendance-history-container">
            <div className="history-header">
                <h2>
                    <i className="bi bi-clock-history"></i>
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
                <div className="sessions-list">
                    {sessions.map((session) => {
                        const isActive = !session.endTime;
                        const sessionDate = new Date(session.date);

                        return (
                            <div key={session._id} className={`session-card ${isActive ? "active" : ""}`}>
                                <div className="session-card-header">
                                    <div className="session-date-info">
                                        <h3>
                                            {sessionDate.toLocaleDateString("en-IN", {
                                                weekday: "short",
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </h3>
                                        <p>
                                            {new Date(session.startTime).toLocaleTimeString("en-IN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                            {session.endTime &&
                                                ` - ${new Date(session.endTime).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}`}
                                        </p>
                                    </div>

                                    {isActive ? (
                                        <span className="status-badge active-badge">
                                            <i className="bi bi-broadcast"></i>
                                            Live
                                        </span>
                                    ) : (
                                        <span className="status-badge completed-badge">
                                            <i className="bi bi-check-circle"></i>
                                            Completed
                                        </span>
                                    )}
                                </div>

                                <div className="session-card-body">
                                    <div className="session-info-row">
                                        <div className="info-item">
                                            <i className="bi bi-person"></i>
                                            <span>Trainer: {session.trainer?.name || "N/A"}</span>
                                        </div>
                                        <div className="info-item">
                                            <i className="bi bi-stopwatch"></i>
                                            <span>Duration: {session.duration || "In progress..."}</span>
                                        </div>
                                    </div>

                                    <div className="attendance-stats">
                                        <div className="stat-item present">
                                            <i className="bi bi-check-circle-fill"></i>
                                            <span>{session.attendanceSummary.present} Present</span>
                                        </div>
                                        <div className="stat-item late">
                                            <i className="bi bi-clock-fill"></i>
                                            <span>{session.attendanceSummary.late} Late</span>
                                        </div>
                                        <div className="stat-item absent">
                                            <i className="bi bi-x-circle-fill"></i>
                                            <span>{session.attendanceSummary.absent} Absent</span>
                                        </div>
                                    </div>

                                    {session.notes && (
                                        <div className="session-notes">
                                            <i className="bi bi-journal-text"></i>
                                            <p>{session.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
