import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("evenly_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiErrorMessage = (error) => {
  if (!error.response) {
    return "We could not reach the server. Check your internet connection and try again.";
  }

  const apiError = error.response?.data?.error;
  const firstDetail = apiError?.details?.[0]?.message;
  return firstDetail || apiError?.message || error.message || "Something went wrong";
};

export const apiFieldErrors = (error) => {
  const details = error.response?.data?.error?.details;
  if (!Array.isArray(details)) return {};

  return details.reduce((acc, detail) => {
    const rawPath = String(detail?.path || "");
    const normalized = rawPath.startsWith("body.") ? rawPath.slice(5) : rawPath;
    const field = normalized.split(".").pop();
    if (field && detail?.message && !acc[field]) {
      acc[field] = detail.message;
    }
    return acc;
  }, {});
};
