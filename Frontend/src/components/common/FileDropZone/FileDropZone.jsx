import React, { useRef, useState } from "react";
import { extractFilesFromDrop } from "../../../utils/fileDrop";
import "./FileDropZone.css";

export default function FileDropZone({
  onFiles,
  accept = "image/*",
  multiple = false,
  children,
  className = "",
  hint = "",
  error = "",
  compact = false,
  allowWebImages = true,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropError, setDropError] = useState("");

  const imagesOnly = accept === "image/*" || accept === "image/*,";
  const defaultHint = multiple
    ? "Drag & drop files here (images, PDF, docs)"
    : imagesOnly
      ? "Drag image from Google or your computer"
      : "Drag & drop files here, or click to browse";

  const handleFiles = (files) => {
    if (!files?.length) return;
    onFiles(multiple ? files : files[0]);
    setDropError("");
  };

  const onInputChange = (e) => {
    const selected = multiple ? [...e.target.files] : e.target.files[0];
    if (selected) handleFiles(multiple ? selected : [selected]);
    e.target.value = "";
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const onDrop = async (e) => {
    setIsDragging(false);
    try {
      const files = await extractFilesFromDrop(e, {
        multiple,
        accept,
        allowWebImages,
      });

      if (files.length) {
        handleFiles(files);
        return;
      }

      setDropError(
        imagesOnly
          ? "Drop an image file or drag from Google Images."
          : "No valid files found. Try images, PDF, or documents."
      );
    } catch (err) {
      setDropError(err.message || "Failed to process dropped file.");
    }
  };

  return (
    <div className={`file-drop-zone-wrap ${className}`.trim()}>
      <div
        className={`file-drop-zone ${compact ? "file-drop-zone-compact" : ""} ${isDragging ? "is-drag-over" : ""}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onInputChange}
          className="file-drop-zone-input"
        />
        <div className="file-drop-zone-content">
          <i className={`bi bi-cloud-arrow-up file-drop-icon ${compact ? "file-drop-icon-compact" : ""}`} />
          <p className={`file-drop-hint ${compact ? "file-drop-hint-compact" : ""}`}>
            {hint || defaultHint}
          </p>
          {!compact && <span className="file-drop-or">or click to choose file</span>}
        </div>
      </div>
      {children}
      {(dropError || error) && (
        <span className="file-drop-error">{dropError || error}</span>
      )}
    </div>
  );
}
