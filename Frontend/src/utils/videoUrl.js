/**
 * Extract a YouTube video ID from common URL formats.
 */
export const getYouTubeId = (url) => {
  if (!url || typeof url !== "string") return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

/**
 * Extract a Google Drive file ID from common share / open / preview URLs.
 */
export const getGoogleDriveFileId = (url) => {
  if (!url || typeof url !== "string") return null;
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/?#]+)/,
    /drive\.google\.com\/open\?[^#]*[?&]id=([^&#]+)/,
    /drive\.google\.com\/uc\?[^#]*[?&]id=([^&#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
};

/**
 * Convert a Google Drive share link to the embeddable /preview URL.
 * Returns null if the URL is not a Drive file link.
 */
export const toGoogleDrivePreviewUrl = (url) => {
  const fileId = getGoogleDriveFileId(url);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

/**
 * Normalize a video URL for storage: Drive links → /preview; others unchanged.
 */
export const normalizeVideoUrlForStorage = (url) => {
  if (!url || typeof url !== "string") return url;
  return toGoogleDrivePreviewUrl(url) || url.trim();
};

/**
 * True if the value is a supported YouTube or Google Drive video URL.
 */
export const isValidVideoUrl = (url) =>
  Boolean(getYouTubeId(url) || getGoogleDriveFileId(url));

/**
 * Build an iframe-ready embed URL for lightbox / preview players.
 */
export const getVideoEmbedUrl = (url, { autoplay = false } = {}) => {
  const youtubeId = getYouTubeId(url);
  if (youtubeId) {
    const qs = autoplay ? "?autoplay=1" : "";
    return `https://www.youtube.com/embed/${youtubeId}${qs}`;
  }
  const drivePreview = toGoogleDrivePreviewUrl(url);
  if (drivePreview) return drivePreview;
  return null;
};
