import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Video, Bell, Search, Menu, X, ChevronDown, Wifi
} from "lucide-react";
import { ThemeToggle } from "../common/ThemeToggle";
import { Button } from "../common/Button";

const navLinks = [
  { label: "Dashboard", to: "/" },
  { label: "Meetings", to: "/meetings" },
  { label: "Schedule", to: "/schedule" },
];

export function Navbar({ onMenuToggle, sidebarOpen }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-bg-primary/90 backdrop-blur-lg border-b border-border">
      <div className="h-full px-4 flex items-center gap-3">

        {/* Mobile menu + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center hover:bg-surface-2 text-text-muted transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Wifi size={14} className="text-white" />
            </div>
            <span className="font-bold text-text-primary text-sm tracking-tight hidden sm:block">
              Sync<span className="text-violet-400">Space</span>
            </span>
          </Link>
        </div>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${location.pathname === link.to
                  ? "text-violet-400 bg-violet-500/10"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-2"
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className={`
          hidden sm:flex flex-1 max-w-xs ml-auto items-center gap-2
          px-3 py-1.5 rounded-xl border transition-all
          ${searchFocused
            ? "border-violet-500/60 bg-surface-1"
            : "border-border bg-surface-1 hover:border-border-hover"}
        `}>
          <Search size={13} className="text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search meetings, people..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none w-full"
          />
          <kbd className="text-[10px] text-text-muted border border-border rounded px-1 hidden md:block">⌘K</kbd>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto sm:ml-3">
          <ThemeToggle compact />

          {/* Notifications */}
          <button className="relative w-8 h-8 rounded-xl flex items-center justify-center hover:bg-surface-2 text-text-muted hover:text-text-primary transition-all">
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
          </button>

          {/* New Meeting CTA */}
          <Link to="/room/preview">
            <Button size="sm" className="hidden md:flex ml-1">
              <Video size={13} />
              New Meeting
            </Button>
          </Link>

          {/* Profile */}
          <div className="relative ml-1">
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-surface-2 transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-[10px] font-bold">
                R
              </div>
              <span className="text-xs font-medium text-text-primary hidden md:block">Rokesh</span>
              <ChevronDown size={12} className="text-text-muted hidden md:block" />
            </button>

            {/* Profile dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-1 border border-border rounded-2xl shadow-xl shadow-black/20 py-1 z-50">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-semibold text-text-primary">Rokesh Venkat</p>
                  <p className="text-[11px] text-text-muted">rokesh@syncspace.dev</p>
                </div>
                {[
                  { label: "Profile", to: "/profile" },
                  { label: "Settings", to: "/settings" },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-border mt-1 pt-1">
                  <button className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors rounded-lg mx-0">
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}