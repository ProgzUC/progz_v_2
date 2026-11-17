const COMPILER_BASE_URL = import.meta.env.VITE_COMPILER_BASE_URL;

const buildCompilerUrl = (mode) => {
  if (!COMPILER_BASE_URL) {
    if (import.meta.env.DEV) {
      console.warn("VITE_COMPILER_BASE_URL is not set.");
    }
    return null;
  }

  const normalizedBase = COMPILER_BASE_URL.replace(/\/$/, "");
  return `${normalizedBase}/#/${mode}`;
};

export function getCompilerSrc(mode) {
  const key = String(mode || "html").toLowerCase();
  return buildCompilerUrl(key) || buildCompilerUrl("html") || "";
}

export function getLessonCompilerMode(section = {}) {
  const text = [
    section.language,
    section.type,
    section.lessonType,
    section.category,
    section.sectionName,
    section.title,
    section.moduleName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\b(css|styling)\b/.test(text)) return "css";
  if (/\b(javascript|js|scripting)\b/.test(text)) return "js";
  if (/\b(html|markup)\b/.test(text)) return "html";

  return "html";
}
