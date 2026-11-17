import React, { useEffect, useRef } from "react";
import { promptInput } from "../../../utils/promptInput";
import "./RichTextEditor.css";

const TOOLBAR_ITEMS = [
  { label: "Bold", icon: "bi-type-bold", command: "bold" },
  { label: "Italic", icon: "bi-type-italic", command: "italic" },
  { label: "Underline", icon: "bi-type-underline", command: "underline" },
  { type: "divider" },
  { label: "Bullet list", icon: "bi-list-ul", command: "insertUnorderedList" },
  { label: "Numbered list", icon: "bi-list-ol", command: "insertOrderedList" },
  { type: "divider" },
  { label: "Insert link", icon: "bi-link-45deg", command: "link" },
];

const ToolbarButton = ({ label, icon, onClick }) => (
  <button
    type="button"
    className="rich-text-toolbar-btn"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    aria-label={label}
    title={label}
  >
    <i className={`bi ${icon}`} aria-hidden="true" />
  </button>
);

const RichTextEditor = ({ value = "", onChange, placeholder = "Write notes here..." }) => {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!editorRef.current || isInternalChange.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const emitChange = () => {
    if (!editorRef.current || !onChange) return;
    isInternalChange.current = true;
    onChange(editorRef.current.innerHTML);
    requestAnimationFrame(() => {
      isInternalChange.current = false;
    });
  };

  const exec = (command, commandValue = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const handleToolbarClick = async (item) => {
    if (item.command === "link") {
      const url = await promptInput({
        title: "Insert Link",
        inputLabel: "URL",
        placeholder: "https://example.com",
        confirmText: "Insert",
        inputType: "url",
      });
      if (!url) return;
      exec("createLink", url);
      return;
    }
    exec(item.command);
  };

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar" role="toolbar" aria-label="Text formatting">
        {TOOLBAR_ITEMS.map((item, index) =>
          item.type === "divider" ? (
            <span key={`divider-${index}`} className="rich-text-toolbar-divider" aria-hidden="true" />
          ) : (
            <ToolbarButton
              key={item.command}
              label={item.label}
              icon={item.icon}
              onClick={() => handleToolbarClick(item)}
            />
          )
        )}
      </div>

      <div
        ref={editorRef}
        className="rich-text-contenteditable"
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichTextEditor;
