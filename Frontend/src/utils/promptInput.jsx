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
    <div className="toast-confirm toast-confirm--prompt" role="alertdialog">
      <span className="toast-confirm__msg">{title}</span>
      {inputLabel ? <span className="toast-confirm__hint">{inputLabel}</span> : null}
      <input
        className="toast-confirm__input"
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
      {error ? <span className="toast-confirm__error">{error}</span> : null}
      <span className="toast-confirm__actions">
        <button
          type="button"
          className="toast-confirm__btn"
          onClick={() => {
            onResult(null);
            closeToast();
          }}
        >
          {cancelText}
        </button>
        <button type="button" className="toast-confirm__btn toast-confirm__btn--yes" onClick={submit}>
          {confirmText}
        </button>
      </span>
    </div>
  );
}

/**
 * Input prompt as a react-toastify toast.
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

    const toastId = toast.info(
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
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: true,
        theme: "colored",
        className: "toast-confirm-toast toast-confirm-toast--prompt",
        onClose: () => finish(null),
      }
    );
  });
}
