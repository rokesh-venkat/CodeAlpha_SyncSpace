import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { ProtectedLayout } from "../components/layout/ProtectedLayout.jsx";

// Pages
import Dashboard from "../pages/Dashboard.jsx";
import MeetingRoom from "../pages/MeetingRoom.jsx";
import MeetingPreview from "../pages/MeetingPreview.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";

/**
 * PublicOnlyRoute — redirects already-authenticated users away from
 * login/register pages to the dashboard.
 */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Wait for session restore before deciding
  if (loading) return null;

  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚧</span>
        </div>
        <h2 className="font-semibold text-text-primary">{title}</h2>
        <p className="text-sm text-text-muted">Coming in a future phase</p>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public auth routes ─────────────────────────────────── */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* ── Room routes — protected, no sidebar layout ─────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/room/preview" element={<MeetingPreview />} />
          <Route path="/room/:roomId" element={<MeetingRoom />} />
        </Route>

        {/* ── App routes — protected, with sidebar/navbar layout ─── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="/meetings" element={<Placeholder title="Meetings" />} />
            <Route path="/schedule" element={<Placeholder title="Schedule" />} />
            <Route path="/people" element={<Placeholder title="People" />} />
            <Route path="/profile" element={<Placeholder title="Profile" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Route>
        </Route>

        {/* ── Catch-all ──────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}