import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Video, Link2, Clock, Users, Calendar,
  TrendingUp, Mic, ScreenShare, Plus, ArrowRight,
  Play, Star
} from "lucide-react";
import { Button } from "../components/common/Button";
import { Card, StatCard } from "../components/common/Card";
import { Modal } from "../components/common/Modal";

const stats = [
  { label: "Meetings this week", value: "12", delta: 8, icon: <Video size={20} />, color: "violet" },
  { label: "Total participants", value: "84", delta: 12, icon: <Users size={20} />, color: "emerald" },
  { label: "Hours connected", value: "6.4h", delta: -3, icon: <Clock size={20} />, color: "sky" },
  { label: "Scheduled today", value: "3", icon: <Calendar size={20} />, color: "amber" },
];

const recentMeetings = [
  { id: "m1", title: "Design Review — Sprint 14", duration: "48m", participants: 6, time: "Today, 10:30 AM", status: "ended" },
  { id: "m2", title: "Backend Architecture Discussion", duration: "1h 12m", participants: 4, time: "Yesterday, 3:00 PM", status: "ended" },
  { id: "m3", title: "Weekly Standup", duration: "22m", participants: 9, time: "Yesterday, 9:00 AM", status: "ended" },
  { id: "m4", title: "Client Demo — Q2 Review", duration: "—", participants: 0, time: "Today, 4:00 PM", status: "upcoming" },
];

const upcomingSlots = [
  { title: "1:1 with Alex", time: "2:00 PM", tag: "1:1" },
  { title: "Client Demo", time: "4:00 PM", tag: "Demo" },
  { title: "Team Retrospective", time: "5:30 PM", tag: "Team" },
];

export default function Dashboard() {
  const [joinModal, setJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-5 md:p-7 max-w-7xl mx-auto space-y-7">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-fuchsia-800 p-6 md:p-8">
        {/* Decorative orbs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-4 right-48 w-16 h-16 rounded-full bg-fuchsia-500/20" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1">
            <p className="text-violet-200 text-sm font-medium mb-1">{greeting} 👋</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Welcome back, Rokesh
            </h1>
            <p className="text-violet-300 text-sm mt-1.5">
              You have 3 meetings scheduled for today. Ready to sync up?
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/room/preview">
              <Button variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Video size={14} />
                Start Meeting
              </Button>
            </Link>
            <Button
              variant="secondary"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setJoinModal(true)}
            >
              <Link2 size={14} />
              Join
            </Button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: quick actions + recent meetings */}
        <div className="xl:col-span-2 space-y-6">

          {/* Quick action cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Create Meeting */}
            <Link to="/room/preview">
              <Card
                hover
                className="group border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                    <Video size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary text-sm">Create Meeting</h3>
                    <p className="text-xs text-text-muted mt-0.5">Start an instant video call</p>
                  </div>
                  <ArrowRight size={14} className="text-text-muted group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all mt-0.5" />
                </div>
                <div className="mt-4 flex gap-2">
                  {[<Mic size={12} />, <Video size={12} />, <ScreenShare size={12} />].map((icon, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-2 text-text-muted text-[10px]">
                      {icon}
                    </span>
                  ))}
                </div>
              </Card>
            </Link>

            {/* Join Meeting */}
            <Card
              hover
              onClick={() => setJoinModal(true)}
              className="group border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Link2 size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary text-sm">Join Meeting</h3>
                  <p className="text-xs text-text-muted mt-0.5">Enter a room code or link</p>
                </div>
                <ArrowRight size={14} className="text-text-muted group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all mt-0.5" />
              </div>
              <div className="mt-4">
                <div className="h-7 rounded-lg bg-surface-2 border border-border flex items-center px-2 gap-2">
                  <Hash size={11} className="text-text-muted" />
                  <span className="text-[11px] text-text-muted">abc-xyz-123</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent meetings */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary text-sm">Recent Meetings</h2>
              <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300 text-xs">
                View all <ArrowRight size={12} />
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recentMeetings.map((m) => (
                <div key={m.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3 group">
                  <div className={`
                    w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                    ${m.status === "upcoming" ? "bg-amber-500/15 text-amber-400" : "bg-surface-2 text-text-muted"}
                  `}>
                    {m.status === "upcoming" ? <Calendar size={14} /> : <Play size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{m.title}</p>
                    <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-2">
                      <span>{m.time}</span>
                      {m.status === "ended" && (
                        <>
                          <span className="w-0.5 h-0.5 rounded-full bg-text-muted" />
                          <span>{m.duration}</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-text-muted" />
                          <Users size={9} /> {m.participants}
                        </>
                      )}
                    </p>
                  </div>
                  <span className={`
                    text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0
                    ${m.status === "upcoming"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-surface-2 text-text-muted"}
                  `}>
                    {m.status === "upcoming" ? "Upcoming" : "Ended"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: today's schedule + activity */}
        <div className="space-y-5">

          {/* Today's schedule */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary text-sm">Today's Schedule</h2>
              <span className="text-[10px] text-text-muted bg-surface-2 px-2 py-0.5 rounded-full">3 events</span>
            </div>
            <div className="space-y-2">
              {upcomingSlots.map((slot, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer group">
                  <div className="w-1 h-8 rounded-full bg-violet-500/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{slot.title}</p>
                    <p className="text-[11px] text-text-muted">{slot.time}</p>
                  </div>
                  <span className="text-[10px] bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded-md shrink-0">
                    {slot.tag}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="secondary" size="sm" className="w-full mt-3">
              <Plus size={13} /> Schedule Meeting
            </Button>
          </Card>

          {/* Activity chart placeholder */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary text-sm">Weekly Activity</h2>
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            {/* Bar chart placeholder */}
            <div className="flex items-end gap-1.5 h-20">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => {
                const days = ["M", "T", "W", "T", "F", "S", "S"];
                const isToday = i === 4;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-md transition-all ${isToday ? "bg-violet-500" : "bg-surface-3 hover:bg-violet-500/40"}`}
                      style={{ height: `${h}%` }}
                    />
                    <span className={`text-[9px] ${isToday ? "text-violet-400 font-bold" : "text-text-muted"}`}>
                      {days[i]}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-text-muted mt-3 text-center">
              ↑ 12% more meetings than last week
            </p>
          </Card>

          {/* Favorite rooms */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Star size={13} className="text-amber-400" />
              <h2 className="font-semibold text-text-primary text-sm">Favorite Rooms</h2>
            </div>
            {["Design Team", "Engineering", "Product Hub"].map((name, i) => (
              <Link
                key={i}
                to={`/room/${name.toLowerCase().replace(" ", "-")}`}
                className="flex items-center gap-2.5 py-2 hover:text-violet-400 transition-colors group"
              >
                <div className="w-6 h-6 rounded-lg bg-surface-2 flex items-center justify-center text-[10px] font-bold text-text-muted">
                  {name[0]}
                </div>
                <span className="text-xs text-text-secondary group-hover:text-violet-400 flex-1">{name}</span>
                <ArrowRight size={11} className="text-text-muted group-hover:text-violet-400 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            ))}
          </Card>
        </div>
      </div>

      {/* Join modal */}
      <Modal
        isOpen={joinModal}
        onClose={() => setJoinModal(false)}
        title="Join a Meeting"
        footer={
          <>
            <Button variant="secondary" onClick={() => setJoinModal(false)}>Cancel</Button>
            <Button onClick={() => setJoinModal(false)}>Join Now</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">Enter a meeting code or paste an invite link to join.</p>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Meeting code or link
            </label>
            <input
              type="text"
              placeholder="abc-xyz-123 or https://syncspace.dev/room/..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="
                w-full px-3 py-2.5 rounded-xl text-sm
                bg-surface-2 border border-border
                text-text-primary placeholder:text-text-muted
                focus:outline-none focus:border-violet-500/60
                transition-colors
              "
              autoFocus
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-violet-500 rounded" defaultChecked />
              <span className="text-xs text-text-muted">Turn on camera</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-violet-500 rounded" defaultChecked />
              <span className="text-xs text-text-muted">Turn on mic</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Hash({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}