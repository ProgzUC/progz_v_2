import React, { useState, useEffect } from "react";
import "./EditCourse.css";
import { BiX, BiTrash, BiChevronDown, BiGridVertical, BiPlus } from "react-icons/bi";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const EditCourse = ({ courseData, onCancel, onSave }) => {
    const [course, setCourse] = useState(courseData || {
        title: "",
        courseId: "",
        description: "",
        modules: []
    });

    useEffect(() => {
        if (courseData) {
            setCourse(courseData);
        }
    }, [courseData]);

    const updateField = (field, value) => {
        setCourse((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(course);
    };

    return (
        <div className="edit-course-overlay">
            <div className="edit-course-container">
                <div className="edit-header">
                    <h2>Edit Course</h2>
                    <button className="close-btn" onClick={onCancel}><BiX /></button>
                </div>

                <div className="edit-body">
                    <div className="form-group">
                        <label>Course Name</label>
                        <input
                            value={course.title || course.name || ""}
                            onChange={(e) => updateField("title", e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={course.description || ""}
                            onChange={(e) => updateField("description", e.target.value)}
                        />
                    </div>

                    <div className="placeholder-module-msg">
                        <p>Module editing is under construction. You can edit basic details for now.</p>
                    </div>
                </div>

                <div className="edit-footer">
                    <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                    <button className="save-btn" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default EditCourse;
