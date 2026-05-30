import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedLayout } from "../components/layout/ProtectedLayout";
import Dashboard from "../pages/Dashboard";
import MeetingRoom from "../pages/MeetingRoom";
import MeetingPreview from "../pages/MeetingPreview";

function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
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
        {/* Room routes — no layout wrapper */}
        <Route path="/room/preview" element={<MeetingPreview />} />
        <Route path="/room/:roomId" element={<MeetingRoom />} />

        {/* App routes — with sidebar/navbar layout */}
        <Route element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/meetings" element={<Placeholder title="Meetings" />} />
          <Route path="/schedule" element={<Placeholder title="Schedule" />} />
          <Route path="/people" element={<Placeholder title="People" />} />
          <Route path="/profile" element={<Placeholder title="Profile" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}