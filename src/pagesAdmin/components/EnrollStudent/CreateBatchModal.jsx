import React, { useState } from "react";
import Swal from "sweetalert2";
import { useCreateBatch } from "../../../hooks/useBatches";
import { useCourse } from "../../../hooks/useCourses";
import { useAllUsers } from "../../../hooks/useAdminUsers";
import { getErrorMessage } from "../../../utils/apiError";
import {
    emptyBatchForm,
    emptyTrainerRow,
    toBatchApiPayload,
    isTrainerRole,
} from "../../../features/batches/batchFormState";
import CourseMultiSelect from "../Batches/CourseMultiSelect";
import "../Modal.css";
import "./EnrollStudents.css";

const CreateBatchModal = ({ isOpen, onClose, coursesList, weekDays }) => {
    const { mutate: createBatchMutation } = useCreateBatch();
    const { data: users } = useAllUsers();

    const usersArray = Array.isArray(users) ? users : [];
    const instructorsList = usersArray.filter(isTrainerRole);

    const [batchData, setBatchData] = useState(emptyBatchForm);

    const primaryCourseId = batchData.courseIds[0] || "";
    const { data: selectedCourse } = useCourse(primaryCourseId);

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

    const handleCourseToggle = (courseId) => {
        setBatchData(prev => {
            const id = String(courseId);
            const exists = prev.courseIds.includes(id);
            const courseIds = exists
                ? prev.courseIds.filter((c) => c !== id)
                : [...prev.courseIds, id];
            const primaryChanged = (courseIds[0] || "") !== (prev.courseIds[0] || "");
            return {
                ...prev,
                courseIds,
                trainers: primaryChanged
                    ? prev.trainers.map((t) => ({ ...t, assignedModules: [] }))
                    : prev.trainers,
            };
        });
    };

    const allCoursesSelected =
        coursesList.length > 0 &&
        coursesList.every((c) => batchData.courseIds.includes(String(c._id)));

    const handleToggleAllCourses = () => {
        setBatchData(prev => ({
            ...prev,
            courseIds: allCoursesSelected ? [] : coursesList.map((c) => String(c._id)),
            trainers: prev.trainers.map((t) => ({ ...t, assignedModules: [] })),
        }));
    };

    const handleDayToggle = (day) => {
        setBatchData(prev => {
            const newDays = prev.daysOfWeek.includes(day)
                ? prev.daysOfWeek.filter(d => d !== day)
                : [...prev.daysOfWeek, day];
            return { ...prev, daysOfWeek: newDays };
        });
    };

    const allDaysSelected = weekDays.every(day => batchData.daysOfWeek.includes(day));

    const handleToggleAllDays = () => {
        setBatchData(prev => ({
            ...prev,
            daysOfWeek: allDaysSelected ? [] : [...weekDays]
        }));
    };

    const addTrainerRow = () => {
        setBatchData(prev => ({
            ...prev,
            trainers: [...prev.trainers, emptyTrainerRow()]
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

    const isModuleAssignedToOther = (currentTrainerIndex, moduleIndex) => {
        return batchData.trainers.some((trainer, idx) =>
            idx !== currentTrainerIndex && trainer.assignedModules.includes(moduleIndex)
        );
    };

    const handleSubmit = () => {
        if (!batchData.name.trim()) {
            Swal.fire("Error", "Batch Name is required", "error");
            return;
        }
        if (!batchData.courseIds.length) {
            Swal.fire("Error", "Please select at least one course", "error");
            return;
        }
        if (!batchData.startDate || !batchData.endDate) {
            Swal.fire("Error", "Start and End dates are required", "error");
            return;
        }

        if (new Date(batchData.endDate) < new Date(batchData.startDate)) {
            Swal.fire("Error", "End date cannot be before start date", "error");
            return;
        }

        if (!batchData.classTiming.startTime || !batchData.classTiming.endTime) {
            Swal.fire("Error", "Class start and end times are required", "error");
            return;
        }
        if (batchData.classTiming.endTime <= batchData.classTiming.startTime) {
            Swal.fire("Error", "Class end time must be after start time", "error");
            return;
        }

        if (batchData.daysOfWeek.length === 0) {
            Swal.fire("Error", "Please select at least one day for the batch", "error");
            return;
        }

        for (let i = 0; i < batchData.trainers.length; i++) {
            const t = batchData.trainers[i];
            if (!t.trainer) {
                Swal.fire("Error", `Please select a trainer for row ${i + 1}`, "error");
                return;
            }
            if (t.fromDate && t.toDate && new Date(t.toDate) < new Date(t.fromDate)) {
                Swal.fire("Error", `Trainer ${i + 1}: End date cannot be before start date`, "error");
                return;
            }
        }

        const payload = toBatchApiPayload(batchData);

        createBatchMutation(payload, {
            onSuccess: () => {
                Swal.fire("Success", "Batch Created Successfully", "success");
                onClose();
                setBatchData(emptyBatchForm());
            },
            onError: (err) => {
                Swal.fire("Error", getErrorMessage(err, "Failed to create batch"), "error");
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
                <h3 className="modal-title">Create New Batch</h3>

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
                    <label className="modal-label">Courses</label>
                    <CourseMultiSelect
                        coursesList={coursesList}
                        selectedIds={batchData.courseIds}
                        onToggle={handleCourseToggle}
                        onToggleAll={handleToggleAllCourses}
                    />
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
                        <label className="day-checkbox">
                            <input
                                type="checkbox"
                                checked={allDaysSelected}
                                onChange={handleToggleAllDays}
                            />
                            (all)
                        </label>
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

                            {selectedCourse && selectedCourse.modules && (
                                <div className="modal-field">
                                    <label className="modal-label">
                                        Assigned Modules
                                        {batchData.courseIds.length > 1 && selectedCourse.courseName && (
                                            <span style={{ fontWeight: 400, color: "#6b7280", marginLeft: 8 }}>
                                                (from {selectedCourse.courseName})
                                            </span>
                                        )}
                                    </label>
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
                            {(!batchData.courseIds.length) && <p style={{ fontSize: "12px", color: "#888" }}>Select a course to see modules</p>}
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
