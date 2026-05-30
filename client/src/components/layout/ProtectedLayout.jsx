import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function ProtectedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar
        onMenuToggle={() => setSidebarOpen((p) => !p)}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="pt-14 lg:pl-60 min-h-screen">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}