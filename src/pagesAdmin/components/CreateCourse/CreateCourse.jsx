import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import "./CreateCourse.css";
import { uploadToCloudinary } from "../../../utils/cloudinary";
import api from "../../../api/axiosInstance";

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [course, setCourse] = useState({
    courseName: "",
    courseId: "",
    courseDescription: "",
    courseDuration: "",
    instructor: "", // This will be handled by backend mostly but keeping field if needed
    thumbnail: null, // File object
    modules: [
      {
        title: "",
        sections: [
          {
            title: "",
            expanded: false,
            materialFile: null,
            notes: "",
            challengeFile: null,
            challengeInstructions: "",
            videos: [],
          },
        ],
      },
    ],
  });

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

    const updated = [...course.modules];
    // VideoReferences in schema is array of strings
    updated[mIndex].sections[sIndex].videos.push(link);
    setCourse({ ...course, modules: updated });
  };

  // =================
  // SUBMIT
  // =================

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Upload Thumbnail
      let thumbnailData = null;
      if (course.thumbnail instanceof File) {
        thumbnailData = await uploadToCloudinary(course.thumbnail);
      } else {
        // If it's already a URL or object (unlikely in create flow but good practice)
        thumbnailData = course.thumbnail;
      }

      // 2. Process Modules & Sections (Upload files)
      // We need to map over modules and sections and perform async uploads
      const processedModules = await Promise.all(
        course.modules.map(async (mod) => {
          const processedSections = await Promise.all(
            mod.sections.map(async (sec) => {
              // Upload Learning Material
              let materialData = null;
              if (sec.materialFile instanceof File) {
                materialData = await uploadToCloudinary(sec.materialFile);
              }

              // Upload Challenge File
              let challengeData = null;
              if (sec.challengeFile instanceof File) {
                challengeData = await uploadToCloudinary(sec.challengeFile);
              }

              return {
                sectionName: sec.title,
                learningMaterialNotes: sec.notes,
                learningMaterialFile: materialData, // Object { url, publicId, ... }
                codeChallengeInstructions: sec.challengeInstructions,
                codeChallengeFile: challengeData,   // Object
                videoReferences: sec.videos,
              };
            })
          );

          return {
            title: mod.title,
            sections: processedSections,
          };
        })
      );

      // 3. Construct Final Payload
      // Note: Backend expects 'courseName', 'courseDescription', etc.
      // And 'thumbnail' as object { url, publicId }
      const payload = {
        courseName: course.courseName, // Changed from name to courseName in state
        courseId: course.courseId,
        courseDescription: course.courseDescription, // Changed from description
        courseDuration: course.courseDuration, // Changed from duration
        // instructor: course.instructor, // Let backend assign current user or send if needed
        thumbnail: thumbnailData ? { url: thumbnailData.url, publicId: thumbnailData.publicId } : null,
        modules: processedModules,
      };

      console.log("Submitting Course Payload:", payload);

      // 4. Send to Backend
      await api.post("/courses", payload);

      alert("Course created successfully!");
      navigate("/admin/courses"); // Redirect to courses list
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course-page">
      <div className="create-course-container">
        <div className="page-header">
          <h2>Create Course</h2>
          <i
            className="bi bi-x-lg close-icon"
            onClick={() => navigate("/admin/courses")}
          ></i>
        </div>

        <p className="subtitle">Build your modules and sections</p>

        {loading && <div className="loading-overlay">Creating Course... Please wait...</div>}

        {/* BASIC FIELDS */}
        <div className="input-grid">
          <div>
            <label>Course Name</label>
            <input
              value={course.courseName}
              onChange={(e) => updateField("courseName", e.target.value)}
              placeholder="e.g. Advanced React"
            />
          </div>

          <div>
            <label>Course ID</label>
            <input
              value={course.courseId}
              onChange={(e) => updateField("courseId", e.target.value)}
              placeholder="e.g. REACT_ADV_001"
            />
          </div>
        </div>

        <div className="input-full">
          <label>Course Description</label>
          <textarea
            value={course.courseDescription}
            onChange={(e) => updateField("courseDescription", e.target.value)}
          />
        </div>

        <div className="input-grid">
          {/* Thumbnail Upload */}
          <div>
            <label>Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => updateField("thumbnail", e.target.files[0])}
            />
            {course.thumbnail && course.thumbnail instanceof File && (
              <div className="file-preview-mini">
                <img src={URL.createObjectURL(course.thumbnail)} alt="Preview" className="preview-image-mini" style={{ height: '50px', marginTop: '5px' }} />
                <span>{course.thumbnail.name}</span>
              </div>
            )}
          </div>

          <div>
            <label>Duration (Hours)</label>
            <input
              type="number"
              value={course.courseDuration}
              onChange={(e) => updateField("courseDuration", e.target.value)}
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
                            <label className="module-label">Module {mIndex + 1}</label>
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

                                              <div className="section-actions">
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
            onClick={() => navigate("/admin/courses")}
          >
            Cancel
          </button>

          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Course"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
