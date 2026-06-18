import { createContext, useState, useEffect, useCallback } from "react";
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getCurrentUser,
  getStoredToken,
  getStoredUser,
} from "../services/authService.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (!storedToken || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        setUser(data.user);
        setToken(storedToken);
      } catch {
        logoutService();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      setError(null);
      const data = await loginService(credentials);
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const data = await registerService(userData);
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}
