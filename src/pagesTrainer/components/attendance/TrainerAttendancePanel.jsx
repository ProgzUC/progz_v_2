import React, { useState, useEffect, useMemo } from "react";
import "./TrainerAttendancePanel.css";
import { useStartClass, useMarkAttendance, useEndClass, useClassSessions } from "../../../hooks/useClassSession";
import Swal from "sweetalert2";
import Loader from "../../../components/common/Loader/Loader";

const mapSessionAttendance = (session) =>
    (session?.attendance || []).map((a) => ({
        studentId: a.student._id,
        studentName: a.student.name,
        status: a.status,
        joinedAt: a.joinedAt || null,
    }));

const formatDaysLabel = (days) => {
    if (!days?.length) return "No schedule set";
    const short = days.map((d) => String(d).substring(0, 3));
    if (days.length === 7) return `${short[0]} - ${short[6]}`;
    return short.join(", ");
};

const formatTimingLabel = (batch) => {
    if (batch?.timing) return batch.timing;
    if (batch?.classTiming?.startTime || batch?.classTiming?.endTime) {
        return `${batch.classTiming.startTime || ""} - ${batch.classTiming.endTime || ""}`.trim();
    }
    return "Not scheduled";
};

export default function TrainerAttendancePanel({ batch, onViewStudents, onViewSchedule }) {
    const [sessionOverride, setSessionOverride] = useState(null);
    const [attendanceOverride, setAttendanceOverride] = useState(null);
    const [notesOverride, setNotesOverride] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const batchIdToUse = batch?._id || batch?.batchId;

    const startClassMutation = useStartClass();
    const markAttendanceMutation = useMarkAttendance();
    const endClassMutation = useEndClass();

    const { data: sessionsData } = useClassSessions(batchIdToUse);

    const serverActiveSession = useMemo(
        () => sessionsData?.sessions?.find((s) => !s.endTime) ?? null,
        [sessionsData]
    );

    const activeSession = sessionOverride ?? serverActiveSession;
    const attendance = attendanceOverride ?? mapSessionAttendance(activeSession);
    const notes = notesOverride ?? (activeSession?.notes || "");

    useEffect(() => {
        if (!activeSession || activeSession.endTime) return;

        const interval = setInterval(() => {
            const start = new Date(activeSession.startTime);
            const now = new Date();
            const diff = Math.floor((now - start) / 1000);
            setElapsedTime(diff);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeSession]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleStartClass = async () => {
        const id = batch?._id || batch?.batchId;

        if (!batch || !id) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Batch information is not available. Please refresh the page.",
            });
            return;
        }

        try {
            const session = await startClassMutation.mutateAsync(id);
            setSessionOverride(session);
            setAttendanceOverride(mapSessionAttendance(session));
            setNotesOverride(session.notes || "");

            Swal.fire({
                icon: "success",
                title: "Class Started!",
                text: "Good luck with today's session",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || error.message || "Failed to start class",
            });
        }
    };

    const handleAttendanceChange = async (studentId, newStatus) => {
        setAttendanceOverride((prev) => {
            const base = prev ?? mapSessionAttendance(activeSession);
            return base.map((a) => (a.studentId === studentId ? { ...a, status: newStatus } : a));
        });

        try {
            await markAttendanceMutation.mutateAsync({
                sessionId: activeSession._id,
                attendance: [{ studentId, status: newStatus }],
            });
        } catch {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to update attendance",
            });
        }
    };

    const handleMarkAllPresent = async () => {
        const allPresent = attendance.map((a) => ({
            studentId: a.studentId,
            status: "Present",
        }));

        setAttendanceOverride((prev) => {
            const base = prev ?? mapSessionAttendance(activeSession);
            return base.map((a) => ({ ...a, status: "Present" }));
        });

        try {
            await markAttendanceMutation.mutateAsync({
                sessionId: activeSession._id,
                attendance: allPresent,
            });

            Swal.fire({
                icon: "success",
                title: "Marked All Present",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to mark all present",
            });
        }
    };

    const handleEndClass = async () => {
        const result = await Swal.fire({
            title: "End Class?",
            text: "Are you sure you want to end this class session?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#0B3D2E",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, End Class",
        });

        if (result.isConfirmed) {
            try {
                const endedSession = await endClassMutation.mutateAsync({
                    sessionId: activeSession._id,
                    notes,
                });

                setSessionOverride(endedSession);

                const presentCount = attendance.filter((a) => a.status === "Present").length;
                const lateCount = attendance.filter((a) => a.status === "Late").length;
                const absentCount = attendance.filter((a) => a.status === "Absent").length;

                Swal.fire({
                    icon: "success",
                    title: "Class Ended Successfully",
                    html: `
            <p><strong>Duration:</strong> ${endedSession.duration}</p>
            <p><strong>Present:</strong> ${presentCount} | <strong>Late:</strong> ${lateCount} | <strong>Absent:</strong> ${absentCount}</p>
          `,
                    confirmButtonColor: "#0B3D2E",
                });
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.response?.data?.message || "Failed to end class",
                });
            }
        }
    };

    const filteredAttendance = attendance.filter((a) =>
        a.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const studentCount = batch.students?.length || 0;
    const timingLabel = formatTimingLabel(batch);
    const daysLabel = formatDaysLabel(batch.daysOfWeek);

    if (startClassMutation.isPending) {
        return <Loader message="Starting class session..." />;
    }

    if (!activeSession) {
        return (
            <div className="attendance-panel-container">
                <div className="attendance-dashboard-grid">
                    <div className="todays-class-card">
                        <div className="todays-class-card__header">
                            <div className="todays-class-card__icon">
                                <i className="bi bi-easel2"></i>
                            </div>
                            <div>
                                <h3 className="todays-class-card__title">Today&apos;s Class</h3>
                                <p className="todays-class-card__meta">
                                    {studentCount} Student{studentCount === 1 ? "" : "s"} Enrolled
                                </p>
                            </div>
                        </div>

                        <button type="button" className="start-class-btn" onClick={handleStartClass}>
                            <i className="bi bi-play-fill"></i>
                            Start Class
                        </button>

                        <div className="todays-class-card__footer">
                            <div className="todays-class-meta-item">
                                <i className="bi bi-clock"></i>
                                <div>
                                    <span className="todays-class-meta-label">Time</span>
                                    <span className="todays-class-meta-value">{timingLabel}</span>
                                </div>
                            </div>
                            <div className="todays-class-meta-item">
                                <i className="bi bi-calendar3"></i>
                                <div>
                                    <span className="todays-class-meta-label">Days</span>
                                    <span className="todays-class-meta-value">{daysLabel}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="quick-actions-card">
                        <h3 className="quick-actions-card__title">Quick Actions</h3>
                        <button
                            type="button"
                            className="quick-action-row"
                            onClick={onViewStudents}
                        >
                            <span className="quick-action-row__icon">
                                <i className="bi bi-people"></i>
                            </span>
                            <span className="quick-action-row__text">
                                <strong>View Students</strong>
                                <span>See enrolled students</span>
                            </span>
                            <i className="bi bi-chevron-right quick-action-row__chevron"></i>
                        </button>
                        <button
                            type="button"
                            className="quick-action-row"
                            onClick={onViewSchedule}
                        >
                            <span className="quick-action-row__icon">
                                <i className="bi bi-calendar2-week"></i>
                            </span>
                            <span className="quick-action-row__text">
                                <strong>View Schedule</strong>
                                <span>Check full timetable</span>
                            </span>
                            <i className="bi bi-chevron-right quick-action-row__chevron"></i>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isEnded = !!activeSession.endTime;
    const presentCount = attendance.filter((a) => a.status === "Present").length;
    const lateCount = attendance.filter((a) => a.status === "Late").length;
    const absentCount = attendance.filter((a) => a.status === "Absent").length;

    return (
        <div className="attendance-panel-container">
            <div className="session-header">
                <div className="session-info">
                    <h3>
                        {isEnded ? (
                            <>
                                <i className="bi bi-check-circle-fill"></i> Class Session Completed
                            </>
                        ) : (
                            <>
                                <i className="bi bi-broadcast"></i> Live Class Session
                            </>
                        )}
                    </h3>
                    <p className="session-date">
                        {new Date(activeSession.startTime).toLocaleString("en-IN", {
                            dateStyle: "full",
                            timeStyle: "short",
                        })}
                    </p>
                </div>

                <div className="session-timer">
                    <div className="timer-display">
                        <i className="bi bi-stopwatch"></i>
                        <span>{isEnded ? activeSession.duration : formatTime(elapsedTime)}</span>
                    </div>
                </div>
            </div>

            <div className="attendance-summary-cards">
                <div className="summary-card present">
                    <div className="card-icon">
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <div className="card-content">
                        <h4>{presentCount}</h4>
                        <p>Present</p>
                    </div>
                </div>

                <div className="summary-card late">
                    <div className="card-icon">
                        <i className="bi bi-clock-fill"></i>
                    </div>
                    <div className="card-content">
                        <h4>{lateCount}</h4>
                        <p>Late</p>
                    </div>
                </div>

                <div className="summary-card absent">
                    <div className="card-icon">
                        <i className="bi bi-x-circle-fill"></i>
                    </div>
                    <div className="card-content">
                        <h4>{absentCount}</h4>
                        <p>Absent</p>
                    </div>
                </div>
            </div>

            {!isEnded && (
                <div className="attendance-controls">
                    <div className="search-box">
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button type="button" className="mark-all-present-btn" onClick={handleMarkAllPresent}>
                        <i className="bi bi-check-all"></i>
                        Mark All Present
                    </button>
                </div>
            )}

            <div className="student-attendance-list">
                {filteredAttendance.map((student, index) => (
                    <div key={student.studentId} className="student-attendance-row">
                        <div className="student-info">
                            <div className="student-avatar">{student.studentName.charAt(0).toUpperCase()}</div>
                            <div className="student-details">
                                <span className="student-name">{student.studentName}</span>
                                <span className="student-number">
                                    {student.joinedAt
                                        ? `Joined ${new Date(student.joinedAt).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}`
                                        : `Student #${index + 1}`}
                                </span>
                            </div>
                        </div>

                        <div className="attendance-toggles">
                            <button
                                type="button"
                                className={`attendance-btn present ${student.status === "Present" ? "active" : ""}`}
                                onClick={() => !isEnded && handleAttendanceChange(student.studentId, "Present")}
                                disabled={isEnded}
                            >
                                <i className="bi bi-check-circle-fill"></i>
                                Present
                            </button>

                            <button
                                type="button"
                                className={`attendance-btn late ${student.status === "Late" ? "active" : ""}`}
                                onClick={() => !isEnded && handleAttendanceChange(student.studentId, "Late")}
                                disabled={isEnded}
                            >
                                <i className="bi bi-clock-fill"></i>
                                Late
                            </button>

                            <button
                                type="button"
                                className={`attendance-btn absent ${student.status === "Absent" ? "active" : ""}`}
                                onClick={() => !isEnded && handleAttendanceChange(student.studentId, "Absent")}
                                disabled={isEnded}
                            >
                                <i className="bi bi-x-circle-fill"></i>
                                Absent
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="class-notes-section">
                <label htmlFor="class-notes">
                    <i className="bi bi-journal-text"></i>
                    Class Notes
                </label>
                <textarea
                    id="class-notes"
                    placeholder="Add notes about today's class (topics covered, homework, etc.)"
                    value={notes}
                    onChange={(e) => setNotesOverride(e.target.value)}
                    rows={4}
                    disabled={isEnded}
                />
            </div>

            {!isEnded && (
                <button
                    type="button"
                    className="end-class-btn"
                    onClick={handleEndClass}
                    disabled={endClassMutation.isPending}
                >
                    <i className="bi bi-stop-circle-fill"></i>
                    {endClassMutation.isPending ? "Ending Class..." : "End Class"}
                </button>
            )}
        </div>
    );
}
