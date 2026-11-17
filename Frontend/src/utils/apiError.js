/**
 * Normalize API / Axios / thrown errors into a user-facing message.
 */
export const getErrorMessage = (err, fallback = "Something went wrong") => {
  if (!err) return fallback;
  if (typeof err === "string") return err;

  return (
    err.response?.data?.msg ||
    err.response?.data?.message ||
    err.message ||
    fallback
  );
};
