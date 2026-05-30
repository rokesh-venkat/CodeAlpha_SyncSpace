import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff,
  MessageSquare, Users, MoreHorizontal, Pin, Maximize2,
  Settings, Smile, Send, Grid3x3, ChevronLeft, Hand,
  ScreenShare as StopShare, Wifi, Circle, X
} from "lucide-react";
import { Button } from "../components/common/Button";

const mockParticipants = [
  { id: 1, name: "Rokesh Venkat", initials: "RV", color: "from-violet-500 to-fuchsia-600", mic: true, cam: true, isHost: true, isSelf: true, signal: 3 },
  { id: 2, name: "Alex Chen", initials: "AC", color: "from-sky-500 to-blue-600", mic: true, cam: false, signal: 2 },
  { id: 3, name: "Priya Sharma", initials: "PS", color: "from-emerald-500 to-teal-600", mic: false, cam: true, signal: 3 },
  { id: 4, name: "Marcus Lee", initials: "ML", color: "from-amber-500 to-orange-600", mic: true, cam: true, signal: 1 },
  { id: 5, name: "Sofia Torres", initials: "ST", color: "from-pink-500 to-rose-600", mic: false, cam: false, signal: 3 },
];

const mockMessages = [
  { id: 1, sender: "Alex Chen", initials: "AC", color: "from-sky-500 to-blue-600", text: "Can you share your screen for the demo?", time: "10:34 AM" },
  { id: 2, sender: "Priya Sharma", initials: "PS", color: "from-emerald-500 to-teal-600", text: "Looking good so far 👍", time: "10:35 AM" },
  { id: 3, sender: "You", initials: "RV", color: "from-violet-500 to-fuchsia-600", text: "Sure, one sec!", time: "10:35 AM", isSelf: true },
  { id: 4, sender: "Marcus Lee", initials: "ML", color: "from-amber-500 to-orange-600", text: "Can we look at the auth flow?", time: "10:36 AM" },
];

function SignalBars({ strength }) {
  return (
    <div className="flex items-end gap-[2px]">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{ height: `${5 + i * 3}px` }}
          className={`w-[3px] rounded-sm ${i <= strength ? "bg-emerald-400" : "bg-surface-3"}`}
        />
      ))}
    </div>
  );
}

function VideoTile({ participant, large = false }) {
  return (
    <div className={`
      relative rounded-xl overflow-hidden bg-surface-2 border border-border/50 group
      ${large ? "aspect-video" : "aspect-video"}
    `}>
      {/* Camera off state */}
      {!participant.cam ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-${large ? "16" : "12"} h-${large ? "16" : "12"} rounded-xl bg-gradient-to-br ${participant.color} flex items-center justify-center`}>
            <span className={`text-white font-bold ${large ? "text-2xl" : "text-base"}`}>
              {participant.initials}
            </span>
          </div>
        </div>
      ) : (
        /* Camera on: placeholder gradient */
        <div className={`absolute inset-0 bg-gradient-to-br ${participant.color} opacity-20`} />
      )}

      {/* Name tag */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        <span className="text-[11px] font-medium text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
          {participant.isSelf ? "You" : participant.name}
        </span>
        {participant.isHost && (
          <span className="text-[10px] text-violet-300 bg-violet-900/60 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
            Host
          </span>
        )}
      </div>

      {/* Mic indicator */}
      <div className="absolute bottom-2 right-2">
        {!participant.mic ? (
          <div className="w-5 h-5 rounded-md bg-red-500/80 flex items-center justify-center">
            <MicOff size={10} className="text-white" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-md bg-black/40 flex items-center justify-center">
            <Mic size={10} className="text-white" />
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 flex items-start justify-end p-2 gap-1">
        <button className="w-6 h-6 rounded-md bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
          <Pin size={10} />
        </button>
        <button className="w-6 h-6 rounded-md bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
          <Maximize2 size={10} />
        </button>
      </div>

      {/* Speaking indicator */}
      {participant.mic && participant.id === 1 && (
        <div className="absolute inset-0 ring-2 ring-violet-500/60 rounded-xl pointer-events-none" />
      )}
    </div>
  );
}

export default function MeetingRoom() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [panel, setPanel] = useState("chat"); // "chat" | "participants" | null
  const [chatMsg, setChatMsg] = useState("");
  const [layout, setLayout] = useState("grid"); // "grid" | "spotlight"
  const [handRaised, setHandRaised] = useState(false);
  const [recording, setRecording] = useState(false);

  const togglePanel = (p) => setPanel((cur) => (cur === p ? null : p));

  return (
    <div className="fixed inset-0 bg-[#0d0f14] flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="h-12 flex items-center justify-between px-4 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <span className="text-sm font-semibold text-white">Design Review — Sprint 14</span>
            <span className="text-xs text-white/40 ml-2 font-mono">abc-123</span>
          </div>
          {recording && (
            <div className="flex items-center gap-1.5 bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-medium">
              <Circle size={6} className="fill-red-400 animate-pulse" />
              REC
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Wifi size={12} />
            <span>HD</span>
          </div>
          <span className="text-white/30 text-[10px] font-mono">42:17</span>
          <button
            onClick={() => setLayout(l => l === "grid" ? "spotlight" : "grid")}
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all"
          >
            <Grid3x3 size={14} />
          </button>
          <button className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all">
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex min-h-0">

        {/* Video grid */}
        <div className="flex-1 p-3 overflow-hidden">
          {layout === "grid" ? (
            <div className={`
              h-full grid gap-2
              ${mockParticipants.length <= 1 ? "grid-cols-1" :
                mockParticipants.length <= 2 ? "grid-cols-2" :
                mockParticipants.length <= 4 ? "grid-cols-2" :
                "grid-cols-3"}
            `}>
              {mockParticipants.map((p) => (
                <VideoTile key={p.id} participant={p} />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col gap-2">
              {/* Spotlight: main speaker large */}
              <div className="flex-1">
                <VideoTile participant={mockParticipants[0]} large />
              </div>
              {/* Strip at bottom */}
              <div className="flex gap-2 h-24">
                {mockParticipants.slice(1).map((p) => (
                  <div key={p.id} className="w-36 shrink-0">
                    <VideoTile participant={p} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        {panel && (
          <div className="w-72 shrink-0 border-l border-white/5 bg-[#13151c] flex flex-col">
            {/* Panel tabs */}
            <div className="flex border-b border-white/5 shrink-0">
              {["chat", "participants"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPanel(p)}
                  className={`
                    flex-1 py-2.5 text-xs font-medium capitalize transition-colors
                    ${panel === p
                      ? "text-white border-b-2 border-violet-500"
                      : "text-white/40 hover:text-white/70"}
                  `}
                >
                  {p === "chat" ? "Chat" : `People (${mockParticipants.length})`}
                </button>
              ))}
              <button
                onClick={() => setPanel(null)}
                className="px-3 text-white/40 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Chat panel */}
            {panel === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {mockMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.isSelf ? "flex-row-reverse" : ""}`}>
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${msg.color} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
                        {msg.initials}
                      </div>
                      <div className={`max-w-[80%] ${msg.isSelf ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                        <span className="text-[10px] text-white/40">
                          {msg.isSelf ? "You" : msg.sender}
                        </span>
                        <div className={`
                          px-2.5 py-1.5 rounded-xl text-xs text-white
                          ${msg.isSelf ? "bg-violet-600/80" : "bg-white/10"}
                        `}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-white/25">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 border-t border-white/5 flex items-center gap-2 shrink-0">
                  <button className="text-white/40 hover:text-white/70 transition-colors shrink-0">
                    <Smile size={16} />
                  </button>
                  <input
                    type="text"
                    placeholder="Message..."
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-violet-500/50"
                  />
                  <button className="text-white/40 hover:text-violet-400 transition-colors shrink-0">
                    <Send size={14} />
                  </button>
                </div>
              </>
            )}

            {/* Participants panel */}
            {panel === "participants" && (
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <p className="text-[10px] text-white/40 uppercase tracking-wider px-1 pb-2">
                  In this meeting · {mockParticipants.length}
                </p>
                {mockParticipants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {p.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {p.isSelf ? "You (Rokesh)" : p.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {p.isHost && (
                          <span className="text-[9px] text-violet-400">Host</span>
                        )}
                        <SignalBars strength={p.signal} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-70">
                      {!p.mic && <MicOff size={11} className="text-red-400" />}
                      {!p.cam && <VideoOff size={11} className="text-white/40" />}
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white">
                      <MoreHorizontal size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom control bar */}
      <div className="h-16 flex items-center justify-between px-6 shrink-0 border-t border-white/5 bg-[#0d0f14]">

        {/* Left controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRecording(r => !r)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
              ${recording
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "hover:bg-white/10 text-white/50 hover:text-white"}
            `}
          >
            <Circle size={10} className={recording ? "fill-red-400 animate-pulse" : ""} />
            {recording ? "Recording" : "Record"}
          </button>
        </div>

        {/* Center controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMicOn(m => !m)}
            className={`
              w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90
              ${micOn ? "bg-white/10 hover:bg-white/15 text-white" : "bg-red-500 hover:bg-red-600 text-white"}
            `}
            title={micOn ? "Mute" : "Unmute"}
          >
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </button>

          <button
            onClick={() => setCamOn(c => !c)}
            className={`
              w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90
              ${camOn ? "bg-white/10 hover:bg-white/15 text-white" : "bg-red-500 hover:bg-red-600 text-white"}
            `}
            title={camOn ? "Stop camera" : "Start camera"}
          >
            {camOn ? <Video size={18} /> : <VideoOff size={18} />}
          </button>

          <button
            onClick={() => setSharing(s => !s)}
            className={`
              w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90
              ${sharing ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-white/10 hover:bg-white/15 text-white/70 hover:text-white"}
            `}
            title={sharing ? "Stop sharing" : "Share screen"}
          >
            <ScreenShare size={18} />
          </button>

          <button
            onClick={() => setHandRaised(h => !h)}
            className={`
              w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90
              ${handRaised ? "bg-amber-500/80 text-white" : "bg-white/10 hover:bg-white/15 text-white/70 hover:text-white"}
            `}
            title={handRaised ? "Lower hand" : "Raise hand"}
          >
            <Hand size={18} />
          </button>

          <Link to="/">
            <button className="w-11 h-11 rounded-2xl bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all active:scale-90 ml-1">
              <PhoneOff size={18} />
            </button>
          </Link>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => togglePanel("chat")}
            className={`
              relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
              ${panel === "chat" ? "bg-white/15 text-white" : "hover:bg-white/10 text-white/50 hover:text-white"}
            `}
          >
            <MessageSquare size={14} />
            <span className="hidden sm:block">Chat</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 text-white text-[9px] rounded-full flex items-center justify-center">4</span>
          </button>

          <button
            onClick={() => togglePanel("participants")}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
              ${panel === "participants" ? "bg-white/15 text-white" : "hover:bg-white/10 text-white/50 hover:text-white"}
            `}
          >
            <Users size={14} />
            <span className="hidden sm:block">{mockParticipants.length}</span>
          </button>

          <button className="w-8 h-8 rounded-xl hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}