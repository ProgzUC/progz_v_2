import Swal from "sweetalert2";

/**
 * Custom input dialog (replaces window.prompt).
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
  const result = await Swal.fire({
    title,
    input: inputType === "url" ? "url" : "text",
    inputLabel: inputLabel || undefined,
    inputPlaceholder: placeholder,
    inputValue,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#2a7d38",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
    focusConfirm: false,
    customClass: {
      popup: "progz-prompt-popup",
      confirmButton: "progz-prompt-confirm",
      cancelButton: "progz-prompt-cancel",
    },
    inputValidator: (value) => {
      if (!value?.trim()) return "This field is required";
      if (typeof validate === "function") {
        const message = validate(value.trim());
        if (message) return message;
      }
      return undefined;
    },
  });

  if (!result.isConfirmed) return null;
  return String(result.value || "").trim();
}
