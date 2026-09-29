import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./StudentAttendance.css";
import { useStudentAttendance } from "../../../hooks/useStudentAttendance";
import Loader from "../../../components/common/Loader/Loader";
import { ErrorState } from "../../../components/common/PageState";

function useCountUp(target) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
            setValue(target);
            return undefined;
        }

        let frame = 0;
        const start = performance.now();
        const duration = 1100;
        const tick = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - (1 - progress) ** 3;
            setValue(Math.round(target * eased));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };

        setValue(0);
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target]);

    return value;
}

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
    const { data, isLoading, isError, refetch } = useStudentAttendance();
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

    const visibleHistory = selectedBatchId
        ? attendanceHistory.filter((row) => String(row.batchId) === String(selectedBatchId))
        : attendanceHistory;
    const summary = selectedBatchId ? summarize(visibleHistory) : (data?.summary || summarize(visibleHistory));
    const { totalSessions, present, late, absent, attendancePercentage } = summary;
    const selectedBatchName = batches.find((batch) => batch.id === String(selectedBatchId))?.name;
    const shownPercentage = useCountUp(isLoading ? 0 : attendancePercentage);
    const [ringReady, setRingReady] = useState(false);

    useEffect(() => {
        if (isLoading) return undefined;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
            setRingReady(true);
            return undefined;
        }
        setRingReady(false);
        const frame = requestAnimationFrame(() => {
            requestAnimationFrame(() => setRingReady(true));
        });
        return () => cancelAnimationFrame(frame);
    }, [attendancePercentage, isLoading]);

    if (isLoading) {
        return <Loader message="Loading your attendance..." />;
    }

    if (isError) {
        return (
            <div className="student-attendance-container">
                <ErrorState
                    title="Attendance could not be loaded"
                    message="Your class history is still safe. Try again to refresh it."
                    onRetry={() => refetch()}
                />
            </div>
        );
    }

    const circumference = 2 * Math.PI * 70;
    const offset = ringReady
        ? circumference - (attendancePercentage / 100) * circumference
        : circumference;

    return (
        <div className="student-attendance-container">
            <header className="attendance-page-head">
                <p className="attendance-kicker">Your classes</p>
                <h2>My Attendance</h2>
                <p>Presence, late joins, and absences across your batches.</p>
            </header>

            <section className="attendance-summary" aria-label="Attendance summary">
                <div className="attendance-ring-card">
                    <div className={`circular-progress-card ${ringReady ? "is-drawn" : ""}`}>
                        <svg className="progress-circle" width="168" height="168" viewBox="0 0 180 180" aria-hidden="true">
                            <circle className="progress-circle-bg" cx="90" cy="90" r="70" fill="none" strokeWidth="12" />
                            <circle
                                className="progress-circle-fill"
                                cx="90"
                                cy="90"
                                r="70"
                                fill="none"
                                strokeWidth="12"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                transform="rotate(-90 90 90)"
                            />
                        </svg>
                        <div className="progress-text">
                            <h3>{shownPercentage}%</h3>
                            <p>Attendance</p>
                        </div>
                    </div>
                </div>

                <div className="attendance-stats">
                    <article className="attendance-stat">
                        <span className="attendance-stat-icon total"><i className="bi bi-calendar3"></i></span>
                        <div>
                            <strong>{totalSessions}</strong>
                            <span>Total classes</span>
                        </div>
                    </article>
                    <article className="attendance-stat">
                        <span className="attendance-stat-icon present"><i className="bi bi-check-circle-fill"></i></span>
                        <div>
                            <strong>{present}</strong>
                            <span>Present</span>
                        </div>
                    </article>
                    <article className="attendance-stat">
                        <span className="attendance-stat-icon late"><i className="bi bi-clock-fill"></i></span>
                        <div>
                            <strong>{late}</strong>
                            <span>Late</span>
                        </div>
                    </article>
                    <article className="attendance-stat">
                        <span className="attendance-stat-icon absent"><i className="bi bi-x-circle-fill"></i></span>
                        <div>
                            <strong>{absent}</strong>
                            <span>Absent</span>
                        </div>
                    </article>
                </div>
            </section>

            <section className="attendance-history-section">
                <div className="attendance-history-head">
                    <h3>Attendance history</h3>
                    {selectedBatchName && <p>Showing {selectedBatchName}</p>}
                </div>

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
            </section>
        </div>
    );
}
