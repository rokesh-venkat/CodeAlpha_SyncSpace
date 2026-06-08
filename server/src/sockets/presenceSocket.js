import { SOCKET_EVENTS } from "./events.js";

/**
 * presenceSocket — named export fixes the Phase 4 import/export mismatch.
 */
export function presenceSocket(socket, activeUsers, io) {
  const user = socket.user;

  const setOnline = () => {
    activeUsers.set(user._id, {
      _id: user._id, name: user.name, avatar: user.avatar,
      socketId: socket.id, status: "online", onlineSince: new Date().toISOString(),
    });
    io.emit(SOCKET_EVENTS.PRESENCE_ONLINE, { userId: user._id, name: user.name, avatar: user.avatar, status: "online" });
    io.emit(SOCKET_EVENTS.USERS_ACTIVE_COUNT, { count: activeUsers.size });
    socket.emit(SOCKET_EVENTS.USERS_ACTIVE, { users: Array.from(activeUsers.values()), count: activeUsers.size });
    console.log(`[Presence] ${user.name} online | Total: ${activeUsers.size}`);
  };

  socket.on(SOCKET_EVENTS.PRESENCE_AWAY, () => {
    const entry = activeUsers.get(user._id);
    if (entry) { entry.status = "away"; activeUsers.set(user._id, entry); io.emit(SOCKET_EVENTS.PRESENCE_UPDATE, { userId: user._id, status: "away" }); }
  });

  socket.on(SOCKET_EVENTS.PRESENCE_UPDATE, ({ status }) => {
    const entry = activeUsers.get(user._id);
    if (entry) { entry.status = status || "online"; activeUsers.set(user._id, entry); io.emit(SOCKET_EVENTS.PRESENCE_UPDATE, { userId: user._id, status: entry.status }); }
  });

  const setOffline = () => {
    activeUsers.delete(user._id);
    io.emit(SOCKET_EVENTS.PRESENCE_OFFLINE, { userId: user._id, lastSeen: new Date().toISOString() });
    io.emit(SOCKET_EVENTS.USERS_ACTIVE_COUNT, { count: activeUsers.size });
    console.log(`[Presence] ${user.name} offline | Total: ${activeUsers.size}`);
  };

  setOnline();
  socket.on(SOCKET_EVENTS.DISCONNECT, setOffline);
}