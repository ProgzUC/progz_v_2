import React from "react";
import "./introduction.css";
import introductionData from "./IntroductionData.json";

const FileItem = ({ name, url }) => {
  const handleDownload = () => {
    // In a real app, this would trigger a download. 
    // For now, we'll open the URL which often triggers download for images/zips
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

const Introduction = () => {
  const { breadcrumb, title, learningMaterials, codeChallenge, classRecordings } = introductionData;

  const handlePlayVideo = () => {
    window.open(classRecordings.video.url, "_blank");
  };

  return (
    <div className="intro-container">

      <p className="breadcrumb">
        {breadcrumb.parent} / <strong>{breadcrumb.current}</strong>
      </p>

      <h1 className="intro-title">{title}</h1>

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

          <h2>{learningMaterials.title}</h2>
        </div>

        <p className="section-description">
          {learningMaterials.description}
        </p>

        <div className="file-row">
          {learningMaterials.files.map((file, index) => (
            <FileItem key={index} name={file.name} url={file.url} />
          ))}
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

          <h2>{codeChallenge.title}</h2>
        </div>

        <p className="section-description">
          {codeChallenge.description}
        </p>

        <div className="file-row">
          {codeChallenge.files.map((file, index) => (
            <FileItem key={index} name={file.name} url={file.url} />
          ))}
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

          <h2>{classRecordings.title}</h2>
        </div>

        <p className="section-description">
          <strong>Link:</strong>{" "}
          <a href={classRecordings.link} className="recording-link" target="_blank" rel="noopener noreferrer">
            {classRecordings.link}
          </a>
        </p>

        <div className="video-card">
          <div className="video-thumbnail-container" onClick={handlePlayVideo} style={{ cursor: 'pointer' }}>
            <img
              src={classRecordings.video.thumbnail}
              className="video-thumbnail"
              alt="Video Thumbnail"
            />
            <div className="play-overlay">▶</div>
          </div>

          <div className="video-info">
            <h3 className="video-title">{classRecordings.video.title}</h3>
            <p className="video-time">{classRecordings.video.duration}</p>
            <button className="play-button" onClick={handlePlayVideo}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Play
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Introduction;
