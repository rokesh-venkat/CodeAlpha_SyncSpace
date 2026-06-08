import { useState } from "react";

const REACTIONS = ["👍", "❤️", "😂", "🔥", "👏"];

export function ChatMessage({ message, isSelf, onReact, currentUserId }) {
  const [showReactions, setShowReactions] = useState(false);

  const initials = message.sender?.name
    ? message.sender.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  const colors = ["from-violet-500 to-fuchsia-600","from-sky-500 to-blue-600","from-emerald-500 to-teal-600","from-amber-500 to-orange-600"];
  const colorIndex = (message.sender?.name?.charCodeAt(0) || 0) % colors.length;

  const time = message.timestamp || message.createdAt
    ? new Date(message.timestamp || message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const myReactions = message.reactions?.filter((r) => r.users?.includes(currentUserId)).map((r) => r.emoji) || [];

  return (
    <div
      className={`flex gap-2 group ${isSelf ? "flex-row-reverse" : ""}`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {!isSelf && (
        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5`}>
          {initials}
        </div>
      )}

      <div className={`max-w-[78%] flex flex-col gap-0.5 ${isSelf ? "items-end" : "items-start"}`}>
        {!isSelf && <span className="text-[10px] text-white/40 px-1">{message.sender?.name}</span>}
        <div className={`px-2.5 py-1.5 rounded-xl text-xs text-white leading-relaxed relative ${isSelf ? "bg-violet-600/80" : "bg-white/10"}`}>
          {message.message}

          {/* Reaction picker */}
          {showReactions && (
            <div className={`absolute ${isSelf ? "right-0" : "left-0"} -top-8 flex gap-1 bg-[#1a1d27] border border-white/10 rounded-xl px-2 py-1 shadow-lg z-10`}>
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id || message._id, emoji)}
                  className={`text-sm hover:scale-125 transition-transform ${myReactions.includes(emoji) ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reactions display */}
        {message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {message.reactions.map((r) => r.users?.length > 0 && (
              <button
                key={r.emoji}
                onClick={() => onReact(message.id || message._id, r.emoji)}
                className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border transition-all ${
                  myReactions.includes(r.emoji)
                    ? "bg-violet-500/20 border-violet-500/40 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                }`}
              >
                <span>{r.emoji}</span>
                <span>{r.users.length}</span>
              </button>
            ))}
          </div>
        )}

        <span className="text-[9px] text-white/25 px-1">{time}</span>
      </div>
    </div>
  );
}