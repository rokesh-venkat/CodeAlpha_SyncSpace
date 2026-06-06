import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getCurrentUser,
  getStoredToken,
  getStoredUser,
} from "../services/authService.js";

/**
 * AuthContext — global authentication state for SyncSpace.
 *
 * Provides:
 *   user          — the authenticated user object (or null)
 *   token         — the JWT string (or null)
 *   isAuthenticated — boolean derived from user !== null
 *   loading       — true while the initial session check is running
 *   error         — last auth error message (or null)
 *   login()       — async function: calls API, updates state
 *   register()    — async function: calls API, updates state
 *   logout()      — clears state and localStorage
 *   clearError()  — resets the error field
 *
 * Auth persistence strategy:
 *   On every app startup, we check localStorage for a stored token.
 *   If found, we call GET /api/auth/me to validate it with the server.
 *   If valid → restore the session silently.
 *   If invalid/expired → clear localStorage and show login.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true until session check completes
  const [error, setError] = useState(null);

  // ── Session restore on app startup ─────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (!storedToken || !storedUser) {
        // No stored credentials — user is logged out
        setLoading(false);
        return;
      }

      try {
        // Validate the stored token with the server
        // This catches expired tokens or accounts that were deleted
        const data = await getCurrentUser();
        setUser(data.user);
        setToken(storedToken);
      } catch {
        // Token is invalid or expired — clear everything
        logoutService();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Login ───────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    try {
      setError(null);
      const data = await loginService(credentials);
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
      return { success: false, message };
    }
  }, []);

  // ── Register ────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const data = await registerService(userData);
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      return { success: false, message };
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    logoutService();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  // ── Clear error ─────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth — convenience hook for consuming AuthContext.
 * Throws if used outside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}