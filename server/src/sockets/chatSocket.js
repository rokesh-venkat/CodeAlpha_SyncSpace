import { SOCKET_EVENTS } from "./events.js";

/**
 * chatSocket — handles real-time chat within rooms.
 *
 * Messages are broadcast to everyone in the Socket.IO room.
 * In Phase 6, messages can be persisted to MongoDB via the Message model.
 *
 * @param {import("socket.io").Socket} socket
 * @param {import("socket.io").Server} io
 */
const chatSocket = (socket, io) => {
  const user = socket.user;

  // ── Send message ───────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.CHAT_SEND, ({ roomId, message }) => {
    try {
      if (!roomId || !message?.trim()) {
        return socket.emit(SOCKET_EVENTS.CHAT_ERROR, {
          message: "Room ID and message are required",
        });
      }

      const payload = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        roomId,
        message: message.trim(),
        sender: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
        },
        timestamp: new Date().toISOString(),
      };

      // Broadcast to everyone in the room INCLUDING the sender
      io.to(roomId).emit(SOCKET_EVENTS.CHAT_RECEIVE, payload);

      console.log(`[Chat] ${user.name} → room ${roomId}: "${message.trim().slice(0, 40)}"`);
    } catch (error) {
      console.error("[Chat] send error:", error.message);
      socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "Failed to send message" });
    }
  });

  // ── Typing indicator ───────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.CHAT_TYPING, ({ roomId }) => {
    if (!roomId) return;

    // Broadcast to everyone EXCEPT the sender
    socket.to(roomId).emit(SOCKET_EVENTS.CHAT_TYPING, {
      userId: user._id,
      name: user.name,
      roomId,
    });
  });

  // ── Stop typing ────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.CHAT_STOP_TYPING, ({ roomId }) => {
    if (!roomId) return;

    socket.to(roomId).emit(SOCKET_EVENTS.CHAT_STOP_TYPING, {
      userId: user._id,
      name: user.name,
      roomId,
    });
  });
};

export default chatSocket;