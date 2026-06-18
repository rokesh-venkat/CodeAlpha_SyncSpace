import { Link } from "react-router-dom";
import { ChevronLeft, Copy, Users, Wifi } from "lucide-react";
import { useState } from "react";
import { ConnectionStatus } from "./ConnectionStatus.jsx";

export function RoomHeader({ roomId, participantCount = 0, recording = false }) {
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-12 flex items-center justify-between px-4 shrink-0 border-b border-white/5">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-white/60 hover:text-white transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <span className="text-sm font-semibold text-white">SyncSpace Meeting</span>
          <button
            onClick={copyRoomId}
            className="ml-2 text-xs text-white/40 hover:text-white/70 font-mono transition-colors inline-flex items-center gap-1"
          >
            {roomId}
            <Copy size={10} />
            {copied && <span className="text-emerald-400 text-[10px]">Copied!</span>}
          </button>
        </div>
        {recording && (
          <div className="flex items-center gap-1.5 bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            REC
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ConnectionStatus compact />
        <div className="flex items-center gap-1.5 text-white/50 text-xs">
          <Users size={12} />
          <span>{participantCount}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/50 text-xs">
          <Wifi size={12} />
          <span>HD</span>
        </div>
      </div>
    </div>
  );
}
