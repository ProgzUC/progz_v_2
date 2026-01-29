import React from "react";
import "./introduction.css";

const FileItem = ({ name, url }) => {
  const handleDownload = () => {
    window.open(url, "_blank");
  };

  const handleExternalLink = () => {
    window.open(url, "_blank");
  };

  return (
    <div className="file-box">
      <div className="file-left">
        {/* Link Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l1-1a5 5 0 0 0-7.07-7.07l-1 1" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-1 1a5 5 0 0 0 7.07 7.07l1-1" />
        </svg>

        <div>
          <div className="file-name">{name}</div>
          <div className="file-sub">res.cloudinary.com</div>
        </div>
      </div>

      <div className="file-actions">
        {/* Download Icon */}
        <button className="icon-btn" onClick={handleDownload} title="Download">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="#1E8F45" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v14" />
            <polyline points="6 12 12 18 18 12" />
            <path d="M5 21h14a2 2 0 0 0 2-2v-1" />
          </svg>
        </button>

        {/* External Icon */}
        <button className="icon-btn" onClick={handleExternalLink} title="Open in new tab">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const Introduction = ({ sectionData, courseName, moduleName }) => {
  if (!sectionData) return <div className="p-5">Loading lesson data...</div>;

  // Extract data with fallbacks
  const {
    title,
    sectionName,
    notes,
    learningMaterialNotes,
    learningMaterialFile = [],
    learningMaterialFiles = [],
    codeChallengeInstructions,
    codeChallengeFile = [],
    codeChallengeFiles = [],
    videos = [],
    videoReferences = []
  } = sectionData;

  const displayTitle = sectionName || title || "Lesson";
  const displayNotes = learningMaterialNotes || notes || "No description available.";
  const displayChallenge = codeChallengeInstructions || "No instructions provided.";

  // Handle inconsistent naming (API vs Frontend conventions)
  const materials = learningMaterialFiles.length > 0 ? learningMaterialFiles : learningMaterialFile;
  const challengeFiles = codeChallengeFiles.length > 0 ? codeChallengeFiles : codeChallengeFile;
  const classVideos = videos.length > 0 ? videos : videoReferences;

  const mainVideo = classVideos.length > 0 ? (typeof classVideos[0] === 'string' ? { url: classVideos[0] } : classVideos[0]) : null;

  const handlePlayVideo = () => {
    if (mainVideo?.url) {
      window.open(mainVideo.url, "_blank");
    }
  };

  return (
    <div className="intro-container">

      <p className="breadcrumb">
        My Courses / {courseName} / <strong>{moduleName}</strong>
      </p>

      <h1 className="intro-title">{displayTitle}</h1>

      {/* ============= LEARNING MATERIALS ============= */}
      <div className="section-card">

        <div className="section-header">
          <div className="section-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z" />
              <polyline points="6 2 6 7" />
              <polyline points="10 2 10 7" />
              <polyline points="14 2 14 7" />
            </svg>
          </div>

          <h2>Learning Materials</h2>
        </div>

        <p className="section-description">
          {displayNotes}
        </p>

        <div className="file-row">
          {materials.length > 0 ? materials.map((file, index) => (
            // Handle if file is just a string (URL) or object
            <FileItem
              key={index}
              name={typeof file === 'string' ? "Material File" : (file.name || file.fileName || "Material File")}
              url={typeof file === 'string' ? file : file.url}
            />
          )) : (
            <p className="text-muted small">No files attached.</p>
          )}
        </div>
      </div>

      {/* ============= CODE CHALLENGE ============= */}
      <div className="section-card" style={{ minHeight: '150px' }}>

        <div className="section-header">
          <div className="section-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 21 12 15 6" />
              <polyline points="9 6 3 12 9 18" />
            </svg>
          </div>

          <h2>Code Challenge</h2>
        </div>

        <p className="section-description">
          {displayChallenge}
        </p>

        <div className="file-row">
          {challengeFiles.length > 0 ? challengeFiles.map((file, index) => (
            <FileItem
              key={index}
              name={typeof file === 'string' ? "Challenge File" : (file.name || file.fileName || "Challenge File")}
              url={typeof file === 'string' ? file : file.url}
            />
          )) : (
            <p className="text-muted small">No challenge files.</p>
          )}
        </div>
      </div>

      {/* ============= CLASS RECORDINGS ============= */}
      <div className="section-card">

        <div className="section-header">
          <div className="section-icon">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
              stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="15" height="12" rx="2" ry="2" />
              <polygon points="17 10 22 7 22 17 17 14" />
            </svg>
          </div>

          <h2>Class Recordings</h2>
        </div>

        {mainVideo ? (
          <>
            <p className="section-description">
              <strong>Link:</strong>{" "}
              <a href={mainVideo.url} className="recording-link" target="_blank" rel="noopener noreferrer">
                {mainVideo.url}
              </a>
            </p>

            <div className="video-card">
              <div className="video-thumbnail-container" onClick={handlePlayVideo} style={{ cursor: 'pointer' }}>
                {/* Placeholder or real thumbnail logic */}
                <div style={{ width: '100%', height: '100%', background: '#000', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff' }}>Video Preview</span>
                </div>
                <div className="play-overlay">▶</div>
              </div>

              <div className="video-info">
                <h3 className="video-title">Class Recording</h3>
                <button className="play-button" onClick={handlePlayVideo}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Play
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted p-3">No recordings available for this session.</p>
        )}

      </div>

    </div>
  );
};

export default Introduction;
