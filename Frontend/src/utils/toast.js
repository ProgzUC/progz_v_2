import { toast } from "react-toastify";

export const showSuccess = (message) =>
  toast.success(message, { position: "top-right", autoClose: 2500 });

export const showError = (message) =>
  toast.error(message, { position: "top-right", autoClose: 3500 });

export const showWarning = (message) =>
  toast.warn(message, { position: "top-right", autoClose: 3000 });

export const showInfo = (message) =>
  toast.info(message, { position: "top-right", autoClose: 2500 });
