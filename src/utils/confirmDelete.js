import { confirmAction } from "./confirmAction";

export async function confirmDelete(title, text) {
  return confirmAction({
    title,
    text,
    icon: "warning",
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#718096",
  });
}
