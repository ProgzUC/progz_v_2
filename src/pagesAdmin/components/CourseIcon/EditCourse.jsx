import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import "../CreateCourse/CreateCourse.css"; // Reuse styling
import "./EditCourse.css"; // Empty for now, generic overrides

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Initial Mock Data (Simulating a fetched course)
  const initialData = {
    name: "RPA Automation",
    courseId: "CRS-RPA-001",
    description: "Learn robotic process automation from scratch.",
    duration: "40",
    instructor: "John Doe",
    modules: [
      {
        title: "Introduction to RPA",
        sections: [
          {
            title: "What is RPA?",
            expanded: false,
            materialFile: null,
            notes: "Basic concepts.",
            challengeFile: null,
            challengeInstructions: "Define RPA in your own words.",
            videos: ["https://youtu.be/example1"],
          },
          {
            title: "RPA Tools",
            expanded: false,
            materialFile: null,
            notes: "Overview of UiPath, BluePrism.",
            challengeFile: null,
            challengeInstructions: "",
            videos: [],
          },
        ],
      },
      {
        title: "Advanced Workflow",
        sections: [],
      },
    ],
  };

  const [course, setCourse] = useState(initialData);

  const updateField = (field, value) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
  };

  // ===============
  // DRAG & DROP
  // ===============

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === "module") {
      const reordered = Array.from(course.modules);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);

      setCourse((prev) => ({ ...prev, modules: reordered }));
    }

    if (type === "section") {
      const modIdx = +source.droppableId;
      const updated = [...course.modules];

      const items = Array.from(updated[modIdx].sections);
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);

      updated[modIdx].sections = items;
      setCourse((prev) => ({ ...prev, modules: updated }));
    }
  };

  // ===============
  // MODULE HANDLERS
  // ===============

  const addModule = () => {
    setCourse((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        { title: "", sections: [] },
      ],
    }));
  };

  const removeModule = (index) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const updateModuleTitle = (index, value) => {
    const updated = [...course.modules];
    updated[index].title = value;
    setCourse({ ...course, modules: updated });
  };

  // =================
  // SECTION HANDLERS
  // =================

  const addSection = (mIndex) => {
    const updated = [...course.modules];
    updated[mIndex].sections.push({
      title: "",
      expanded: false,
      materialFile: null,
      notes: "",
      challengeFile: null,
      challengeInstructions: "",
      videos: [],
    });
    setCourse({ ...course, modules: updated });
  };

  const removeSection = (mIndex, sIndex) => {
    const updated = [...course.modules];
    updated[mIndex].sections.splice(sIndex, 1);
    setCourse({ ...course, modules: updated });
  };

  const toggleSection = (mIndex, sIndex) => {
    const updated = [...course.modules];
    updated[mIndex].sections[sIndex].expanded =
      !updated[mIndex].sections[sIndex].expanded;
    setCourse({ ...course, modules: updated });
  };

  const updateSectionField = (mIndex, sIndex, field, value) => {
    const updated = [...course.modules];
    updated[mIndex].sections[sIndex][field] = value;
    setCourse({ ...course, modules: updated });
  };

  const addVideo = (mIndex, sIndex) => {
    const link = prompt("Enter video link");
    if (!link) return;

    updateSectionField(mIndex, sIndex, "videos", [
      ...course.modules[mIndex].sections[sIndex].videos,
      link,
    ]);
  };

  // =================
  // SUBMIT
  // =================

  const handleSave = () => {
    console.log("Saving Course Updates:", course);
    // Logic to update backend would go here
    navigate(-1);
  };

  return (
    <div className="create-course-page">
      <div className="create-course-container">
        <div className="page-header">
          <h2>Edit Course</h2>
          <i
            className="bi bi-x-lg close-icon"
            onClick={() => navigate("/dashboard/courses")}
          ></i>
        </div>

        <p className="subtitle">Update your modules and sections</p>

        {/* BASIC FIELDS */}
        <div className="input-grid">
          <div>
            <label>Course Name</label>
            <input
              value={course.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div>
            <label>Course ID</label>
            <input
              value={course.courseId}
              onChange={(e) => updateField("courseId", e.target.value)}
              disabled // ID usually not editable
              style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
            />
          </div>
        </div>

        <div className="input-full">
          <label>Course Description</label>
          <textarea
            value={course.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        <div className="input-grid">
          <div>
            <label>Instructor</label>
            <input
              value={course.instructor}
              onChange={(e) => updateField("instructor", e.target.value)}
            />
          </div>

          <div>
            <label>Duration (Hours)</label>
            <input
              type="number"
              value={course.duration}
              onChange={(e) => updateField("duration", e.target.value)}
            />
          </div>
        </div>

        {/* MODULES + DND */}
        <div className="section-header">
          <h3>Modules</h3>
          <button className="add-btn" onClick={addModule}>
            + Add Module
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="modules" type="module">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {course.modules.map((module, mIndex) => (
                  <Draggable
                    draggableId={`module-${mIndex}`}
                    index={mIndex}
                    key={mIndex}
                  >
                    {(provided) => (
                      <div
                        className="module-box"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <div className="module-header-wrapper">
                          <div
                            className="drag-handle"
                            {...provided.dragHandleProps}
                          >
                            <i className="bi bi-grip-vertical"></i>
                          </div>

                          <div className="module-content">
                            <label className="module-label">Modules {mIndex + 1}</label>
                            <div className="module-title-row">
                              <input
                                value={module.title}
                                onChange={(e) =>
                                  updateModuleTitle(mIndex, e.target.value)
                                }
                                placeholder="Enter module name"
                              />
                              <i
                                className="bi bi-trash module-delete"
                                onClick={() => removeModule(mIndex)}
                              ></i>
                            </div>
                          </div>
                        </div>

                        <button
                          className="add-section-btn"
                          onClick={() => addSection(mIndex)}
                        >
                          + Add Section
                        </button>

                        {/* SECTIONS */}
                        <Droppable
                          droppableId={`${mIndex}`}
                          type="section"
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {module.sections.map(
                                (section, sIndex) => (
                                  <Draggable
                                    draggableId={`sec-${mIndex}-${sIndex}`}
                                    index={sIndex}
                                    key={sIndex}
                                  >
                                    {(provided) => (
                                      <div
                                        className="section-block"
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                      >
                                        <div className="section-header-wrapper">
                                          <div
                                            className="drag-handle-sec"
                                            {...provided.dragHandleProps}
                                          >
                                            <i className="bi bi-grip-vertical"></i>
                                          </div>

                                          <div className="section-content">
                                            <div className="section-header-row">
                                              <input
                                                value={section.title}
                                                onChange={(e) =>
                                                  updateSectionField(
                                                    mIndex,
                                                    sIndex,
                                                    "title",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Enter section name"
                                              />

                                              <i
                                                className={`bi bi-chevron-down section-chevron ${section.expanded
                                                    ? "rotate"
                                                    : ""
                                                  }`}
                                                onClick={() =>
                                                  toggleSection(
                                                    mIndex,
                                                    sIndex
                                                  )
                                                }
                                              ></i>

                                              <i
                                                className="bi bi-trash section-delete"
                                                onClick={() =>
                                                  removeSection(
                                                    mIndex,
                                                    sIndex
                                                  )
                                                }
                                              ></i>
                                            </div>
                                          </div>
                                        </div>

                                        {/* EXPANDED DETAILS */}
                                        {section.expanded && (
                                          <div className="section-details">
                                            <label>
                                              Learning Material File
                                            </label>
                                            <input
                                              type="file"
                                              onChange={(e) =>
                                                updateSectionField(
                                                  mIndex,
                                                  sIndex,
                                                  "materialFile",
                                                  e.target.files[0]
                                                )
                                              }
                                            />

                                            {/* PREVIEW */}
                                            {section.materialFile && (
                                              <div className="file-preview">
                                                <p>
                                                  Selected:{" "}
                                                  {
                                                    section
                                                      .materialFile
                                                      .name
                                                  }
                                                </p>

                                                {section.materialFile.type.includes(
                                                  "image"
                                                ) && (
                                                    <img
                                                      src={URL.createObjectURL(
                                                        section.materialFile
                                                      )}
                                                      className="preview-image"
                                                    />
                                                  )}

                                                {section.materialFile.type.includes(
                                                  "video"
                                                ) && (
                                                    <video
                                                      controls
                                                      className="preview-video"
                                                    >
                                                      <source
                                                        src={URL.createObjectURL(
                                                          section.materialFile
                                                        )}
                                                      />
                                                    </video>
                                                  )}
                                              </div>
                                            )}

                                            <label>
                                              Learning Notes
                                            </label>
                                            <textarea
                                              value={section.notes}
                                              onChange={(e) =>
                                                updateSectionField(
                                                  mIndex,
                                                  sIndex,
                                                  "notes",
                                                  e.target.value
                                                )
                                              }
                                            />

                                            <label>
                                              Challenge File
                                            </label>
                                            <input
                                              type="file"
                                              onChange={(e) =>
                                                updateSectionField(
                                                  mIndex,
                                                  sIndex,
                                                  "challengeFile",
                                                  e.target.files[0]
                                                )
                                              }
                                            />

                                            <label>
                                              Challenge Instructions
                                            </label>
                                            <textarea
                                              value={
                                                section.challengeInstructions
                                              }
                                              onChange={(e) =>
                                                updateSectionField(
                                                  mIndex,
                                                  sIndex,
                                                  "challengeInstructions",
                                                  e.target.value
                                                )
                                              }
                                            />

                                            <div className="video-add-row">
                                              <label>
                                                Video References
                                              </label>
                                              <span
                                                className="add-video-btn"
                                                onClick={() =>
                                                  addVideo(
                                                    mIndex,
                                                    sIndex
                                                  )
                                                }
                                              >
                                                + Add Video
                                              </span>
                                            </div>

                                            {/* VIDEO LIST */}
                                            {section.videos.map(
                                              (v, i) => (
                                                <p
                                                  className="video-item"
                                                  key={i}
                                                >
                                                  {v}
                                                </p>
                                              )
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                )
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* FOOTER */}
        <div className="footer-actions">
          <button
            className="cancel-btn"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>

          <button className="submit-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;
