import { toast } from "react-toastify";
import "./toastDialog.css";

/**
 * Yes/Cancel confirmation via react-toastify.
 * Returns true if the user confirms.
 */
export async function confirmAction({
  title = "Are you sure?",
  text = "",
  confirmButtonText = "Yes",
  cancelButtonText = "Cancel",
  confirmButtonColor = "#0B3D2E",
  cancelButtonColor = "#718096",
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
        <div className="toast-dialog" role="alertdialog" aria-labelledby="toast-confirm-title">
          <p id="toast-confirm-title" className="toast-dialog__title">
            {title}
          </p>
          {text ? <p className="toast-dialog__text">{text}</p> : null}
          <div className="toast-dialog__actions">
            <button
              type="button"
              className="toast-dialog__btn toast-dialog__btn--cancel"
              style={{ backgroundColor: cancelButtonColor }}
              onClick={() => {
                finish(false);
                closeToast();
              }}
            >
              {cancelButtonText}
            </button>
            <button
              type="button"
              className="toast-dialog__btn toast-dialog__btn--confirm"
              style={{ backgroundColor: confirmButtonColor }}
              onClick={() => {
                finish(true);
                closeToast();
              }}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: true,
        className: "toast-dialog-container",
        onClose: () => finish(false),
      }
    );
  });
}
