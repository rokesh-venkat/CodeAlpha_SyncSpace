import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Video, Link2, Clock, Users, Calendar,
  TrendingUp, Mic, ScreenShare, Plus, ArrowRight,
  Play, Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../hooks/useSocket.js";
import { ConnectionStatus } from "../components/meeting/ConnectionStatus.jsx";
import { Button } from "../components/common/Button.jsx";
import { Card, StatCard } from "../components/common/Card.jsx";
import { Modal } from "../components/common/Modal.jsx";

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

// Generate a simple room ID
const generateRoomId = () =>
  Math.random().toString(36).slice(2, 6) +
  "-" +
  Math.random().toString(36).slice(2, 6);

export default function Dashboard() {
  const { user } = useAuth();
  const { connected, onlineCount } = useSocket();
  const [joinModal, setJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Meetings this week", value: "12", delta: 8, icon: <Video size={20} />, color: "violet" },
    { label: "Users online now", value: String(onlineCount), icon: <Users size={20} />, color: "emerald" },
    { label: "Hours connected", value: "6.4h", delta: -3, icon: <Clock size={20} />, color: "sky" },
    { label: "Scheduled today", value: "3", icon: <Calendar size={20} />, color: "amber" },
  ];

  const newRoomId = generateRoomId();

  return (
    <div className="p-5 md:p-7 max-w-7xl mx-auto space-y-7">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-fuchsia-800 p-6 md:p-8">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <p className="text-violet-200 text-sm font-medium">{greeting} 👋</p>
              {/* Live connection badge */}
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                connected
                  ? "bg-white/10 text-emerald-300"
                  : "bg-white/10 text-white/50"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
                {connected ? `${onlineCount} online` : "Connecting..."}
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] || "there"}
            </h1>
            <p className="text-violet-300 text-sm mt-1.5">
              You have 3 meetings scheduled for today. Ready to sync up?
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to={`/room/${newRoomId}`}>
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">

          {/* Quick actions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to={`/room/${newRoomId}`}>
              <Card hover className="group border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                    <Video size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary text-sm">Create Meeting</h3>
                    <p className="text-xs text-text-muted mt-0.5">Start an instant video call</p>
                  </div>
                  <ArrowRight size={14} className="text-text-muted group-hover:text-violet-400 transition-all mt-0.5" />
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

            <Card hover onClick={() => setJoinModal(true)} className="group border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Link2 size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary text-sm">Join Meeting</h3>
                  <p className="text-xs text-text-muted mt-0.5">Enter a room code or link</p>
                </div>
                <ArrowRight size={14} className="text-text-muted group-hover:text-emerald-400 transition-all mt-0.5" />
              </div>
            </Card>
          </div>

          {/* Recent meetings */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary text-sm">Recent Meetings</h2>
              <Button variant="ghost" size="sm" className="text-violet-400 text-xs">
                View all <ArrowRight size={12} />
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recentMeetings.map((m) => (
                <div key={m.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    m.status === "upcoming" ? "bg-amber-500/15 text-amber-400" : "bg-surface-2 text-text-muted"
                  }`}>
                    {m.status === "upcoming" ? <Calendar size={14} /> : <Play size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{m.title}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {m.time} {m.status === "ended" && `· ${m.duration} · ${m.participants} people`}
                    </p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    m.status === "upcoming" ? "bg-amber-500/15 text-amber-400" : "bg-surface-2 text-text-muted"
                  }`}>
                    {m.status === "upcoming" ? "Upcoming" : "Ended"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Connection status card */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-text-primary text-sm">Real-time Status</h2>
            </div>
            <div className="space-y-3">
              <ConnectionStatus />
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-text-secondary">
                  {onlineCount} {onlineCount === 1 ? "user" : "users"} online right now
                </span>
              </div>
            </div>
          </Card>

          {/* Today's schedule */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary text-sm">Today's Schedule</h2>
              <span className="text-[10px] text-text-muted bg-surface-2 px-2 py-0.5 rounded-full">3 events</span>
            </div>
            <div className="space-y-2">
              {upcomingSlots.map((slot, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer">
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

          {/* Weekly activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary text-sm">Weekly Activity</h2>
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <div className="flex items-end gap-1.5 h-20">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => {
                const days = ["M", "T", "W", "T", "F", "S", "S"];
                const isToday = i === 4;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-md ${isToday ? "bg-violet-500" : "bg-surface-3 hover:bg-violet-500/40"}`}
                      style={{ height: `${h}%` }}
                    />
                    <span className={`text-[9px] ${isToday ? "text-violet-400 font-bold" : "text-text-muted"}`}>
                      {days[i]}
                    </span>
                  </div>
                );
              })}
            </div>
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
            <Button
              onClick={() => {
                if (joinCode.trim()) {
                  setJoinModal(false);
                  window.location.href = `/room/${joinCode.trim()}`;
                }
              }}
            >
              Join Now
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">Enter a meeting room code to join.</p>
          <input
            type="text"
            placeholder="e.g. abc1-xyz2"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinCode.trim() && (window.location.href = `/room/${joinCode.trim()}`)}
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-violet-500/60 transition-colors"
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
}