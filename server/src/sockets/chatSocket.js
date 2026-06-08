import { SOCKET_EVENTS } from "./events.js";
import Message from "../models/Message.js";

/**
 * chatSocket — real-time chat with MongoDB persistence and reaction support.
 */
export function chatSocket(socket, io) {
  const user = socket.user;

  // ── Send Message ─────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.CHAT_SEND, async ({ roomId, message }) => {
    try {
      if (!roomId || !message?.trim()) return socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "Room and message required" });

      // Persist to MongoDB
      const saved = await Message.create({
        roomId,
        sender: { _id: user._id, name: user.name, avatar: user.avatar },
        message: message.trim(),
        reactions: [],
      });

      const payload = {
        id: saved._id.toString(),
        roomId,
        message: saved.message,
        sender: saved.sender,
        reactions: [],
        timestamp: saved.createdAt.toISOString(),
      };

      // Broadcast to ALL in room including sender
      io.to(roomId).emit(SOCKET_EVENTS.CHAT_RECEIVE, payload);
      console.log(`[Chat] ${user.name} → ${roomId}: "${message.trim().slice(0, 40)}"`);
    } catch (err) {
      console.error("[Chat] send error:", err.message);
      socket.emit(SOCKET_EVENTS.CHAT_ERROR, { message: "Failed to send message" });
    }
  });

  // ── Typing Indicators ────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.CHAT_TYPING, ({ roomId }) => {
    if (!roomId) return;
    socket.to(roomId).emit(SOCKET_EVENTS.CHAT_TYPING, { userId: user._id, name: user.name, roomId });
  });

  socket.on(SOCKET_EVENTS.CHAT_STOP_TYPING, ({ roomId }) => {
    if (!roomId) return;
    socket.to(roomId).emit(SOCKET_EVENTS.CHAT_STOP_TYPING, { userId: user._id, roomId });
  });

  // ── Message Reactions ────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.MESSAGE_REACT, async ({ messageId, emoji, roomId }) => {
    try {
      const msg = await Message.findById(messageId);
      if (!msg) return;

      const reaction = msg.reactions.find((r) => r.emoji === emoji);
      if (reaction) {
        const idx = reaction.users.indexOf(user._id);
        if (idx > -1) reaction.users.splice(idx, 1); // toggle off
        else reaction.users.push(user._id);           // toggle on
        if (reaction.users.length === 0) msg.reactions = msg.reactions.filter((r) => r.emoji !== emoji);
      } else {
        msg.reactions.push({ emoji, users: [user._id] });
      }

      await msg.save();

      io.to(roomId).emit(SOCKET_EVENTS.MESSAGE_REACTION_UPDATE, {
        messageId, reactions: msg.reactions,
      });
    } catch (err) {
      console.error("[Chat] reaction error:", err.message);
    }
  });
}