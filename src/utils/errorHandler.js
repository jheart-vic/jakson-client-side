import toast from "react-hot-toast";

// utils/errorHandler.js
export const handleApiError = (err, defaultMessage) => {
  if (err?.isNetworkError) return;
  toast.error(err?.response?.data?.message || defaultMessage);
};