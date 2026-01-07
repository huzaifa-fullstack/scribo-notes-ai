import axios, { type AxiosResponse } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for Render free tier cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url || "";

    if (status === 401) {
      // Do NOT hard-redirect for auth endpoints or password change; let the caller show errors
      const isAuthRoute =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/google") ||
        url.includes("/auth/callback") ||
        url.includes("/auth/verify-email") ||
        url.includes("/auth/forgot-password") ||
        url.includes("/auth/reset-password");

      // Don't logout for password change errors (incorrect current password)
      const isPasswordChange = url.includes("/profile/password");

      if (!isAuthRoute && !isPasswordChange) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Use client-side navigation fallback – avoid reload loops on /login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================
// AUTH API ENDPOINTS
// ============================================

/**
 * Send password reset email
 * @param email - User's email address
 */
export const forgotPassword = async (email: string) => {
  return api.post("/auth/forgot-password", { email });
};

/**
 * Reset password with token
 * @param token - Reset token from email
 * @param password - New password
 */
export const resetPassword = async (token: string, password: string) => {
  return api.post("/auth/reset-password", { token, password });
};
