import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Video, User, Settings, LogOut,
  Calendar, Users, Wifi, Hash, Plus, ChevronRight
} from "lucide-react";

const mainNav = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Video, label: "Meetings", to: "/meetings" },
  { icon: Calendar, label: "Schedule", to: "/schedule" },
  { icon: Users, label: "People", to: "/people" },
];

const secondaryNav = [
  { icon: User, label: "Profile", to: "/profile" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

const recentRooms = [
  { id: "abc-123", name: "Design Review", participants: 4, active: true },
  { id: "xyz-456", name: "Sprint Planning", participants: 8, active: false },
  { id: "qrs-789", name: "1:1 with Alex", participants: 2, active: false },
];

export function Sidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-14 left-0 bottom-0 z-30 w-60 flex flex-col
          bg-bg-primary border-r border-border
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-6 scrollbar-thin">

          {/* New meeting quick action */}
          <div className="px-1">
            <Link
              to="/room/preview"
              onClick={onClose}
              className="
                flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl
                bg-violet-600 hover:bg-violet-500 text-white
                text-sm font-medium transition-all active:scale-95
              "
            >
              <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center">
                <Plus size={12} />
              </div>
              New Meeting
            </Link>
          </div>

          {/* Main navigation */}
          <nav className="space-y-0.5">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mb-2">
              Main
            </p>
            {mainNav.map(({ icon: Icon, label, to }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-xl text-sm
                    font-medium transition-all group
                    ${active
                      ? "bg-violet-500/15 text-violet-400"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-2"
                    }
                  `}
                >
                  <Icon
                    size={16}
                    className={active ? "text-violet-400" : "text-text-muted group-hover:text-text-primary"}
                  />
                  <span className="flex-1">{label}</span>
                  {active && <div className="w-1 h-1 rounded-full bg-violet-400" />}
                </Link>
              );
            })}
          </nav>

          {/* Recent rooms */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                Recent Rooms
              </p>
              <button className="text-text-muted hover:text-text-primary transition-colors">
                <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-0.5">
              {recentRooms.map((room) => (
                <Link
                  key={room.id}
                  to={`/room/${room.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all group"
                >
                  <Hash size={14} className="shrink-0" />
                  <span className="flex-1 truncate text-xs">{room.name}</span>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${room.active ? "bg-emerald-400" : "bg-surface-3"}`} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="border-t border-border p-2 space-y-0.5">
          {secondaryNav.map(({ icon: Icon, label, to }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl text-sm
                  font-medium transition-all
                  ${active
                    ? "bg-violet-500/15 text-violet-400"
                    : "text-text-muted hover:text-text-primary hover:bg-surface-2"
                  }
                `}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={16} />
            Sign out
          </button>
        </div>

        {/* User badge at very bottom */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-1 border border-border">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              R
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">Rokesh Venkat</p>
              <p className="text-[10px] text-text-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Online
              </p>
            </div>
            <Wifi size={12} className="text-text-muted shrink-0 ml-auto" />
          </div>
        </div>
      </aside>
    </>
  );
}