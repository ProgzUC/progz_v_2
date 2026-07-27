import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateCourse.css";
import "../../../components/common/ModuleNavigator/ModuleNavigator.css";
import { uploadToCloudinary } from "../../../utils/cloudinary";
import api from "../../../api/axiosInstance";
import { confirmDelete } from "../../../utils/confirmDelete";
import { showSuccess, showError, showWarning } from "../../../utils/toast";
import Loader from "../../../components/common/Loader/Loader";
import SortableList from "../../../components/common/Sortable/SortableList";
import SortableItem from "../../../components/common/Sortable/SortableItem";
import FileDropZone from "../../../components/common/FileDropZone/FileDropZone";
import ModuleNavigator from "../../../components/common/ModuleNavigator/ModuleNavigator";
import CoursePreviewModal from "../../../components/common/CoursePreviewModal/CoursePreviewModal";
import RichTextEditor from "../../../components/common/RichTextEditor/RichTextEditor";
import { isHtmlEmpty } from "../../../components/common/RichTextEditor/richTextUtils";
import { COURSE_FILE_ACCEPT } from "../../../utils/fileDrop";
import {
  createEmptyModule,
  createEmptySection,
} from "../../../utils/courseBuilder";

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [lightbox, setLightbox] = useState({ isOpen: false, type: "", src: "" });
  const [hoveredVideo, setHoveredVideo] = useState(null); // { mIndex, sIndex, vIndex }
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const moduleRefs = useRef({});

  // Helper to extract YouTube ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!course.courseName.trim()) newErrors.courseName = "Course Name is required";
    if (isHtmlEmpty(course.courseDescription)) newErrors.courseDescription = "Course Description is required";
    if (!course.courseDuration) newErrors.courseDuration = "Duration is required";
    if (!course.thumbnail) newErrors.thumbnail = "Thumbnail Image is required";

    course.modules.forEach((mod, mIndex) => {
      if (!mod.title.trim()) newErrors[`module-${mIndex}`] = "Module Name is required";
      mod.sections.forEach((sec, sIndex) => {
        if (!sec.title.trim()) newErrors[`section-${mIndex}-${sIndex}`] = "Section Name is required";
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [course, setCourse] = useState({
    courseName: "",
    courseId: "",
    courseDescription: "",
    courseDuration: "",
    instructor: "", // This will be handled by backend mostly but keeping field if needed
    thumbnail: null, // File object
    modules: [createEmptyModule()],
  });

  const updateField = (field, value) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // ===============
  // MODULE HANDLERS
  // ===============

  const goToModule = (index) => {
    setActiveModuleIndex(index);
    requestAnimationFrame(() => {
      const moduleId = course.modules[index]?.id;
      moduleRefs.current[moduleId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  const addModule = () => {
    setCourse((prev) => ({
      ...prev,
      modules: [...prev.modules, createEmptyModule()],
    }));
    setActiveModuleIndex(course.modules.length);
  };

  const removeModule = async (index) => {
    const moduleName = course.modules[index]?.title?.trim() || `Module ${index + 1}`;
    const confirmed = await confirmDelete(
      "Delete Module?",
      `Are you sure you want to delete "${moduleName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
    setActiveModuleIndex((prev) => {
      if (prev === index) return Math.max(0, index - 1);
      if (prev > index) return prev - 1;
      return prev;
    });
    showSuccess("Module deleted");
  };

  const updateModuleTitle = (index, value) => {
    const updated = [...course.modules];
    updated[index].title = value;
    setCourse({ ...course, modules: updated });
    if (errors[`module-${index}`]) {
      setErrors((prev) => ({ ...prev, [`module-${index}`]: null }));
    }
  };

  // =================
  // SECTION HANDLERS
  // =================

  const addSection = (mIndex) => {
    const updated = [...course.modules];
    updated[mIndex].sections.push(createEmptySection());
    setCourse({ ...course, modules: updated });
  };


  const removeSection = async (mIndex, sIndex) => {
    const sectionName =
      course.modules[mIndex]?.sections[sIndex]?.title?.trim() || `Section ${sIndex + 1}`;
    const confirmed = await confirmDelete(
      "Delete Section?",
      `Are you sure you want to delete "${sectionName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    const updated = [...course.modules];
    updated[mIndex].sections.splice(sIndex, 1);
    setCourse({ ...course, modules: updated });
    showSuccess("Section deleted");
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
    if (field === "title" && errors[`section-${mIndex}-${sIndex}`]) {
      setErrors((prev) => ({ ...prev, [`section-${mIndex}-${sIndex}`]: null }));
    }
  };

  const removeSectionFile = (mIndex, sIndex, field, fileIndex) => {
    const updated = [...course.modules];
    const currentFiles = updated[mIndex].sections[sIndex][field] || [];
    updated[mIndex].sections[sIndex][field] = currentFiles.filter((_, i) => i !== fileIndex);
    setCourse({ ...course, modules: updated });
  };

  const addVideo = (mIndex, sIndex) => {
    const link = prompt("Enter video link (YouTube only)");
    if (!link) return;

    if (!getYouTubeId(link)) {
      showError("Please enter a valid YouTube URL (youtube.com or youtu.be)");
      return;
    }

    const updated = [...course.modules];
    // VideoReferences in schema is array of strings
    updated[mIndex].sections[sIndex].videos.push(link);
    setCourse({ ...course, modules: updated });
  };

  const removeVideo = (mIndex, sIndex, vIndex) => {
    const updated = [...course.modules];
    updated[mIndex].sections[sIndex].videos = updated[mIndex].sections[sIndex].videos.filter((_, i) => i !== vIndex);
    setCourse({ ...course, modules: updated });
  };

  const openLightbox = (type, src) => {
    setLightbox({ isOpen: true, type, src });
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, type: "", src: "" });
  };

  // =================
  // PREVIEW + SUBMIT
  // =================

  const handlePreview = () => {
    if (!validateForm()) {
      showWarning("Please fill all required fields correctly.");
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showWarning("Please fill all required fields correctly.");
      return;
    }
    setLoading(true);
    try {
      // 1. Thumbnail (single)
      let thumbnailData = null;
      if (course.thumbnail instanceof File) {
        thumbnailData = await uploadToCloudinary(
          course.thumbnail,
          "courses/thumbnails"
        );
      }

      // 2. Modules & Sections
      const processedModules = await Promise.all(
        course.modules.map(async (mod) => {
          const processedSections = await Promise.all(
            mod.sections.map(async (sec) => {
              // Upload multiple learning materials
              const materialUploads = await Promise.all(
                (sec.materialFiles || []).map((f) =>
                  uploadToCloudinary(f, "courses/materials")
                )
              );

              // Upload multiple challenge files
              const challengeUploads = await Promise.all(
                (sec.challengeFiles || []).map((f) =>
                  uploadToCloudinary(f, "courses/challenges")
                )
              );

              return {
                sectionName: sec.title,
                learningMaterialNotes: sec.notes,
                learningMaterialFile: materialUploads, // ARRAY
                codeChallengeInstructions: sec.challengeInstructions,
                codeChallengeFile: challengeUploads,   // ARRAY
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
        courseName: course.courseName,
        courseId: course.courseId,
        courseDescription: course.courseDescription,
        courseDuration: Number(course.courseDuration),
        thumbnail: thumbnailData
          ? { url: thumbnailData.url, publicId: thumbnailData.publicId }
          : null,
        modules: processedModules,
      };

      await api.post("/courses", payload);

      showSuccess("Course created successfully!");
      setShowPreview(false);
      navigate("/admin/courses");
    } catch (err) {
      console.error(err);
      showError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-course-page">
      <div className="create-course-container">
        <div className="page-header">
          <h2>Create Course</h2>
          <i
            className="bi bi-x-lg close-icon"
            onClick={() => navigate("/admin/courses")}
          ></i>
        </div>

        <p className="subtitle">Build your modules and sections</p>

        {loading && <Loader />}

        {/* BASIC FIELDS */}
        <div className="input-grid">
          <div>
            <label>Course Name</label>
            <input
              value={course.courseName}
              onChange={(e) => updateField("courseName", e.target.value)}
              placeholder="e.g. Advanced React"
            />
            {errors.courseName && <span className="error-text">{errors.courseName}</span>}
          </div>

          <div>
            <label>Duration (Hours)</label>
            <input
              type="number"
              value={course.courseDuration}
              onChange={(e) => updateField("courseDuration", e.target.value)}
            />
            {errors.courseDuration && <span className="error-text">{errors.courseDuration}</span>}
          </div>
        </div>

        <div className="input-full">
          <label>Course Description</label>
          <RichTextEditor
            value={course.courseDescription}
            onChange={(html) => updateField("courseDescription", html)}
            placeholder="Describe the course content..."
          />
          {errors.courseDescription && <span className="error-text">{errors.courseDescription}</span>}
        </div>

        <div className="input-grid">
          <div>
            <label>Thumbnail Image</label>
            <FileDropZone
              accept="image/*"
              hint="Drag image from Google or your computer"
              error={errors.thumbnail}
              onFiles={(file) => {
                updateField("thumbnail", file);
                if (errors.thumbnail) setErrors((prev) => ({ ...prev, thumbnail: null }));
              }}
            >
            {course.thumbnail && course.thumbnail instanceof File && (
              <div className="file-preview-list">
                <div className="file-preview-media">
                  <span
                    className="remove-file-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateField("thumbnail", null);
                    }}
                  >×</span>
                  <div className="image-preview-wrapper" onClick={() => openLightbox("image", URL.createObjectURL(course.thumbnail))}>
                    <img
                      src={URL.createObjectURL(course.thumbnail)}
                      className="preview-image-consistent"
                      alt="Preview"
                    />
                  </div>
                  <p className="file-name-media" title={course.thumbnail.name}>{course.thumbnail.name}</p>
                </div>
              </div>
            )}
            </FileDropZone>
          </div>
        </div>

        {/* MODULES + DND */}
        <div className="section-header">
          <h3>Modules</h3>
          <button className="add-btn" onClick={addModule}>
            + Add Module
          </button>
        </div>

        {course.modules.length > 1 && (
          <ModuleNavigator
            modules={course.modules}
            activeIndex={activeModuleIndex}
            onSelect={goToModule}
          />
        )}

        <SortableList
          items={course.modules}
          onReorder={(reordered) =>
            setCourse((prev) => ({ ...prev, modules: reordered }))
          }
        >
          {course.modules.map((module, mIndex) => (
            <SortableItem key={module.id} id={module.id} className="module-box">
              {({ setNodeRef, style, attributes, listeners, className }) => (
                <div
                  ref={(el) => {
                    setNodeRef(el);
                    moduleRefs.current[module.id] = el;
                  }}
                  style={style}
                  className={`${className} ${mIndex === activeModuleIndex ? "is-active" : course.modules.length > 1 ? "is-collapsed" : ""}`}
                >
                  <div className="module-header-wrapper">
                    <div className="drag-expand-btn" onClick={(e) => e.stopPropagation()}>
                      <div
                        className="drag-expand-grip"
                        {...attributes}
                        {...listeners}
                        title="Drag to reorder module"
                      >
                        <i className="bi bi-grip-vertical"></i>
                      </div>
                      <button
                        type="button"
                        className={`drag-expand-chevron ${mIndex === activeModuleIndex ? "rotate" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          goToModule(mIndex);
                        }}
                        title={mIndex === activeModuleIndex ? "Collapse module" : "Expand module"}
                      >
                        <i className="bi bi-chevron-down"></i>
                      </button>
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
                          onClick={(e) => e.stopPropagation()}
                        />
                        {errors[`module-${mIndex}`] && <span className="error-text">{errors[`module-${mIndex}`]}</span>}
                        <i
                          className="bi bi-trash module-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeModule(mIndex);
                          }}
                        ></i>
                      </div>
                    </div>
                  </div>

                  {mIndex === activeModuleIndex && (
                    <>
                  <button
                    className="add-section-btn"
                    onClick={() => addSection(mIndex)}
                  >
                    + Add Section
                  </button>

                  <SortableList
                    items={module.sections}
                    className="sections-droppable"
                    onReorder={(reordered) => {
                      setCourse((prev) => {
                        const updated = [...prev.modules];
                        updated[mIndex] = { ...updated[mIndex], sections: reordered };
                        return { ...prev, modules: updated };
                      });
                    }}
                  >
                    {module.sections.map((section, sIndex) => (
                      <SortableItem key={section.id} id={section.id} className="section-block">
                        {({ setNodeRef, style, attributes, listeners, className: sectionClass }) => (
                          <div ref={setNodeRef} style={style} className={sectionClass}>
                            <div className="section-header-wrapper">
                              <div className="drag-expand-btn drag-expand-btn--sec">
                                <div
                                  className="drag-expand-grip"
                                  {...attributes}
                                  {...listeners}
                                  title="Drag to reorder section"
                                >
                                  <i className="bi bi-grip-vertical"></i>
                                </div>
                                <button
                                  type="button"
                                  className={`drag-expand-chevron ${section.expanded ? "rotate" : ""}`}
                                  onClick={() => toggleSection(mIndex, sIndex)}
                                  title={section.expanded ? "Collapse section" : "Expand section"}
                                >
                                  <i className="bi bi-chevron-down"></i>
                                </button>
                              </div>

                              <div className="section-content">
                                <label className="section-label">Section {sIndex + 1}</label>
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
                                  {errors[`section-${mIndex}-${sIndex}`] && <span className="error-text">{errors[`section-${mIndex}-${sIndex}`]}</span>}

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
                                            <FileDropZone
                                              compact
                                              multiple
                                              accept={COURSE_FILE_ACCEPT}
                                              hint="Drop learning material files here"
                                              onFiles={(files) => {
                                                const newFiles = Array.isArray(files) ? files : [files];
                                                const existingFiles = section.materialFiles || [];
                                                updateSectionField(
                                                  mIndex,
                                                  sIndex,
                                                  "materialFiles",
                                                  [...existingFiles, ...newFiles]
                                                );
                                              }}
                                            />

                                            {/* PREVIEW */}
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

                                                      {/* MEDIA PREVIEW (Image/Video) */}
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
                                                        /* FILE CHIP (Docs, etc) */
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
                                            <RichTextEditor
                                              value={section.notes}
                                              onChange={(html) =>
                                                updateSectionField(
                                                  mIndex,
                                                  sIndex,
                                                  "notes",
                                                  html
                                                )
                                              }
                                              placeholder="Add learning notes with formatting..."
                                            />

                                            <label>
                                              Challenge File
                                            </label>
                                            <FileDropZone
                                              compact
                                              multiple
                                              accept={COURSE_FILE_ACCEPT}
                                              hint="Drop challenge files here"
                                              onFiles={(files) => {
                                                const newFiles = Array.isArray(files) ? files : [files];
                                                const existingFiles = section.challengeFiles || [];
                                                updateSectionField(
                                                  mIndex,
                                                  sIndex,
                                                  "challengeFiles",
                                                  [...existingFiles, ...newFiles]
                                                );
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
                                            <RichTextEditor
                                              value={section.challengeInstructions}
                                              onChange={(html) =>
                                                updateSectionField(
                                                  mIndex,
                                                  sIndex,
                                                  "challengeInstructions",
                                                  html
                                                )
                                              }
                                              placeholder="Add challenge instructions with formatting..."
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
                                                          removeVideo(mIndex, sIndex, i);
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
                                                        <p className="video-item error-text">Invalid Video Link: {v}</p>
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
                  </SortableItem>
                ))}
                  </SortableList>
                    </>
                  )}
                </div>
              )}
            </SortableItem>
          ))}
        </SortableList>

        {/* FOOTER */}
        <div className="footer-actions">
          <button
            className="cancel-btn"
            onClick={() => navigate("/admin/courses")}
            disabled={loading}
          >
            Cancel
          </button>

          <button className="submit-btn" onClick={handlePreview} disabled={loading}>
            Preview & Create
          </button>
        </div>
      </div>

      {showPreview && (
        <CoursePreviewModal
          course={course}
          loading={loading}
          onClose={() => setShowPreview(false)}
          onConfirmSave={handleSubmit}
        />
      )}

      {/* LIGHTBOX MODAL */}
      {lightbox.isOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <i className="bi bi-x-lg lightbox-close" onClick={closeLightbox}></i>
            {lightbox.type === "image" && (
              <img src={lightbox.src} alt="Full Preview" className="lightbox-image" />
            )}
            {lightbox.type === "video" && (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${lightbox.src}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
