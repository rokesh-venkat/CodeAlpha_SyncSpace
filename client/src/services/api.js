import axios from "axios";

/**
 * api — a pre-configured Axios instance.
 *
 * All API calls in the app go through this instance so that:
 * - The base URL is set in one place
 * - The JWT token is automatically attached to every request
 * - 401 responses are handled centrally (token expired → logout)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor — attaches the JWT from localStorage to every
 * outgoing request as an Authorization header.
 *
 * If there is no token (user is logged out), the header is not set,
 * and protected routes will respond with 401.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("syncspace_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — handles global response errors.
 *
 * On 401: the token has expired or been invalidated.
 * We clear localStorage and redirect to /login so the user
 * re-authenticates rather than seeing confusing error messages.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on an auth page
      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      if (!isAuthPage) {
        localStorage.removeItem("syncspace_token");
        localStorage.removeItem("syncspace_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;