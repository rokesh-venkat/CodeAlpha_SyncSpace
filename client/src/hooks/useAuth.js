/**
 * useAuth hook — re-exported from AuthContext for a cleaner import path.
 *
 * Usage in any component:
 *   import { useAuth } from "../hooks/useAuth";
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */
export { useAuth } from "../context/AuthContext.jsx";