import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Copy, Users, Clock, Wifi } from "lucide-react";
import { ConnectionStatus } from "./ConnectionStatus.jsx";

export function MeetingHeader({ roomId, participantCount = 0, recording = false, startTime }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDuration = () => {
    if (!startTime) return "";
    const secs = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <header className="h-12 flex items-center justify-between px-4 shrink-0 border-b border-white/5 bg-[#0d0f14]/90 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-white/50 hover:text-white transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">SyncSpace</span>
          <button
            onClick={copyLink}
            className="hidden sm:inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/60 font-mono transition-colors"
          >
            {roomId}
            <Copy size={10} />
          </button>
          {copied && <span className="text-[10px] text-emerald-400">Copied!</span>}
        </div>
        {recording && (
          <span className="flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            REC
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-white/40">
        {startTime && (
          <div className="hidden sm:flex items-center gap-1 text-xs">
            <Clock size={11} />
            <span className="tabular-nums">{formatDuration()}</span>
          </div>
        )}
        <ConnectionStatus compact />
        <div className="flex items-center gap-1 text-xs">
          <Users size={11} />
          <span>{participantCount}</span>
        </div>
      </div>
    </header>
  );
}

export default MeetingHeader;
