import React, { useState, useEffect } from "react";
import "./TrainerAttendancePanel.css";
import { useStartClass, useMarkAttendance, useEndClass } from "../../../hooks/useClassSession";
import Swal from "sweetalert2";
import Loader from "../../../components/common/Loader/Loader";

export default function TrainerAttendancePanel({ batch }) {
    const [activeSession, setActiveSession] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [notes, setNotes] = useState("");
    const [elapsedTime, setElapsedTime] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const startClassMutation = useStartClass();
    const markAttendanceMutation = useMarkAttendance();
    const endClassMutation = useEndClass();

    // Live timer for active session
    useEffect(() => {
        if (!activeSession || activeSession.endTime) return;

        const interval = setInterval(() => {
            const start = new Date(activeSession.startTime);
            const now = new Date();
            const diff = Math.floor((now - start) / 1000); // seconds
            setElapsedTime(diff);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeSession]);

    // Format elapsed time
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Handle start class
    const handleStartClass = async () => {
        try {
            const session = await startClassMutation.mutateAsync(batch._id);
            setActiveSession(session);

            // Initialize attendance state
            setAttendance(
                session.attendance.map((a) => ({
                    studentId: a.student._id,
                    studentName: a.student.name,
                    status: a.status,
                }))
            );

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
                text: error.response?.data?.message || "Failed to start class",
            });
        }
    };

    // Handle attendance toggle
    const handleAttendanceChange = async (studentId, newStatus) => {
        // Update local state optimistically
        setAttendance((prev) =>
            prev.map((a) => (a.studentId === studentId ? { ...a, status: newStatus } : a))
        );

        // Send to backend
        try {
            await markAttendanceMutation.mutateAsync({
                sessionId: activeSession._id,
                attendance: [{ studentId, status: newStatus }],
            });
        } catch (error) {
            console.error("Failed to mark attendance:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to update attendance",
            });
        }
    };

    // Mark all present
    const handleMarkAllPresent = async () => {
        const allPresent = attendance.map((a) => ({
            studentId: a.studentId,
            status: "Present",
        }));

        setAttendance((prev) => prev.map((a) => ({ ...a, status: "Present" })));

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
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to mark all present",
            });
        }
    };

    // Handle end class
    const handleEndClass = async () => {
        const result = await Swal.fire({
            title: "End Class?",
            text: "Are you sure you want to end this class session?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#198754",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, End Class",
        });

        if (result.isConfirmed) {
            try {
                const endedSession = await endClassMutation.mutateAsync({
                    sessionId: activeSession._id,
                    notes,
                });

                setActiveSession(endedSession);

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

    // Filter students by search
    const filteredAttendance = attendance.filter((a) =>
        a.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Loading states
    if (startClassMutation.isPending) {
        return <Loader message="Starting class session..." />;
    }

    // Pre-class state
    if (!activeSession) {
        return (
            <div className="attendance-panel-container">
                <div className="pre-class-state">
                    <div className="batch-info-card">
                        <h2>{batch.name}</h2>
                        <div className="batch-details">
                            <p>
                                <i className="bi bi-people-fill"></i>
                                <strong>Students:</strong> {batch.students?.length || 0}
                            </p>
                            <p>
                                <i className="bi bi-clock-fill"></i>
                                <strong>Scheduled Time:</strong> {batch.classTiming?.startTime} - {batch.classTiming?.endTime}
                            </p>
                            <p>
                                <i className="bi bi-calendar-fill"></i>
                                <strong>Days:</strong> {batch.daysOfWeek?.join(", ") || "N/A"}
                            </p>
                        </div>
                    </div>

                    <button className="start-class-btn" onClick={handleStartClass}>
                        <i className="bi bi-play-circle-fill"></i>
                        Start Class
                    </button>
                </div>
            </div>
        );
    }

    // Active or ended class state
    const isEnded = !!activeSession.endTime;
    const presentCount = attendance.filter((a) => a.status === "Present").length;
    const lateCount = attendance.filter((a) => a.status === "Late").length;
    const absentCount = attendance.filter((a) => a.status === "Absent").length;

    return (
        <div className="attendance-panel-container">
            {/* Session Header */}
            <div className="session-header">
                <div className="session-info">
                    <h3>
                        {isEnded ? (
                            <>
                                <i className="bi bi-check-circle-fill text-success"></i> Class Session Completed
                            </>
                        ) : (
                            <>
                                <i className="bi bi-broadcast text-danger"></i> Live Class Session
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

            {/* Attendance Summary */}
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

            {/* Attendance Controls (only if class is active) */}
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

                    <button className="mark-all-present-btn" onClick={handleMarkAllPresent}>
                        <i className="bi bi-check-all"></i>
                        Mark All Present
                    </button>
                </div>
            )}

            {/* Student Attendance List */}
            <div className="student-attendance-list">
                {filteredAttendance.map((student, index) => (
                    <div key={student.studentId} className="student-attendance-row">
                        <div className="student-info">
                            <div className="student-avatar">{student.studentName.charAt(0).toUpperCase()}</div>
                            <div className="student-details">
                                <span className="student-name">{student.studentName}</span>
                                <span className="student-number">Student #{index + 1}</span>
                            </div>
                        </div>

                        <div className="attendance-toggles">
                            <button
                                className={`attendance-btn present ${student.status === "Present" ? "active" : ""}`}
                                onClick={() => !isEnded && handleAttendanceChange(student.studentId, "Present")}
                                disabled={isEnded}
                            >
                                <i className="bi bi-check-circle-fill"></i>
                                Present
                            </button>

                            <button
                                className={`attendance-btn late ${student.status === "Late" ? "active" : ""}`}
                                onClick={() => !isEnded && handleAttendanceChange(student.studentId, "Late")}
                                disabled={isEnded}
                            >
                                <i className="bi bi-clock-fill"></i>
                                Late
                            </button>

                            <button
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

            {/* Class Notes */}
            <div className="class-notes-section">
                <label htmlFor="class-notes">
                    <i className="bi bi-journal-text"></i>
                    Class Notes
                </label>
                <textarea
                    id="class-notes"
                    placeholder="Add notes about today's class (topics covered, homework, etc.)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    disabled={isEnded}
                />
            </div>

            {/* End Class Button */}
            {!isEnded && (
                <button
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
