import { toast } from "react-toastify";
import "./toastDialog.css";

/**
 * Yes/Cancel confirmation as a normal react-toastify toast (top-right).
 * Returns true if the user confirms.
 */
export async function confirmAction({
  title = "Are you sure?",
  text = "",
  confirmButtonText = "Yes",
  cancelButtonText = "Cancel",
} = {}) {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
      toast.dismiss(toastId);
    };

    const message = text ? `${title} — ${text}` : title;

    const toastId = toast.warn(
      ({ closeToast }) => (
        <div className="toast-confirm" role="alertdialog">
          <span className="toast-confirm__msg">{message}</span>
          <span className="toast-confirm__actions">
            <button
              type="button"
              className="toast-confirm__btn"
              onClick={() => {
                finish(false);
                closeToast();
              }}
            >
              {cancelButtonText}
            </button>
            <button
              type="button"
              className="toast-confirm__btn toast-confirm__btn--yes"
              onClick={() => {
                finish(true);
                closeToast();
              }}
            >
              {confirmButtonText}
            </button>
          </span>
        </div>
      ),
      {
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: true,
        theme: "colored",
        className: "toast-confirm-toast",
        onClose: () => finish(false),
      }
    );
  });
}
