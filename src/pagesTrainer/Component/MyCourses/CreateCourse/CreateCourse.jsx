import React, { useState, useEffect, useRef } from "react";
import "./CreateCourse.css";
import "../../../../components/common/ModuleNavigator/ModuleNavigator.css";
import { BiX, BiTrash, BiChevronDown, BiGridVertical } from "react-icons/bi";
import { uploadToCloudinary } from "../../../../utils/cloudinary";
import { useCreateCourse, useUpdateCourse, useCourse } from "../../../../hooks/useCourses";
import { confirmDelete } from "../../../../utils/confirmDelete";
import { showSuccess, showError, showWarning } from "../../../../utils/toast";
import Loader from "../../../../components/common/Loader/Loader";
import SortableList from "../../../../components/common/Sortable/SortableList";
import SortableItem from "../../../../components/common/Sortable/SortableItem";
import FileDropZone from "../../../../components/common/FileDropZone/FileDropZone";
import ModuleNavigator from "../../../../components/common/ModuleNavigator/ModuleNavigator";
import { COURSE_FILE_ACCEPT } from "../../../../utils/fileDrop";
import {
  createEmptyModule,
  createEmptySection,
  withStableIds,
} from "../../../../utils/courseBuilder";

const buildCourseState = (data) => ({
  courseName: data.courseName || data.title || "",
  courseId: data.courseId || data.id || "",
  courseDescription: data.courseDescription || data.description || "",
  courseDuration: data.courseDuration || data.duration || "",
  instructor: data.instructor || "",
  thumbnail: data.thumbnail || null,
  modules: withStableIds((data.modules || []).map(mod => ({
    title: mod.title,
    sections: (mod.sections || []).map(sec => ({
      title: sec.sectionName || sec.title,
      expanded: false,
      savedMaterialFiles: sec.learningMaterialFile || [],
      savedChallengeFiles: sec.codeChallengeFile || [],
      materialFiles: [],
      challengeFiles: [],
      notes: sec.learningMaterialNotes || sec.notes || "",
      challengeInstructions: sec.codeChallengeInstructions || "",
      videos: sec.videoReferences || sec.videos || []
    }))
  })))
});

const emptyState = {
  courseName: "",
  courseId: "",
  courseDescription: "",
  courseDuration: "",
  instructor: "",
  thumbnail: null,
  modules: [createEmptyModule()],
};

const CreateCourse = ({ onBack, onSave, initialData, isEditMode = false }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [lightbox, setLightbox] = useState({ isOpen: false, type: "", src: "" });
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const moduleRefs = useRef({});

  const { mutate: createCourseMutation } = useCreateCourse();
  const { mutate: updateCourseMutation } = useUpdateCourse();

  // Fetch full course detail when editing
  // Note: trainer courses list returns { courseId: c._id, ... } so we check both
  const editCourseId = isEditMode ? (initialData?._id || initialData?.courseId) : null;
  const { data: fullCourse, isLoading: isFetchingCourse } = useCourse(editCourseId);

  // Helper to extract YouTube ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const [course, setCourse] = useState(emptyState);

  // When the full course data is fetched from the API, populate the form
  useEffect(() => {
    if (isEditMode && fullCourse) {
      setCourse(buildCourseState(fullCourse));
    }
  }, [fullCourse, isEditMode]);

  const validateForm = () => {
    const newErrors = {};
    if (!course.courseName.trim()) newErrors.courseName = "Course Name is required";
    if (!course.courseDescription.trim()) newErrors.courseDescription = "Description is required";
    if (!course.courseDuration) newErrors.courseDuration = "Duration is required";
    // For edit mode, thumbnail might be existing object, so check validity strictly only if needed
    if (!course.thumbnail) newErrors.thumbnail = "Thumbnail is required";

    course.modules.forEach((mod, mIndex) => {
      if (!mod.title.trim()) newErrors[`module-${mIndex}`] = "Module Name is required";
      mod.sections.forEach((sec, sIndex) => {
        if (!sec.title.trim()) newErrors[`section-${mIndex}-${sIndex}`] = "Section Name is required";
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field, value) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
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
      modules: [...prev.modules, createEmptyModule({ sections: [] })],
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
    updated[mIndex].sections[sIndex].expanded = !updated[mIndex].sections[sIndex].expanded;
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
      showError("Please enter a valid YouTube URL");
      return;
    }

    const updated = [...course.modules];
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

  // =================
  // SUBMIT HANDLER
  // =================

  const handleSubmit = async () => {
    if (!validateForm()) {
      showWarning("Please fill all required fields correctly.");
      return;
    }

    setLoading(true);
    try {
      // 1. Thumbnail Upload
      let thumbnailData = course.thumbnail;
      if (course.thumbnail instanceof File) {
        const uploadedThumb = await uploadToCloudinary(course.thumbnail, "courses/thumbnails");
        thumbnailData = { url: uploadedThumb.url, publicId: uploadedThumb.publicId };
      }

      // 2. Modules & Sections Processing
      const processedModules = await Promise.all(
        course.modules.map(async (mod) => {
          const processedSections = await Promise.all(
            mod.sections.map(async (sec) => {
              // Upload NEW materials
              const materialUploads = await Promise.all(
                (sec.materialFiles || []).map(f => uploadToCloudinary(f, "courses/materials"))
              );
              const formattedNewMaterials = materialUploads.map(f => ({
                url: f.url,
                publicId: f.publicId,
                fileType: f.fileType,
                originalName: f.originalName,
              }));
              const finalMaterials = [...(sec.savedMaterialFiles || []), ...formattedNewMaterials];

              // Upload NEW challenges
              const challengeUploads = await Promise.all(
                (sec.challengeFiles || []).map(f => uploadToCloudinary(f, "courses/challenges"))
              );
              const formattedNewChallenges = challengeUploads.map(f => ({
                url: f.url,
                publicId: f.publicId,
                fileType: f.fileType,
                originalName: f.originalName,
              }));
              const finalChallenges = [...(sec.savedChallengeFiles || []), ...formattedNewChallenges];

              return {
                sectionName: sec.title,
                learningMaterialNotes: sec.notes,
                learningMaterialFile: finalMaterials,
                codeChallengeInstructions: sec.challengeInstructions,
                codeChallengeFile: finalChallenges,
                videoReferences: sec.videos
              };
            })
          );
          return { title: mod.title, sections: processedSections };
        })
      );

      const payload = {
        courseName: course.courseName,
        courseId: course.courseId,
        courseDescription: course.courseDescription,
        courseDuration: Number(course.courseDuration),
        thumbnail: thumbnailData,
        modules: processedModules
      };

      const mutationOptions = {
        onSuccess: (data) => {
          showSuccess(isEditMode ? "Course updated successfully!" : "Course created successfully!");
          onSave(data);
          setLoading(false);
        },
        onError: (err) => {
          showError(err.message || "Operation failed");
          setLoading(false);
        }
      };

      if (isEditMode) {
        if (!editCourseId) throw new Error("Missing Course ID for update");
        updateCourseMutation({ id: editCourseId, data: payload }, mutationOptions);
      } else {
        createCourseMutation(payload, mutationOptions);
      }

    } catch (err) {
      console.error(err);
      showError(err.message || "Upload failed");
      setLoading(false);
    }
  };

  return (
    <div className="create-course-page">
      <div className="create-course-container">
        <div className="page-header">
          <h2>{isEditMode ? "Edit Course" : "Create Course"}</h2>
          <BiX className="close-icon" onClick={onBack} />
        </div>

        <p className="subtitle">Build your modules and sections</p>

        {(loading || (isEditMode && isFetchingCourse)) && (
          <Loader message={isFetchingCourse ? "Loading course data..." : isEditMode ? "Updating Course..." : "Creating Course..."} />
        )}

        {/* BASIC FIELDS */}
        <div className="input-grid">
          <div>
            <label>Course Name</label>
            <input
              value={course.courseName}
              onChange={(e) => updateField("courseName", e.target.value)}
              placeholder="e.g. Advanced Frontend"
            />
            {errors.courseName && <span className="error-text">{errors.courseName}</span>}
          </div>

          <div>
            <label>Duration (Hours)</label>
            <input
              type="number"
              value={course.courseDuration}
              onChange={(e) => updateField("courseDuration", e.target.value)}
              placeholder="e.g. 40"
            />
            {errors.courseDuration && <span className="error-text">{errors.courseDuration}</span>}
          </div>
        </div>

        <div className="input-full">
          <label>Course Description</label>
          <textarea
            value={course.courseDescription}
            onChange={(e) => updateField("courseDescription", e.target.value)}
            placeholder="Describe the course content..."
          />
          {errors.courseDescription && <span className="error-text">{errors.courseDescription}</span>}
        </div>

        {/* THUMBNAIL UPLOAD */}
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
            {course.thumbnail && (
              <div className="file-preview-list">
                <div className="file-preview-media">
                  {course.thumbnail instanceof File && (
                    <span
                      className="remove-file-btn"
                      onClick={(e) => { e.stopPropagation(); updateField("thumbnail", null); }}
                    >×</span>
                  )}
                  <div className="image-preview-wrapper" onClick={() => openLightbox("image", course.thumbnail instanceof File ? URL.createObjectURL(course.thumbnail) : course.thumbnail.url)}>
                    <img
                      src={course.thumbnail instanceof File ? URL.createObjectURL(course.thumbnail) : course.thumbnail.url}
                      className="preview-image-consistent"
                      alt="Preview"
                    />
                  </div>
                </div>
              </div>
            )}
            </FileDropZone>
          </div>
        </div>

        {/* MODULES + DND */}
        <div className="section-header">
          <h3>Modules</h3>
          <button className="add-btn" onClick={addModule}>+ Add Module</button>
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
                        <BiGridVertical />
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
                        <BiChevronDown />
                      </button>
                    </div>
                    <div className="module-content">
                      <label className="module-label">Module {mIndex + 1}</label>
                      <div className="module-title-row">
                        <input
                          value={module.title}
                          onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                          placeholder="Enter module name"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {errors[`module-${mIndex}`] && (
                          <span className="error-text">{errors[`module-${mIndex}`]}</span>
                        )}
                        <BiTrash
                          className="module-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeModule(mIndex);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {mIndex === activeModuleIndex && (
                    <>
                  <button className="add-section-btn" onClick={() => addSection(mIndex)}>
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
                                  <BiGridVertical />
                                </div>
                                <button
                                  type="button"
                                  className={`drag-expand-chevron ${section.expanded ? "rotate" : ""}`}
                                  onClick={() => toggleSection(mIndex, sIndex)}
                                  title={section.expanded ? "Collapse section" : "Expand section"}
                                >
                                  <BiChevronDown />
                                </button>
                              </div>
                              <div className="section-content">
                                <label className="section-label">Section {sIndex + 1}</label>
                                <div className="section-header-row">
                                  <input
                                    value={section.title}
                                    onChange={(e) =>
                                      updateSectionField(mIndex, sIndex, "title", e.target.value)
                                    }
                                    placeholder="Enter section name"
                                  />
                                  {errors[`section-${mIndex}-${sIndex}`] && (
                                    <span className="error-text">
                                      {errors[`section-${mIndex}-${sIndex}`]}
                                    </span>
                                  )}
                                  <BiTrash
                                    className="section-delete"
                                    onClick={() => removeSection(mIndex, sIndex)}
                                  />
                                </div>
                              </div>
                            </div>

                                      {section.expanded && (
                                        <div className="section-details">
                                          {/* Materials Upload */}
                                          <label>Learning Material Files</label>
                                          {/* Saved Files */}
                                          {section.savedMaterialFiles && section.savedMaterialFiles.length > 0 && (
                                            <div className="file-existing-list">
                                              <p style={{ fontSize: '12px', color: '#666' }}>Saved:</p>
                                              {section.savedMaterialFiles.map((f, i) => (
                                                <div key={i} className="file-preview-mini">
                                                  <a href={f.url} target="_blank" rel="noopener noreferrer">{f.originalName || `File ${i + 1}`}</a>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          <FileDropZone
                                            compact
                                            multiple
                                            accept={COURSE_FILE_ACCEPT}
                                            hint="Drop learning material files here"
                                            onFiles={(files) => {
                                              const newFiles = Array.isArray(files) ? files : [files];
                                              const current = section.materialFiles || [];
                                              updateSectionField(mIndex, sIndex, "materialFiles", [...current, ...newFiles]);
                                            }}
                                          />
                                          {/* Preview New Materials */}
                                          <div className="file-preview-list">
                                            {(section.materialFiles || []).map((file, idx) => {
                                              const isImage = file.type.includes("image");
                                              const isVideo = file.type.includes("video");
                                              const isPdf = file.type.includes("pdf");

                                              if (isPdf) {
                                                return (
                                                  <div key={idx} className="pdf-preview-card" onClick={() => window.open(URL.createObjectURL(file), "_blank")}>
                                                    <span className="remove-file-btn" onClick={(e) => { e.stopPropagation(); removeSectionFile(mIndex, sIndex, "materialFiles", idx); }}>×</span>
                                                    <div className="pdf-icon-wrapper">
                                                      <i className="bi bi-file-earmark-pdf text-danger" style={{ fontSize: "24px" }}></i>
                                                    </div>
                                                    <span className="pdf-filename" title={file.name}>{file.name}</span>
                                                  </div>
                                                );
                                              }

                                              const isMedia = isImage || isVideo;
                                              return (
                                                <div key={idx} className={`file-preview ${isMedia ? 'file-preview-media' : 'file-preview-chip'}`}>
                                                  <span className="remove-file-btn" onClick={() => removeSectionFile(mIndex, sIndex, "materialFiles", idx)}>×</span>
                                                  {isMedia ? (
                                                    <>
                                                      {isImage && (
                                                        <div className="image-preview-wrapper" onClick={() => openLightbox("image", URL.createObjectURL(file))}>
                                                          <img src={URL.createObjectURL(file)} className="preview-image-consistent" alt="preview" />
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
                                                    <span className="file-chip-text" title={file.name}>{file.name}</span>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>

                                          <label>Learning Notes</label>
                                          <textarea
                                            value={section.notes}
                                            onChange={(e) => updateSectionField(mIndex, sIndex, "notes", e.target.value)}
                                          />

                                          <label>Challenge File</label>
                                          {/* Saved Challenge Files */}
                                          {section.savedChallengeFiles && section.savedChallengeFiles.length > 0 && (
                                            <div className="file-existing-list">
                                              <p style={{ fontSize: '12px', color: '#666' }}>Saved:</p>
                                              {section.savedChallengeFiles.map((f, i) => (
                                                <div key={i} className="file-preview-mini">
                                                  <a href={f.url} target="_blank" rel="noopener noreferrer">{f.originalName || `Challenge ${i + 1}`}</a>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          <FileDropZone
                                            compact
                                            multiple
                                            accept={COURSE_FILE_ACCEPT}
                                            hint="Drop challenge files here"
                                            onFiles={(files) => {
                                              const newFiles = Array.isArray(files) ? files : [files];
                                              const current = section.challengeFiles || [];
                                              updateSectionField(mIndex, sIndex, "challengeFiles", [...current, ...newFiles]);
                                            }}
                                          />
                                          {/* Preview New Challenges */}
                                          <div className="file-preview-list">
                                            {(section.challengeFiles || []).map((file, idx) => {
                                              const isImage = file.type.includes("image");
                                              const isVideo = file.type.includes("video");
                                              const isPdf = file.type.includes("pdf");

                                              if (isPdf) {
                                                return (
                                                  <div key={idx} className="pdf-preview-card" onClick={() => window.open(URL.createObjectURL(file), "_blank")}>
                                                    <span className="remove-file-btn" onClick={(e) => { e.stopPropagation(); removeSectionFile(mIndex, sIndex, "challengeFiles", idx); }}>×</span>
                                                    <div className="pdf-icon-wrapper">
                                                      <i className="bi bi-file-earmark-pdf text-danger" style={{ fontSize: "24px" }}></i>
                                                    </div>
                                                    <span className="pdf-filename" title={file.name}>{file.name}</span>
                                                  </div>
                                                );
                                              }

                                              const isMedia = isImage || isVideo;
                                              return (
                                                <div key={idx} className={`file-preview ${isMedia ? 'file-preview-media' : 'file-preview-chip'}`}>
                                                  <span className="remove-file-btn" onClick={() => removeSectionFile(mIndex, sIndex, "challengeFiles", idx)}>×</span>
                                                  {isMedia ? (
                                                    <>
                                                      {isImage && (
                                                        <div className="image-preview-wrapper" onClick={() => openLightbox("image", URL.createObjectURL(file))}>
                                                          <img src={URL.createObjectURL(file)} className="preview-image-consistent" alt="preview" />
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
                                                    <span className="file-chip-text" title={file.name}>{file.name}</span>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>

                                          <label>Challenge Instructions</label>
                                          <textarea
                                            value={section.challengeInstructions}
                                            onChange={(e) => updateSectionField(mIndex, sIndex, "challengeInstructions", e.target.value)}
                                          />

                                          <div className="video-add-row">
                                            <label>Video References</label>
                                            <button className="add-video-btn-small" onClick={() => addVideo(mIndex, sIndex)}>+ Add Video</button>
                                          </div>
                                          <div className="video-list-container" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                            {section.videos.map((v, i) => {
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
                                            })}
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

        <div className="footer-actions">
          <button className="cancel-btn" onClick={onBack}>Cancel</button>
          <button className="submit-btn" onClick={handleSubmit}>
            {isEditMode ? "Save Changes" : "Create Course"}
          </button>
        </div>

      </div>

      {/* LIGHTBOX MODAL */}
      {lightbox.isOpen && (
        <div className="lightbox-overlay" onClick={() => setLightbox({ ...lightbox, isOpen: false })}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <BiX className="lightbox-close" onClick={() => setLightbox({ ...lightbox, isOpen: false })} />
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
