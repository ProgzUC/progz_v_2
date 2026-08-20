const COMPILER_URLS = {
  html: "https://uccompiler.urbancode.in/#/html",
  css: "https://uccompiler.urbancode.in/#/css",
  js: "https://uccompiler.urbancode.in/#/js",
};

export function getCompilerSrc(mode) {
  const key = String(mode || "html").toLowerCase();
  return COMPILER_URLS[key] || COMPILER_URLS.html;
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
