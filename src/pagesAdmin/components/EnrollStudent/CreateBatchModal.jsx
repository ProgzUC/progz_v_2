import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useCreateBatch } from "../../../hooks/useBatches";
import { useCourse } from "../../../hooks/useCourses";
import { useAllUsers } from "../../../hooks/useAdminUsers";
import "./EnrollStudents.css"; // Reuse existing styles

const CreateBatchModal = ({ isOpen, onClose, coursesList, weekDays }) => {
    const { mutate: createBatchMutation } = useCreateBatch();
    const { data: users } = useAllUsers(); // Allow fetching trainers directly here if not passed

    // Filter trainers locally if needed, or rely on parent. 
    // Let's rely on parent passing context or fetch here. 
    // Parent EnrollStudents has instructorsList. We can fetch here to be self-contained or pass.
    // Passing is cleaner but fetching ensures fresh data. Given the plan, let's fetch or use passed data.
    // Actually EnrollStudents has logic for filtering. Let's filter here too for robustness.
    const usersArray = Array.isArray(users) ? users : [];
    const instructorsList = usersArray.filter(u => (u.role || "").toLowerCase() === "trainer" || (u.role || "").toLowerCase() === "instructor");

    const [batchData, setBatchData] = useState({
        name: "",
        courseId: "",
        daysOfWeek: [],
        classTiming: { startTime: "", endTime: "", timezone: "Asia/Kolkata" },
        meetLink: "",
        startDate: "",
        endDate: "",
        trainers: [] // { trainer: id, assignedModules: [], fromDate, toDate, isCurrent }
    });

    // Fetch full course details when courseId changes to get modules
    const { data: selectedCourse } = useCourse(batchData.courseId);

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "startTime" || name === "endTime") {
            setBatchData(prev => ({
                ...prev,
                classTiming: { ...prev.classTiming, [name]: value }
            }));
        } else {
            setBatchData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDayToggle = (day) => {
        setBatchData(prev => {
            const newDays = prev.daysOfWeek.includes(day)
                ? prev.daysOfWeek.filter(d => d !== day)
                : [...prev.daysOfWeek, day];
            return { ...prev, daysOfWeek: newDays };
        });
    };

    // --- Trainer Logic ---
    const addTrainerRow = () => {
        setBatchData(prev => ({
            ...prev,
            trainers: [
                ...prev.trainers,
                {
                    trainer: "",
                    assignedModules: [],
                    fromDate: "",
                    toDate: "",
                    isCurrent: true
                }
            ]
        }));
    };

    const removeTrainerRow = (index) => {
        setBatchData(prev => ({
            ...prev,
            trainers: prev.trainers.filter((_, i) => i !== index)
        }));
    };

    const updateTrainer = (index, field, value) => {
        setBatchData(prev => {
            const updatedTrainers = prev.trainers.map((t, i) =>
                i === index ? { ...t, [field]: value } : t
            );
            return { ...prev, trainers: updatedTrainers };
        });
    };

    const toggleTrainerModule = (tIndex, mIndex) => {
        setBatchData(prev => {
            const updatedTrainers = prev.trainers.map((t, i) => {
                if (i !== tIndex) return t;

                const currentModules = t.assignedModules || [];
                let newModules;
                if (currentModules.includes(mIndex)) {
                    newModules = currentModules.filter(m => m !== mIndex);
                } else {
                    newModules = [...currentModules, mIndex];
                }
                return { ...t, assignedModules: newModules };
            });
            return { ...prev, trainers: updatedTrainers };
        });
    };

    // Helper to check if a module is already assigned to another trainer
    const isModuleAssignedToOther = (currentTrainerIndex, moduleIndex) => {
        return batchData.trainers.some((trainer, idx) =>
            idx !== currentTrainerIndex && trainer.assignedModules.includes(moduleIndex)
        );
    };

    // --- Submit ---
    const handleSubmit = () => {
        if (!batchData.name || !batchData.courseId) {
            Swal.fire("Error", "Batch Name and Course are required", "error");
            return;
        }

        // transform payload if needed
        const payload = {
            name: batchData.name,
            course: batchData.courseId,
            daysOfWeek: batchData.daysOfWeek,
            classTiming: batchData.classTiming,
            meetLink: batchData.meetLink,
            startDate: batchData.startDate || null,
            endDate: batchData.endDate || null,
            trainers: batchData.trainers
                .filter(t => t.trainer) // remove empty rows
                .map(t => ({
                    trainer: t.trainer,
                    assignedModules: t.assignedModules,
                    fromDate: t.fromDate || null,
                    toDate: t.toDate || null,
                    isCurrent: t.isCurrent
                }))
        };
        console.log("Create Batch Payload:", JSON.stringify(payload, null, 2));

        createBatchMutation(payload, {
            onSuccess: () => {
                Swal.fire("Success", "Batch Created Successfully", "success");
                onClose();
                // Reset form
                setBatchData({
                    name: "",
                    courseId: "",
                    daysOfWeek: [],
                    classTiming: { startTime: "", endTime: "", timezone: "Asia/Kolkata" },
                    meetLink: "",
                    startDate: "",
                    endDate: "",
                    trainers: []
                });
            },
            onError: (err) => {
                Swal.fire("Error", err.response?.data?.message || "Failed to create batch", "error");
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
                <h3 className="modal-title">Create New Batch</h3>

                {/* --- Batch Info --- */}
                <div className="input-grid-2">
                    <div className="modal-field">
                        <label className="modal-label">Batch Name</label>
                        <input
                            name="name"
                            className="modal-input"
                            value={batchData.name}
                            onChange={handleChange}
                            placeholder="e.g. FSD-Morning-01"
                        />
                    </div>
                    <div className="modal-field">
                        <label className="modal-label">Course</label>
                        <select
                            name="courseId"
                            className="modal-input"
                            value={batchData.courseId}
                            onChange={handleChange}
                        >
                            <option value="">Select Course</option>
                            {coursesList.map(c => (
                                <option key={c._id} value={c._id}>{c.courseName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="input-grid-2">
                    <div className="modal-field">
                        <label className="modal-label">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            className="modal-input"
                            value={batchData.startDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="modal-field">
                        <label className="modal-label">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            className="modal-input"
                            value={batchData.endDate}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="input-grid-2">
                    <div className="modal-field">
                        <label className="modal-label">Start Time</label>
                        <input
                            type="time"
                            name="startTime"
                            className="modal-input"
                            value={batchData.classTiming.startTime}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="modal-field">
                        <label className="modal-label">End Time</label>
                        <input
                            type="time"
                            name="endTime"
                            className="modal-input"
                            value={batchData.classTiming.endTime}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="modal-field">
                    <label className="modal-label">Gmeet Link</label>
                    <input
                        name="meetLink"
                        className="modal-input"
                        value={batchData.meetLink}
                        onChange={handleChange}
                    />
                </div>

                <div className="modal-field">
                    <label className="modal-label">Days</label>
                    <div className="days-checkbox-group">
                        {weekDays.map(day => (
                            <label key={day} className="day-checkbox">
                                <input
                                    type="checkbox"
                                    checked={batchData.daysOfWeek.includes(day)}
                                    onChange={() => handleDayToggle(day)}
                                />
                                {day}
                            </label>
                        ))}
                    </div>
                </div>

                {/* --- Trainer Assignments --- */}
                <div style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <h4 style={{ margin: 0 }}>Trainers & Modules</h4>
                        <button
                            onClick={addTrainerRow}
                            style={{ background: "#e0f2fe", color: "#0284c7", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                        >
                            + Add Trainer
                        </button>
                    </div>

                    {batchData.trainers.map((t, index) => (
                        <div key={index} style={{ background: "#f9fafb", padding: "15px", borderRadius: "10px", marginBottom: "15px", border: "1px solid #e5e7eb" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <span onClick={() => removeTrainerRow(index)} style={{ cursor: "pointer", color: "#ef4444", fontSize: "12px" }}>Remove</span>
                            </div>

                            <div className="input-grid-2">
                                <div className="modal-field">
                                    <label className="modal-label">Trainer</label>
                                    <select
                                        className="modal-input"
                                        value={t.trainer}
                                        onChange={(e) => updateTrainer(index, "trainer", e.target.value)}
                                    >
                                        <option value="">Select Trainer</option>
                                        {instructorsList.map(ins => (
                                            <option key={ins._id} value={ins._id}>{ins.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        Is Current?
                                        <input
                                            type="checkbox"
                                            checked={t.isCurrent}
                                            onChange={(e) => updateTrainer(index, "isCurrent", e.target.checked)}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="input-grid-2">
                                <div className="modal-field">
                                    <label className="modal-label">From Date</label>
                                    <input type="date" className="modal-input" value={t.fromDate} onChange={(e) => updateTrainer(index, "fromDate", e.target.value)} />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label">To Date</label>
                                    <input type="date" className="modal-input" value={t.toDate} onChange={(e) => updateTrainer(index, "toDate", e.target.value)} />
                                </div>
                            </div>

                            {/* Module Selection */}
                            {selectedCourse && selectedCourse.modules && (
                                <div className="modal-field">
                                    <label className="modal-label">Assigned Modules</label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                        {selectedCourse.modules.map((mod, modIdx) => {
                                            const isAssignedToOther = isModuleAssignedToOther(index, modIdx);
                                            const isAssignedToCurrent = t.assignedModules.includes(modIdx);
                                            return (
                                                <label
                                                    key={modIdx}
                                                    style={{
                                                        fontSize: "13px",
                                                        padding: "4px 8px",
                                                        background: isAssignedToOther ? "#fee" : "white",
                                                        border: "1px solid #ddd",
                                                        borderRadius: "4px",
                                                        display: "flex",
                                                        gap: "6px",
                                                        alignItems: "center",
                                                        opacity: isAssignedToOther ? 0.6 : 1,
                                                        cursor: isAssignedToOther ? "not-allowed" : "pointer"
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isAssignedToCurrent}
                                                        disabled={isAssignedToOther}
                                                        onChange={() => toggleTrainerModule(index, modIdx)}
                                                        style={{ cursor: isAssignedToOther ? "not-allowed" : "pointer" }}
                                                    />
                                                    {mod.title || `Module ${modIdx + 1}`}
                                                    {isAssignedToOther && <span style={{ fontSize: "10px", color: "#999" }}>(assigned)</span>}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {(!batchData.courseId) && <p style={{ fontSize: "12px", color: "#888" }}>Select a course to see modules</p>}
                        </div>
                    ))}
                    {batchData.trainers.length === 0 && (
                        <p style={{ textAlign: "center", color: "#999", fontSize: "13px" }}>No trainers assigned yet.</p>
                    )}

                </div>

                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="create-btn" onClick={handleSubmit}>Create Batch</button>
                </div>
            </div>
        </div>
    );
};

export default CreateBatchModal;
