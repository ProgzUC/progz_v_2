export const getHtmlPlainText = (html) => {
  if (!html) return "";
  return String(html)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const isHtmlEmpty = (html) => getHtmlPlainText(html).length === 0;

/**
 * True when HTML has real readable content — not empty or punctuation junk like ".,ṁ".
 */
export const hasMeaningfulHtml = (html, { minChars = 2 } = {}) => {
  const text = getHtmlPlainText(html);
  if (!text) return false;
  const meaningful = text.replace(/[^\p{L}\p{N}]+/gu, "");
  return meaningful.length >= minChars;
};

export const sanitizeHtml = (html) => {
  if (!html) return "";

  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, iframe, object, embed").forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith("on") || attr.name === "style") {
        el.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
};
