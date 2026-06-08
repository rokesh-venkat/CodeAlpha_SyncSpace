import { useState, useEffect } from "react";
import { Bell, X, Users, MessageSquare, Video } from "lucide-react";
import { useSocket } from "../../hooks/useSocket.js";
import { SOCKET_EVENTS } from "../../utils/socketEvents.js";

const ICONS = { user_joined: Users, user_left: Users, new_message: MessageSquare, meeting_started: Video };
const COLORS = { user_joined: "text-emerald-400 bg-emerald-500/10", user_left: "text-red-400 bg-red-500/10", new_message: "text-violet-400 bg-violet-500/10", meeting_started: "text-sky-400 bg-sky-500/10" };

export function NotificationBell() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!socket) return;
    const onNew = (notif) => {
      const id = Date.now();
      setNotifications((prev) => [{ ...notif, id, read: false, time: new Date().toISOString() }, ...prev].slice(0, 20));
      // Auto-dismiss after 4s
      setTimeout(() => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n)), 4000);
    };
    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, onNew);
    return () => socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, onNew);
  }, [socket]);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clear = () => setNotifications([]);

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((p) => !p); markAllRead(); }}
        className="relative w-8 h-8 rounded-xl flex items-center justify-center hover:bg-surface-2 text-text-muted hover:text-text-primary transition-all"
      >
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-violet-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-surface-1 border border-border rounded-2xl shadow-xl shadow-black/20 z-50">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
            <span className="text-sm font-semibold text-text-primary">Notifications</span>
            <div className="flex gap-2">
              <button onClick={clear} className="text-[11px] text-text-muted hover:text-text-primary">Clear</button>
              <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary"><X size={14} /></button>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-muted">No notifications</div>
            ) : (
              notifications.map((n) => {
                const Icon = ICONS[n.type] || Bell;
                const color = COLORS[n.type] || "text-text-muted bg-surface-2";
                return (
                  <div key={n.id} className={`flex items-start gap-3 px-3 py-2.5 hover:bg-surface-2 transition-colors ${!n.read ? "bg-violet-500/5" : ""}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <Icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary">{n.message}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{new Date(n.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}