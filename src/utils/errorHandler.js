import toast from "react-hot-toast";

// utils/errorHandler.js
// Call this in catch blocks. It will only show a toast if the axios
// interceptor hasn't already shown one (err.isHandled = true).
export const handleApiError = (err, defaultMessage) => {
  if (err?.isHandled) return;          // axios interceptor already toasted
  if (err?.isNetworkError) return;     // network toast already shown
  toast.error(err?.response?.data?.message || defaultMessage);
};
