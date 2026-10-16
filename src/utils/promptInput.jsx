import { useState } from "react";
import { toast } from "react-toastify";
import "./toastDialog.css";

function PromptToastBody({
  title,
  inputLabel,
  placeholder,
  confirmText,
  cancelText,
  inputValue,
  inputType,
  validate,
  onResult,
  closeToast,
}) {
  const [value, setValue] = useState(inputValue || "");
  const [error, setError] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("This field is required");
      return;
    }
    if (typeof validate === "function") {
      const message = validate(trimmed);
      if (message) {
        setError(message);
        return;
      }
    }
    onResult(trimmed);
    closeToast();
  };

  return (
    <div className="toast-dialog toast-dialog--prompt" role="alertdialog" aria-labelledby="toast-prompt-title">
      <p id="toast-prompt-title" className="toast-dialog__title">
        {title}
      </p>
      {inputLabel ? <label className="toast-dialog__label">{inputLabel}</label> : null}
      <input
        className="toast-dialog__input"
        type={inputType === "url" ? "url" : "text"}
        placeholder={placeholder}
        value={value}
        autoFocus
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
      />
      {error ? <p className="toast-dialog__error">{error}</p> : null}
      <div className="toast-dialog__actions">
        <button
          type="button"
          className="toast-dialog__btn toast-dialog__btn--cancel"
          style={{ backgroundColor: "#718096" }}
          onClick={() => {
            onResult(null);
            closeToast();
          }}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className="toast-dialog__btn toast-dialog__btn--confirm"
          style={{ backgroundColor: "#2a7d38" }}
          onClick={submit}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}

/**
 * Custom input dialog via react-toastify (replaces SweetAlert / window.prompt).
 * @returns {Promise<string|null>} entered value, or null if cancelled
 */
export async function promptInput({
  title = "Enter value",
  inputLabel = "",
  placeholder = "",
  confirmText = "Add",
  cancelText = "Cancel",
  inputValue = "",
  inputType = "url",
  validate,
} = {}) {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
      toast.dismiss(toastId);
    };

    const toastId = toast(
      ({ closeToast }) => (
        <PromptToastBody
          title={title}
          inputLabel={inputLabel}
          placeholder={placeholder}
          confirmText={confirmText}
          cancelText={cancelText}
          inputValue={inputValue}
          inputType={inputType}
          validate={validate}
          onResult={finish}
          closeToast={closeToast}
        />
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: true,
        className: "toast-dialog-container toast-dialog-container--prompt",
        onClose: () => finish(null),
      }
    );
  });
}
