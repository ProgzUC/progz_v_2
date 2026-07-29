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
import CoursePreviewModal from "../../../../components/common/CoursePreviewModal/CoursePreviewModal";
import RichTextEditor from "../../../../components/common/RichTextEditor/RichTextEditor";
import { isHtmlEmpty } from "../../../../components/common/RichTextEditor/richTextUtils";
import { COURSE_FILE_ACCEPT } from "../../../../utils/fileDrop";
import {
  createEmptyModule,
  createEmptySection,
  withStableIds,
} from "../../../../utils/courseBuilder";
import CourseTitleModal from "../../../../components/common/CourseBuilder/CourseTitleModal";
import CourseBuilderShell from "../../../../components/common/CourseBuilder/CourseBuilderShell";
import CourseInformationPanel from "../../../../components/common/CourseBuilder/CourseInformationPanel";
import "../../../../components/common/CourseBuilder/CourseBuilder.css";

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
  const [builderStarted, setBuilderStarted] = useState(isEditMode);
  const [activeStep, setActiveStep] = useState("information");
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [lightbox, setLightbox] = useState({ isOpen: false, type: "", src: "" });
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const moduleRefs = useRef({});
  const sectionRefs = useRef({});

  useEffect(() => {
    setActiveSectionIndex(0);
  }, [activeModuleIndex]);

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

  const validateInformation = () => {
    const newErrors = {};
    if (!course.courseName.trim()) newErrors.courseName = "Course Name is required";
    if (isHtmlEmpty(course.courseDescription)) newErrors.courseDescription = "Description is required";
    if (!course.courseDuration) newErrors.courseDuration = "Duration is required";
    if (!course.thumbnail) newErrors.thumbnail = "Thumbnail is required";
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateCurriculum = () => {
    const newErrors = {};
    course.modules.forEach((mod, mIndex) => {
      if (!mod.title.trim()) newErrors[`module-${mIndex}`] = "Module Name is required";
      mod.sections.forEach((sec, sIndex) => {
        if (!sec.title.trim()) newErrors[`section-${mIndex}-${sIndex}`] = "Section Name is required";
      });
    });
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => validateInformation() && validateCurriculum();

  const handleTitleContinue = (title) => {
    setCourse((prev) => ({ ...prev, courseName: title }));
    setBuilderStarted(true);
    setActiveStep("information");
  };

  const handleStepChange = (step) => {
    if (step === "curriculum" && activeStep === "information" && !validateInformation()) {
      showWarning("Please complete all required course information fields.");
      return;
    }
    setActiveStep(step);
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

  const goToSection = (mIndex, sIndex) => {
    if (mIndex !== activeModuleIndex) {
      setActiveModuleIndex(mIndex);
    }
    setActiveSectionIndex(sIndex);
    requestAnimationFrame(() => {
      const sectionId = course.modules[mIndex]?.sections[sIndex]?.id;
      sectionRefs.current[sectionId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  const addSection = (mIndex) => {
    const updated = [...course.modules];
    updated[mIndex].sections.push(createEmptySection());
    setCourse({ ...course, modules: updated });
    setActiveSectionIndex(updated[mIndex].sections.length - 1);
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
    setActiveSectionIndex((prev) => {
      if (prev === sIndex) return Math.max(0, sIndex - 1);
      if (prev > sIndex) return prev - 1;
      return prev;
    });
    showSuccess("Section deleted");
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
          setShowPreview(false);
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

  const curriculumSection = (
    <div className="create-course-page course-curriculum-wrap">
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
                    <span className="section-order-num">{mIndex + 1}</span>
                    <div className="module-content" onClick={() => goToModule(mIndex)} style={{ cursor: "pointer" }}>
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
                      </div>
                    </div>
                    <div className="section-actions">
                      <div
                        className="section-action-icon drag-handle"
                        {...attributes}
                        {...listeners}
                        title="Drag to reorder"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BiGridVertical />
                      </div>
                      <i className="bi bi-pencil section-action-icon" onClick={() => goToModule(mIndex)} title="Edit module" />
                      <BiTrash
                        className="section-action-icon section-action-delete"
                        onClick={(e) => { e.stopPropagation(); removeModule(mIndex); }}
                        title="Delete module"
                      />
                    </div>
                  </div>

                  {mIndex === activeModuleIndex && (
                    <>
                  <button className="add-section-btn" onClick={() => addSection(mIndex)}>
                    + Add Section
                  </button>

                  {module.sections.length > 1 && (
                    <ModuleNavigator
                      modules={module.sections}
                      activeIndex={activeSectionIndex}
                      onSelect={(sIndex) => goToSection(mIndex, sIndex)}
                      itemPrefix="Section"
                    />
                  )}

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
                          <div
                            ref={(el) => {
                              setNodeRef(el);
                              sectionRefs.current[section.id] = el;
                            }}
                            style={style}
                            className={`${sectionClass} ${sIndex === activeSectionIndex ? "is-active" : module.sections.length > 1 ? "is-collapsed" : ""}`}
                          >
                            <div className="section-header-wrapper">
                              <span className="section-order-num">{sIndex + 1}</span>
                              <div className="section-content" onClick={() => goToSection(mIndex, sIndex)} style={{ cursor: "pointer" }}>
                                <div className="section-header-row">
                                  <input
                                    value={section.title}
                                    onChange={(e) =>
                                      updateSectionField(mIndex, sIndex, "title", e.target.value)
                                    }
                                    placeholder={`Section ${sIndex + 1} name`}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  {errors[`section-${mIndex}-${sIndex}`] && (
                                    <span className="error-text">
                                      {errors[`section-${mIndex}-${sIndex}`]}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="section-actions">
                                <div
                                  className="section-action-icon drag-handle"
                                  {...attributes}
                                  {...listeners}
                                  title="Drag to reorder"
                                >
                                  <BiGridVertical />
                                </div>
                                <i className="bi bi-pencil section-action-icon" onClick={() => goToSection(mIndex, sIndex)} title="Edit section" />
                                <BiTrash
                                  className="section-action-icon section-action-delete"
                                  onClick={() => removeSection(mIndex, sIndex)}
                                  title="Delete section"
                                />
                              </div>
                            </div>

                                      {sIndex === activeSectionIndex && (
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
                                          <RichTextEditor
                                            value={section.notes}
                                            onChange={(html) => updateSectionField(mIndex, sIndex, "notes", html)}
                                            placeholder="Add learning notes with formatting..."
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
                                          <RichTextEditor
                                            value={section.challengeInstructions}
                                            onChange={(html) => updateSectionField(mIndex, sIndex, "challengeInstructions", html)}
                                            placeholder="Add challenge instructions with formatting..."
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
    </div>
  );

  return (
    <>
      {!builderStarted && !isEditMode && (
        <CourseTitleModal onContinue={handleTitleContinue} onClose={onBack} />
      )}

      {builderStarted && (
        <CourseBuilderShell
          activeStep={activeStep}
          onStepChange={handleStepChange}
          courseName={course.courseName}
          footer={
            <div className="step-footer">
              <button type="button" className="cancel-btn" onClick={onBack} disabled={loading}>
                Cancel
              </button>
              {activeStep === "information" ? (
                <button
                  type="button"
                  className="submit-btn"
                  onClick={() => handleStepChange("curriculum")}
                  disabled={loading || (isEditMode && isFetchingCourse)}
                >
                  Continue to Curriculum
                </button>
              ) : (
                <button
                  type="button"
                  className="submit-btn"
                  onClick={handlePreview}
                  disabled={loading || (isEditMode && isFetchingCourse)}
                >
                  {isEditMode ? "Preview & Save" : "Preview & Create"}
                </button>
              )}
            </div>
          }
        >
          {(loading || (isEditMode && isFetchingCourse)) && (
            <Loader
              message={
                isFetchingCourse
                  ? "Loading course data..."
                  : isEditMode
                    ? "Updating Course..."
                    : "Creating Course..."
              }
            />
          )}

          {activeStep === "information" && (
            <div className="course-info-wrap">
              <CourseInformationPanel
                course={course}
                errors={errors}
                updateField={updateField}
                setErrors={setErrors}
                onThumbnailPreview={(src) => openLightbox("image", src)}
              />
            </div>
          )}

          {activeStep === "curriculum" && curriculumSection}
        </CourseBuilderShell>
      )}

      {showPreview && (
        <CoursePreviewModal
          course={course}
          isEditMode={isEditMode}
          loading={loading}
          onClose={() => setShowPreview(false)}
          onConfirmSave={handleSubmit}
        />
      )}

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
    </>
  );
};

export default CreateCourse;
