import React from "react";
import { isHtmlEmpty, sanitizeHtml } from "./richTextUtils";
import "./RichTextEditor.css";

const RichTextContent = ({ html, className = "", as: Tag = "div" }) => {
  if (isHtmlEmpty(html)) return null;

  return (
    <Tag
      className={`rich-text-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
};

export default RichTextContent;
