import React, { useState, useRef, useEffect } from "react";
import SortableList from "../../../components/common/Sortable/SortableList";
import SortableItem from "../../../components/common/Sortable/SortableItem";
import FileDropZone from "../../../components/common/FileDropZone/FileDropZone";
import RichTextEditor from "../../../components/common/RichTextEditor/RichTextEditor";
import { COURSE_FILE_ACCEPT } from "../../../utils/fileDrop";
import { confirmDelete } from "../../../utils/confirmDelete";
import { promptInput } from "../../../utils/promptInput";
import { showSuccess } from "../../../utils/toast";
import { createEmptyModule, createEmptySection } from "../../../utils/courseBuilder";

const CourseCurriculumEditor = ({ course, setCourse, errors, setErrors, openLightbox }) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(-1);
  const [editingField, setEditingField] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  
  const moduleRefs = useRef({});
  const sectionRefs = useRef({});

  useEffect(() => {
    setActiveSectionIndex(-1);
  }, [activeModuleIndex]);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const goToModule = (index) => {
    setActiveModuleIndex((prev) => (prev === index ? -1 : index));
    if (index === activeModuleIndex) return;
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

  const goToSection = (mIndex, sIndex) => {
    if (mIndex !== activeModuleIndex) {
      setActiveModuleIndex(mIndex);
      setActiveSectionIndex(sIndex);
    } else {
      setActiveSectionIndex((prev) => (prev === sIndex ? -1 : sIndex));
    }
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

  const addVideo = async (mIndex, sIndex) => {
    const link = await promptInput({
      title: "Add Video",
      inputLabel: "YouTube video link",
      placeholder: "https://www.youtube.com/watch?v=...",
      confirmText: "Add Video",
      validate: (value) =>
        getYouTubeId(value) ? undefined : "Please enter a valid YouTube URL",
    });
    if (!link) return;

    const updated = [...course.modules];
    updated[mIndex].sections[sIndex].videos.push(link);
    setCourse({ ...course, modules: updated });
  };

  const removeVideo = (mIndex, sIndex, vIndex) => {
    const updated = [...course.modules];
    updated[mIndex].sections[sIndex].videos = updated[mIndex].sections[sIndex].videos.filter((_, i) => i !== vIndex);
    setCourse({ ...course, modules: updated });
  };

  return (
    <div className="admin-create-course-page course-curriculum-wrap">
      <div className="curriculum-page-header">
        <h3>Course Content</h3>
        <p>Organize your course into modules and add sections</p>
      </div>

      <SortableList
        items={course.modules}
        className="curriculum-module-list"
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
                className={`${className} ${mIndex === activeModuleIndex ? "is-active" : ""}`}
              >
                <div
                  className={`module-header-wrapper ${mIndex === activeModuleIndex ? "is-open" : ""}`}
                  onClick={() => goToModule(mIndex)}
                >
                  <button
                    type="button"
                    className={`module-chevron ${mIndex === activeModuleIndex ? "rotate" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToModule(mIndex);
                    }}
                    title={mIndex === activeModuleIndex ? "Collapse" : "Expand"}
                  >
                    <i className="bi bi-chevron-down"></i>
                  </button>
                  <span className="module-num-badge">
                    {String(mIndex + 1).padStart(2, "0")}
                  </span>
                  <div className="module-content">
                    <div className="module-title-row">
                      <input
                        value={module.title}
                        onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                        placeholder="Enter module name"
                        readOnly={editingField !== `module-${mIndex}`}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => setEditingField(null)}
                        ref={(el) => { if (editingField === `module-${mIndex}` && el) el.focus(); }}
                      />
                      <span className="chapter-count-badge">
                        {module.sections.length} {module.sections.length === 1 ? "section" : "sections"}
                      </span>
                      {errors[`module-${mIndex}`] && <span className="error-text">{errors[`module-${mIndex}`]}</span>}
                    </div>
                  </div>
                  <div className="section-actions" onClick={(e) => e.stopPropagation()}>
                    {mIndex === activeModuleIndex && (
                      <>
                        <i className="bi bi-pencil section-action-icon" onClick={() => setEditingField(`module-${mIndex}`)} title="Edit module"></i>
                        <i
                          className="bi bi-trash section-action-icon section-action-delete"
                          onClick={() => removeModule(mIndex)}
                          title="Delete module"
                        ></i>
                      </>
                    )}
                    <div
                      className="section-action-icon drag-handle"
                      {...attributes}
                      {...listeners}
                      title="Drag to reorder"
                    >
                      <i className="bi bi-grip-vertical"></i>
                    </div>
                  </div>
                </div>

                {mIndex === activeModuleIndex && (
                  <div className="module-body">
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
                              className={`${sectionClass} ${sIndex === activeSectionIndex ? "is-active" : ""}`}
                            >
                              <div className="section-header-wrapper" onClick={() => goToSection(mIndex, sIndex)}>
                                <button
                                  type="button"
                                  className={`chapter-chevron ${sIndex === activeSectionIndex ? "rotate" : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    goToSection(mIndex, sIndex);
                                  }}
                                >
                                  <i className="bi bi-chevron-down"></i>
                                </button>
                                <span className="chapter-label">SECTION {sIndex + 1}</span>
                                <span className="chapter-sep">|</span>
                                <i className="bi bi-file-earmark-text chapter-doc-icon"></i>
                                <div className="section-content">
                                  <div className="section-header-row">
                                    <input
                                      value={section.title}
                                      onChange={(e) =>
                                        updateSectionField(mIndex, sIndex, "title", e.target.value)
                                      }
                                      placeholder={`Section ${sIndex + 1} name`}
                                      readOnly={editingField !== `section-${mIndex}-${sIndex}`}
                                      onClick={(e) => e.stopPropagation()}
                                      onBlur={() => setEditingField(null)}
                                      ref={(el) => { if (editingField === `section-${mIndex}-${sIndex}` && el) el.focus(); }}
                                    />
                                    {errors[`section-${mIndex}-${sIndex}`] && <span className="error-text">{errors[`section-${mIndex}-${sIndex}`]}</span>}
                                  </div>
                                </div>
                                <div className="section-actions" onClick={(e) => e.stopPropagation()}>
                                  {sIndex === activeSectionIndex && (
                                    <>
                                      <i className="bi bi-pencil section-action-icon" onClick={() => setEditingField(`section-${mIndex}-${sIndex}`)} title="Edit section"></i>
                                      <i
                                        className="bi bi-trash section-action-icon section-action-delete"
                                        onClick={() => removeSection(mIndex, sIndex)}
                                        title="Delete section"
                                      ></i>
                                    </>
                                  )}
                                  <div
                                    className="section-action-icon drag-handle"
                                    {...attributes}
                                    {...listeners}
                                    title="Drag to reorder"
                                  >
                                    <i className="bi bi-grip-vertical"></i>
                                  </div>
                                </div>
                              </div>

                              {sIndex === activeSectionIndex && (
                                <div className="section-details">
                                  {/* Lesson Type */}
                                  <label>Lesson Type</label>
                                  <select 
                                    value={section.lessonType || "Theory"} 
                                    onChange={(e) => updateSectionField(mIndex, sIndex, "lessonType", e.target.value)}
                                    style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
                                  >
                                    <option value="Theory">Theory</option>
                                    <option value="Coding Practice">Coding Practice</option>
                                  </select>

                                  <label>Learning Material File</label>
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
                                  )}

                                  <label>Learning Notes</label>
                                  <RichTextEditor
                                    value={section.notes}
                                    onChange={(html) =>
                                      updateSectionField(mIndex, sIndex, "notes", html)
                                    }
                                    placeholder="Add learning notes with formatting..."
                                  />

                                  <label>Challenge File</label>
                                  <FileDropZone
                                    compact
                                    multiple
                                    accept={COURSE_FILE_ACCEPT}
                                    hint="Drop challenge files here"
                                    onFiles={(files) => {
                                      const newFiles = Array.isArray(files) ? files : [files];
                                      const existingFiles = section.challengeFiles || [];
                                      updateSectionField(mIndex, sIndex, "challengeFiles", [...existingFiles, ...newFiles]);
                                    }}
                                  />

                                  {section.challengeFiles && section.challengeFiles.length > 0 && (
                                    <div className="file-preview-list">
                                      {section.challengeFiles.map((file, idx) => {
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
                                          )
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
                                  )}

                                  <label>Challenge Instructions</label>
                                  <RichTextEditor
                                    value={section.challengeInstructions}
                                    onChange={(html) =>
                                      updateSectionField(mIndex, sIndex, "challengeInstructions", html)
                                    }
                                    placeholder="Add challenge instructions with formatting..."
                                  />

                                  <div className="video-add-row">
                                    <label>Video References</label>
                                    <span className="add-video-btn" onClick={() => addVideo(mIndex, sIndex)}>
                                      + Add Video
                                    </span>
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
                                          <span className="remove-video-btn" onClick={(e) => { e.stopPropagation(); removeVideo(mIndex, sIndex, i); }}>×</span>
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
                                                <img src={`https://img.youtube.com/vi/${params}/mqdefault.jpg`} alt="Video Thumbnail" className="video-preview-thumb" />
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
                    <button type="button" className="add-chapter-btn" onClick={() => addSection(mIndex)}>
                      <span className="add-chapter-icon">+</span>
                      Add more sections
                    </button>
                  </div>
                )}
              </div>
            )}
          </SortableItem>
        ))}
      </SortableList>

      <button type="button" className="add-module-dashed-btn" onClick={addModule}>
        <span className="add-module-dashed-icon">+</span>
        <span>
          <strong>Add New Module</strong>
          <small>Organize your course with modules.</small>
        </span>
      </button>
    </div>
  );
};

export default CourseCurriculumEditor;
