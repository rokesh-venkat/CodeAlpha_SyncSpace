import { SOCKET_EVENTS } from "./events.js";

/**
 * presenceSocket — manages the user online/offline presence system.
 *
 * Uses an in-memory Map to track active users.
 * In Phase 6, this can be moved to Redis for multi-server support.
 *
 * @param {import("socket.io").Socket} socket
 * @param {Map} activeUsers — shared Map across all socket handlers
 * @param {import("socket.io").Server} io
 */
const presenceSocket = (socket, activeUsers, io) => {
  const user = socket.user;

  // ── User comes online ────────────────────────────────────────────────
  const handleUserOnline = () => {
    activeUsers.set(user._id, {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      socketId: socket.id,
      onlineSince: new Date().toISOString(),
    });

    // Tell everyone this user is now online
    io.emit(SOCKET_EVENTS.USER_ONLINE, {
      userId: user._id,
      name: user.name,
      avatar: user.avatar,
    });

    // Send the active user count to everyone
    io.emit(SOCKET_EVENTS.USERS_ACTIVE_COUNT, {
      count: activeUsers.size,
    });

    // Send the full active users list to the newly connected socket only
    socket.emit(SOCKET_EVENTS.USERS_ACTIVE, {
      users: Array.from(activeUsers.values()),
      count: activeUsers.size,
    });

    console.log(
      `[Presence] ${user.name} is online | Total: ${activeUsers.size}`
    );
  };

  // ── User goes offline ────────────────────────────────────────────────
  const handleUserOffline = () => {
    const lastSeen = new Date().toISOString();
    activeUsers.delete(user._id);

    // Notify everyone this user went offline
    io.emit(SOCKET_EVENTS.USER_OFFLINE, {
      userId: user._id,
      name: user.name,
      lastSeen,
    });

    // Update active count
    io.emit(SOCKET_EVENTS.USERS_ACTIVE_COUNT, {
      count: activeUsers.size,
    });

    console.log(
      `[Presence] ${user.name} is offline | Total: ${activeUsers.size}`
    );
  };

  // ── Register listeners ───────────────────────────────────────────────
  handleUserOnline(); // Mark online immediately on connection

  socket.on(SOCKET_EVENTS.USER_LAST_SEEN, () => {
    socket.emit(SOCKET_EVENTS.USER_LAST_SEEN, {
      userId: user._id,
      lastSeen: new Date().toISOString(),
    });
  });

  // Run offline logic on disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, handleUserOffline);
};

export default presenceSocket;