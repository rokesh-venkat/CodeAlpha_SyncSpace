import { Mic, MicOff, Video, VideoOff, Crown, MoreHorizontal } from "lucide-react";

/**
 * ParticipantList — displays all participants currently in a room.
 * Receives the participants array from the room socket events.
 */
export function ParticipantList({ participants = [], currentUserId }) {
  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <p className="text-xs text-text-muted">No participants yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-1 pb-1">
        Participants · {participants.length}
      </p>
      {participants.map((participant) => {
        const isSelf = participant._id === currentUserId;

        // Generate initials from name
        const initials = participant.name
          ? participant.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
          : "?";

        // Color from name hash for consistent avatar color
        const colors = [
          "from-violet-500 to-fuchsia-600",
          "from-sky-500 to-blue-600",
          "from-emerald-500 to-teal-600",
          "from-amber-500 to-orange-600",
          "from-pink-500 to-rose-600",
        ];
        const colorIndex =
          participant.name?.charCodeAt(0) % colors.length || 0;

        return (
          <div
            key={participant._id}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-surface-2 transition-colors group"
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white text-xs font-bold shrink-0`}
            >
              {initials}
            </div>

            {/* Name + host badge */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">
                {isSelf ? `${participant.name} (You)` : participant.name}
              </p>
              {participant.isHost && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Crown size={9} className="text-amber-400" />
                  <span className="text-[10px] text-amber-400">Host</span>
                </div>
              )}
            </div>

            {/* Controls placeholder — wired in Phase 5 */}
            <div className="flex items-center gap-1 opacity-60">
              <Mic size={12} className="text-text-muted" />
              <Video size={12} className="text-text-muted" />
            </div>
          </div>
        );
      })}
    </div>
  );
}