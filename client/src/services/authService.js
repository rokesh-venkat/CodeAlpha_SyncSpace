import api from "./api.js";

/**
 * authService — thin wrapper around the auth API endpoints.
 *
 * Responsibilities:
 * - Make HTTP requests to the auth endpoints
 * - Persist / clear the token and user in localStorage
 * - Extract and return data in a consistent shape
 *
 * AuthContext consumes this service and manages React state.
 * Components never call the API directly — always go through context.
 */

const TOKEN_KEY = "syncspace_token";
const USER_KEY = "syncspace_user";

// ─── Token / User persistence helpers ────────────────────────────────────

export const saveAuthData = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// ─── API calls ────────────────────────────────────────────────────────────

/**
 * register — POST /api/auth/register
 * Creates a new account and stores the returned token + user.
 */
export const register = async ({ name, email, password }) => {
  const { data } = await api.post("/auth/register", { name, email, password });
  saveAuthData(data.token, data.user);
  return data;
};

/**
 * login — POST /api/auth/login
 * Authenticates the user and stores the returned token + user.
 */
export const login = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  saveAuthData(data.token, data.user);
  return data;
};

/**
 * logout — clears all stored auth data.
 * No API call needed — JWT is stateless on the server.
 */
export const logout = () => {
  clearAuthData();
};

/**
 * getCurrentUser — GET /api/auth/me
 * Fetches fresh user data from the server using the stored token.
 * Used on app startup to validate a persisted session.
 */
export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};