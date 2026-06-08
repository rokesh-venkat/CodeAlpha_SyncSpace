import { useSocket } from "../../hooks/useSocket.js";

/**
 * ConnectionStatus — shows the live socket connection state.
 * Used in Dashboard header and MeetingRoom top bar.
 *
 * compact=true → small dot + text only
 * compact=false → full badge with user count
 */
export function ConnectionStatus({ compact = false }) {
  const { connected, onlineCount } = useSocket();

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
          }`}
        />
        <span className="text-xs text-text-muted">
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium
        ${connected
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-red-500/10 border-red-500/20 text-red-400"}
      `}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
        }`}
      />
      <span>{connected ? "Connected" : "Disconnected"}</span>
      {connected && onlineCount > 0 && (
        <>
          <span className="text-emerald-600">·</span>
          <span>{onlineCount} online</span>
        </>
      )}
    </div>
  );
}