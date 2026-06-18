import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { ProtectedLayout } from "../components/layout/ProtectedLayout.jsx";

import Dashboard from "../pages/Dashboard.jsx";
import MeetingRoom from "../pages/MeetingRoom.jsx";
import MeetingPreview from "../pages/MeetingPreview.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Profile from "../pages/Profile.jsx";
import Settings from "../pages/Settings.jsx";

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        <Route element={<ProtectedRoute />}>
          <Route path="/room/preview" element={<MeetingPreview />} />
          <Route path="/room/:roomId" element={<MeetingRoom />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="/meetings" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
