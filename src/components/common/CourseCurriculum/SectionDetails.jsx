import React from "react";
import RichTextContent from "../RichTextEditor/RichTextContent";
import { isHtmlEmpty } from "../RichTextEditor/richTextUtils";
import "./SectionDetails.css";

const getFileUrl = (file) => {
  if (!file) return null;
  if (typeof file === "string") return file;
  return file.url || null;
};

const getFileName = (file, fallback = "File") => {
  if (!file) return fallback;
  if (typeof file === "string") return file.split("/").pop() || fallback;
  return file.originalName || file.name || file.fileName || fallback;
};

const getViewUrl = (url) => {
  if (!url) return "#";
  const lowerUrl = url.toLowerCase();
  const officeExtensions = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
  const isOfficeFile = officeExtensions.some(
    (ext) => lowerUrl.endsWith(ext) || lowerUrl.includes(`.${ext}?`)
  );
  if (isOfficeFile) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
  }
  return url;
};

const isImageFile = (file) => {
  const name = getFileName(file, "").toLowerCase();
  const url = (getFileUrl(file) || "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(name) || /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url);
};

const getYoutubeId = (url) => {
  if (!url || typeof url !== "string") return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
};

const normalizeVideoUrl = (vid) => {
  if (!vid) return null;
  if (typeof vid === "string") return vid;
  return vid.url || null;
};

const FileRow = ({ file, fallbackName }) => {
  const url = getFileUrl(file);
  const name = getFileName(file, fallbackName);

  return (
    <li className="cv-file-item">
      <span className="cv-file-name">
        <i className="bi bi-file-earmark-text"></i> {name}
      </span>
      <div className="cv-file-actions">
        {url && (
          <>
            <a
              href={getViewUrl(url)}
              target="_blank"
              rel="noopener noreferrer"
              className="cv-action-icon view"
              title="View"
            >
              <i className="bi bi-box-arrow-up-right"></i>
            </a>
            <a href={url} download={name} className="cv-action-icon download" title="Download">
              <i className="bi bi-download"></i>
            </a>
          </>
        )}
      </div>
    </li>
  );
};

const SectionDetails = ({ sec }) => {
  if (!sec) return null;

  const notes = sec.learningMaterialNotes || sec.notes || "";
  const challengeInstructions = sec.codeChallengeInstructions || sec.challengeInstructions || "";
  const materials = [
    ...(sec.learningMaterialFile || []),
    ...(sec.learningMaterialFiles || []),
    ...(sec.savedMaterialFiles || []),
    ...(sec.materialFiles || []),
  ];
  const challengeFiles = [
    ...(sec.codeChallengeFile || []),
    ...(sec.codeChallengeFiles || []),
    ...(sec.savedChallengeFiles || []),
    ...(sec.challengeFiles || []),
  ];
  const videos = [...(sec.videoReferences || []), ...(sec.videos || [])]
    .map(normalizeVideoUrl)
    .filter(Boolean);

  const imageFiles = materials.filter(isImageFile);
  const otherFiles = materials.filter((f) => !isImageFile(f));

  const hasNotes = !isHtmlEmpty(notes);
  const hasImages = imageFiles.length > 0;
  const hasFiles = otherFiles.length > 0;
  const hasVideos = videos.length > 0;
  const hasChallenge = !isHtmlEmpty(challengeInstructions) || challengeFiles.length > 0;

  if (!hasNotes && !hasImages && !hasFiles && !hasVideos && !hasChallenge) {
    return <div className="cv-detail-empty">No content in this section.</div>;
  }

  return (
    <>
      {hasNotes && (
        <div className="cv-detail-block">
          <h4>Notes</h4>
          <RichTextContent html={notes} />
        </div>
      )}

      {hasImages && (
        <div className="cv-detail-block">
          <h4>Images</h4>
          <div className="cv-media-grid">
            {imageFiles.map((file, i) => {
              const url = getFileUrl(file);
              const name = getFileName(file, "Image");
              if (!url) return null;
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cv-media-image"
                  title={name}
                >
                  <img src={url} alt={name} loading="lazy" />
                  <span>{name}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {hasFiles && (
        <div className="cv-detail-block">
          <h4>Materials</h4>
          <ul className="cv-file-list">
            {otherFiles.map((file, i) => (
              <FileRow key={i} file={file} fallbackName="Material" />
            ))}
          </ul>
        </div>
      )}

      {hasVideos && (
        <div className="cv-detail-block">
          <h4>Videos</h4>
          <div className="cv-video-stack">
            {videos.map((url, i) => {
              const youtubeId = getYoutubeId(url);
              return (
                <div key={i} className="cv-video-card">
                  {youtubeId ? (
                    <div className="cv-video-frame">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title={`Video ${i + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cv-video-link-card"
                    >
                      <i className="bi bi-play-circle-fill"></i>
                      <span>{url}</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasChallenge && (
        <div className="cv-detail-block challenge-block">
          <h4>Code Challenge</h4>
          {!isHtmlEmpty(challengeInstructions) && (
            <RichTextContent html={challengeInstructions} />
          )}
          {challengeFiles.length > 0 && (
            <ul className="cv-file-list">
              {challengeFiles.map((file, i) => (
                <FileRow key={i} file={file} fallbackName="Challenge" />
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
};

export default SectionDetails;
