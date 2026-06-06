import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { PageLoader } from "../components/common/Loader.jsx";

/**
 * ProtectedRoute — guards routes that require authentication.
 *
 * Behaviour:
 * - While loading (session restore in progress) → show PageLoader
 *   This prevents a flash of the login page on refresh for logged-in users.
 * - If authenticated → render the child routes via <Outlet />
 * - If NOT authenticated → redirect to /login, preserving the intended
 *   destination in location.state so we can redirect back after login.
 *
 * Usage in AppRouter.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/" element={<Dashboard />} />
 *     <Route path="/room/:roomId" element={<MeetingRoom />} />
 *     <Route path="/profile" element={<Profile />} />
 *   </Route>
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show full-page loader while the session check is running
  if (loading) {
    return <PageLoader label="Restoring your session..." />;
  }

  // Redirect to login, saving the original path for post-login redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}