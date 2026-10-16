import Swal from "sweetalert2";

/**
 * Yes/Cancel dialog. Toast cannot replace confirm flows.
 * Returns true if the user confirms.
 */
export async function confirmAction({
  title = "Are you sure?",
  text = "",
  icon = "warning",
  confirmButtonText = "Yes",
  cancelButtonText = "Cancel",
  confirmButtonColor = "#0B3D2E",
  cancelButtonColor = "#718096",
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
  });

  return result.isConfirmed;
}
