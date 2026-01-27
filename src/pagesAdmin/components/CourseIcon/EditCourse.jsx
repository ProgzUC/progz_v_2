import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import "../CreateCourse/CreateCourse.css"; // Reuse styling
import { uploadToCloudinary } from "../../../utils/cloudinary";
import { useCourse, useUpdateCourse, useRollbackCourse } from "../../../hooks/useCourses";
import Swal from "sweetalert2";
import Loader from "../../../components/common/Loader/Loader";
import VersionHistory from "./VersionHistory";

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: fetchedCourse, isLoading: isFetching, isError, error } = useCourse(id);
  const { mutate: updateCourseMutation } = useUpdateCourse();
  const { mutate: rollbackCourseMutation } = useRollbackCourse();

  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [lightbox, setLightbox] = useState({ isOpen: false, type: "", src: "" });
  const [hoveredVideo, setHoveredVideo] = useState(null);

  // Helper to extract YouTube ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    if (fetchedCourse) {
      setCourse({
        courseName: fetchedCourse.courseName || "",
        courseId: fetchedCourse.courseId || "",
        courseDescription: fetchedCourse.courseDescription || "",
        courseDuration: fetchedCourse.courseDuration || "",
        instructor: fetchedCourse.instructor?.[0]?.firstName || "", // Simple display for now
        thumbnail: fetchedCourse.thumbnail || null,
        modules: fetchedCourse.modules.map(mod => ({
          title: mod.title,
          sections: mod.sections.map(sec => ({
            title: sec.sectionName,
            expanded: false,
            // Existing files (saved)
            savedMaterialFiles: sec.learningMaterialFile || [],
            savedChallengeFiles: sec.codeChallengeFile || [],
            // New uploads
            materialFiles: [],
            challengeFiles: [],
            notes: sec.learningMaterialNotes || "",
            challengeInstructions: sec.codeChallengeInstructions || "",
            videos: sec.videoReferences || []
          }))
        }))
      });
    }
  }, [fetchedCourse]);

  const updateField = (field, value) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
  };

  if (isFetching) return <Loader />;
  if (isError) return <div className="error-state">Error: {error?.message}</div>;
  if (!course) return null;

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

  const removeSectionFile = (mIndex, sIndex, field, fileIndex) => {
    const updated = [...course.modules];
    const currentFiles = updated[mIndex].sections[sIndex][field] || [];
    updated[mIndex].sections[sIndex][field] = currentFiles.filter((_, i) => i !== fileIndex);
    setCourse({ ...course, modules: updated });
  };

  const openLightbox = (type, src) => {
    setLightbox({ isOpen: true, type, src });
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

  const handleRollback = (versionId) => {
    setLoading(true);
    rollbackCourseMutation({ courseId: id, versionId }, {
      onSuccess: () => {
        Swal.fire({
          title: "Reverted!",
          text: "Course has been reverted to the selected version.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        setLoading(false);
        setShowHistory(false);
      },
      onError: (err) => {
        Swal.fire("Error", err.message || "Rollback failed", "error");
        setLoading(false);
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Thumbnail (single)
      let thumbnailData = course.thumbnail;
      if (course.thumbnail instanceof File) {
        thumbnailData = await uploadToCloudinary(
          course.thumbnail,
          "courses/thumbnails"
        );
        // Normalize structure if needed, or just pass { url, publicId }
        thumbnailData = { url: thumbnailData.url, publicId: thumbnailData.publicId };
      }

      // 2. Modules & Sections
      const processedModules = await Promise.all(
        course.modules.map(async (mod) => {
          const processedSections = await Promise.all(
            mod.sections.map(async (sec) => {
              // Upload NEW learning materials
              const newMaterialUploads = await Promise.all(
                (sec.materialFiles || []).map((f) =>
                  uploadToCloudinary(f, "courses/materials")
                )
              );
              // Normalize new uploads to match schema { url, publicId, ... }
              const formattedNewMaterials = newMaterialUploads.map(f => ({
                url: f.url,
                publicId: f.publicId,
                fileType: f.format,
                originalName: f.original_filename
              }));

              // Combine SAVED + NEW
              const finalMaterials = [...(sec.savedMaterialFiles || []), ...formattedNewMaterials];

              // Upload NEW challenge files
              const newChallengeUploads = await Promise.all(
                (sec.challengeFiles || []).map((f) =>
                  uploadToCloudinary(f, "courses/challenges")
                )
              );
              const formattedNewChallenges = newChallengeUploads.map(f => ({
                url: f.url,
                publicId: f.publicId,
                fileType: f.format,
                originalName: f.original_filename
              }));

              const finalChallenges = [...(sec.savedChallengeFiles || []), ...formattedNewChallenges];

              return {
                sectionName: sec.title,
                learningMaterialNotes: sec.notes,
                learningMaterialFile: finalMaterials, // ARRAY of objects
                codeChallengeInstructions: sec.challengeInstructions,
                codeChallengeFile: finalChallenges,   // ARRAY of objects
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

      const payload = {
        courseName: course.courseName, // state uses courseName
        courseId: course.courseId,
        courseDescription: course.courseDescription,
        courseDuration: Number(course.courseDuration),
        thumbnail: thumbnailData, // Object or null
        // Instructor update is tricky if we only have a string. 
        // For now, we might leave instructor as is, or not send it if not changed properly.
        // If we want to support updating instructor, we need the ID, not just the name. 
        // Skipping instructor update in payload to prevent breaking it, unless we implement full picker.
        modules: processedModules,
      };

      updateCourseMutation({ id, data: payload }, {
        onSuccess: () => {
          Swal.fire({
            title: "Updated!",
            text: "Course updated successfully!",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });
          navigate("/admin/courses");
        },
        onError: (err) => {
          Swal.fire({
            title: "Error!",
            text: err.message || "Update failed",
            icon: "error",
          });
        }
      });

    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error!",
        text: err.message || "Upload failed",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course-page">
      <div className="create-course-container">
        <div className="page-header">
          <h2>Edit Course</h2>
          <div className="header-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <i
              className="bi bi-clock-history"
              title="Version History"
              style={{ cursor: 'pointer', fontSize: '20px', color: '#555' }}
              onClick={() => setShowHistory(true)}
            ></i>
            <i
              className="bi bi-x-lg close-icon"
              onClick={() => navigate("/admin/courses")}
            ></i>
          </div>
        </div>

        <p className="subtitle">Update your modules and sections</p>

        <p className="subtitle">Update your modules and sections</p>

        {loading && (
          <div className="loading-overlay">
            <Loader />
            <p style={{ marginTop: "10px", fontWeight: "500", color: "#333" }}>Updating Course...</p>
          </div>
        )}

        {/* BASIC FIELDS */}
        <div className="input-grid">
          <div>
            <label>Course Name</label>
            <input
              value={course.courseName}
              onChange={(e) => updateField("courseName", e.target.value)}
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
            value={course.courseDescription}
            onChange={(e) => updateField("courseDescription", e.target.value)}
          />
        </div>

        <div className="input-grid">
          <div>
            <label>Instructor (Read Only)</label>
            <input
              value={course.instructor}
              disabled
              style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
            // onChange={(e) => updateField("instructor", e.target.value)}
            />
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

                                            {/* Existing Files */}
                                            {section.savedMaterialFiles && section.savedMaterialFiles.length > 0 && (
                                              <div className="file-existing-list">
                                                <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Current Files:</p>
                                                {section.savedMaterialFiles.map((f, i) => (
                                                  <div key={i} className="file-preview-mini">
                                                    <a href={f.url} target="_blank" rel="noopener noreferrer">{f.originalName || "File " + (i + 1)}</a>
                                                  </div>
                                                ))}
                                              </div>
                                            )}

                                            <input
                                              type="file"
                                              multiple
                                              accept="image/*,video/*,.pdf,.doc,.docx"
                                              onChange={(e) => {
                                                const newFiles = Array.from(e.target.files);
                                                const existingFiles = section.materialFiles || [];
                                                updateSectionField(
                                                  mIndex,
                                                  sIndex,
                                                  "materialFiles", // New uploads
                                                  [...existingFiles, ...newFiles]
                                                );
                                                e.target.value = ""; // Reset
                                              }}
                                            />

                                            {/* PREVIEW NEW UPLOADS */}
                                            {section.materialFiles && section.materialFiles.length > 0 && (
                                              <div className="file-preview-list">
                                                {section.materialFiles.map((file, idx) => {
                                                  const isImage = file.type.includes("image");
                                                  const isVideo = file.type.includes("video");
                                                  const isPdf = file.type.includes("pdf");

                                                  if (isPdf) {
                                                    return (
                                                      <div key={idx} className="pdf-preview-card" onClick={() => window.open(URL.createObjectURL(file), "_blank")}>
                                                        <span
                                                          className="remove-file-btn"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeSectionFile(mIndex, sIndex, "materialFiles", idx);
                                                          }}
                                                        >×</span>
                                                        <div className="pdf-icon-wrapper">
                                                          <i className="bi bi-file-earmark-pdf text-danger" style={{ fontSize: "24px" }}></i>
                                                        </div>
                                                        <span className="pdf-filename" title={file.name}>{file.name}</span>
                                                      </div>
                                                    )
                                                  }

                                                  const isMedia = isImage || isVideo;
                                                  return (
                                                    <div key={idx} className={`file-preview ${isMedia ? 'file-preview-media' : 'file-preview-chip'}`}>
                                                      <span className="remove-file-btn" onClick={() => removeSectionFile(mIndex, sIndex, "materialFiles", idx)}>×</span>

                                                      {/* MEDIA PREVIEW */}
                                                      {isMedia ? (
                                                        <>
                                                          {isImage && (
                                                            <div className="image-preview-wrapper" onClick={() => openLightbox("image", URL.createObjectURL(file))}>
                                                              <img
                                                                src={URL.createObjectURL(file)}
                                                                className="preview-image-consistent"
                                                                alt="preview"
                                                              />
                                                            </div>
                                                          )}
                                                          {isVideo && (
                                                            <video controls className="preview-video" style={{ height: '50px', marginTop: '5px', borderRadius: '4px' }}>
                                                              <source src={URL.createObjectURL(file)} />
                                                            </video>
                                                          )}
                                                          <p className="file-name-media" title={file.name}>{file.name}</p>
                                                        </>
                                                      ) : (
                                                        /* FILE CHIP */
                                                        <span className="file-chip-text" title={file.name}>{file.name}</span>
                                                      )}
                                                    </div>
                                                  );
                                                })}
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
                                            {/* Existing Files */}
                                            {section.savedChallengeFiles && section.savedChallengeFiles.length > 0 && (
                                              <div className="file-existing-list">
                                                <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Current Files:</p>
                                                {section.savedChallengeFiles.map((f, i) => (
                                                  <div key={i} className="file-preview-mini">
                                                    <a href={f.url} target="_blank" rel="noopener noreferrer">{f.originalName || "File " + (i + 1)}</a>
                                                  </div>
                                                ))}
                                              </div>
                                            )}

                                            <input
                                              type="file"
                                              multiple
                                              accept="image/*,video/*,.pdf,.doc,.docx"
                                              onChange={(e) => {
                                                const newFiles = Array.from(e.target.files);
                                                const existingFiles = section.challengeFiles || [];
                                                updateSectionField(
                                                  mIndex,
                                                  sIndex,
                                                  "challengeFiles",
                                                  [...existingFiles, ...newFiles]
                                                );
                                                e.target.value = "";
                                              }}
                                            />

                                            {/* CHALLENGE FILES PREVIEW */}
                                            {section.challengeFiles && section.challengeFiles.length > 0 && (
                                              <div className="file-preview-list">
                                                {section.challengeFiles.map((file, idx) => {
                                                  const isImage = file.type.includes("image");
                                                  const isVideo = file.type.includes("video");
                                                  const isPdf = file.type.includes("pdf");

                                                  if (isPdf) {
                                                    return (
                                                      <div key={idx} className="pdf-preview-card" onClick={() => window.open(URL.createObjectURL(file), "_blank")}>
                                                        <span
                                                          className="remove-file-btn"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeSectionFile(mIndex, sIndex, "challengeFiles", idx);
                                                          }}
                                                        >×</span>
                                                        <div className="pdf-icon-wrapper">
                                                          <i className="bi bi-file-earmark-pdf text-danger" style={{ fontSize: "24px" }}></i>
                                                        </div>
                                                        <span className="pdf-filename" title={file.name}>{file.name}</span>
                                                      </div>
                                                    )
                                                  }

                                                  const isMedia = isImage || isVideo;
                                                  return (
                                                    <div key={idx} className={`file-preview ${isMedia ? 'file-preview-media' : 'file-preview-chip'}`}>
                                                      <span className="remove-file-btn" onClick={() => removeSectionFile(mIndex, sIndex, "challengeFiles", idx)}>×</span>

                                                      {/* MEDIA PREVIEW */}
                                                      {isMedia ? (
                                                        <>
                                                          {isImage && (
                                                            <div className="image-preview-wrapper" onClick={() => openLightbox("image", URL.createObjectURL(file))}>
                                                              <img
                                                                src={URL.createObjectURL(file)}
                                                                className="preview-image-consistent"
                                                                alt="preview"
                                                              />
                                                            </div>
                                                          )}
                                                          {isVideo && (
                                                            <video controls className="preview-video" style={{ height: '50px', marginTop: '5px', borderRadius: '4px' }}>
                                                              <source src={URL.createObjectURL(file)} />
                                                            </video>
                                                          )}
                                                          <p className="file-name-media" title={file.name}>{file.name}</p>
                                                        </>
                                                      ) : (
                                                        /* FILE CHIP */
                                                        <span className="file-chip-text" title={file.name}>{file.name}</span>
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}

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

                                            <div className="video-list-container" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                              {section.videos.map(
                                                (v, i) => {
                                                  const params = getYouTubeId(v);
                                                  const isHovered = hoveredVideo?.mIndex === mIndex && hoveredVideo?.sIndex === sIndex && hoveredVideo?.vIndex === i;

                                                  return (
                                                    <div
                                                      key={i}
                                                      className="video-item-wrapper"
                                                      onMouseEnter={() => setHoveredVideo({ mIndex, sIndex, vIndex: i })}
                                                      onMouseLeave={() => setHoveredVideo(null)}
                                                      onClick={() => openLightbox("video", params)}
                                                    >
                                                      <span
                                                        className="remove-video-btn"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          const updatedVideos = section.videos.filter((_, vidIdx) => vidIdx !== i);
                                                          updateSectionField(mIndex, sIndex, "videos", updatedVideos);
                                                        }}
                                                      >×</span>

                                                      {params ? (
                                                        <>
                                                          {isHovered ? (
                                                            <iframe
                                                              className="video-preview-iframe"
                                                              src={`https://www.youtube.com/embed/${params}?autoplay=1&mute=1&controls=0&modestbranding=1`}
                                                              title="YouTube video player"
                                                              frameBorder="0"
                                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                              style={{ pointerEvents: 'none' }}
                                                            ></iframe>
                                                          ) : (
                                                            <img
                                                              src={`https://img.youtube.com/vi/${params}/mqdefault.jpg`}
                                                              alt="Video Thumbnail"
                                                              className="video-preview-thumb"
                                                            />
                                                          )}
                                                        </>
                                                      ) : (
                                                        <p className="video-item error-text" style={{ fontSize: '12px' }}>Invalid: {v}</p>
                                                      )}
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
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

          <button className="submit-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <VersionHistory
        courseId={id}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onRollback={handleRollback}
      />
    </div>
  );
};

export default EditCourse;
