import { SOCKET_EVENTS } from "./events.js";
import Room from "../models/Room.js";

/**
 * roomSocket — manages meeting room lifecycle.
 * Persists room state to MongoDB so participants survive server restarts.
 */
export function roomSocket(socket, rooms, io) {
  const user = socket.user;

  const getParticipants = (roomId) =>
    rooms.has(roomId) ? Array.from(rooms.get(roomId).values()) : [];

  // ── Create Room ──────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.ROOM_CREATE, async ({ roomId, title }) => {
    try {
      if (!roomId) return socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: "Room ID required" });
      if (!rooms.has(roomId)) rooms.set(roomId, new Map());

      const participant = { _id: user._id, name: user.name, avatar: user.avatar, isHost: true, joinedAt: new Date().toISOString() };
      rooms.get(roomId).set(user._id, participant);
      socket.join(roomId);
      socket.currentRoom = roomId;

      // Persist to MongoDB
      await Room.findOneAndUpdate(
        { roomId },
        { roomId, title: title || "SyncSpace Meeting", createdBy: user._id, isActive: true,
          $addToSet: { participants: { userId: user._id, name: user.name, avatar: user.avatar, isHost: true } } },
        { upsert: true, new: true }
      );

      socket.emit(SOCKET_EVENTS.ROOM_CREATED, { roomId, title, participants: getParticipants(roomId) });
      console.log(`[Room] ${user.name} created ${roomId}`);
    } catch (err) {
      console.error("[Room] create error:", err.message);
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: "Failed to create room" });
    }
  });

  // ── Join Room ────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.ROOM_JOIN, async ({ roomId }) => {
    try {
      if (!roomId) return socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: "Room ID required" });
      if (!rooms.has(roomId)) rooms.set(roomId, new Map());

      const isHost = rooms.get(roomId).size === 0;
      const participant = { _id: user._id, name: user.name, avatar: user.avatar, isHost, joinedAt: new Date().toISOString() };
      rooms.get(roomId).set(user._id, participant);
      socket.join(roomId);
      socket.currentRoom = roomId;

      await Room.findOneAndUpdate(
        { roomId },
        { roomId, isActive: true, $addToSet: { participants: { userId: user._id, name: user.name, avatar: user.avatar, isHost } } },
        { upsert: true, new: true }
      );

      socket.emit(SOCKET_EVENTS.ROOM_JOINED, { roomId, participants: getParticipants(roomId) });
      socket.to(roomId).emit(SOCKET_EVENTS.ROOM_USER_JOINED, { user: participant, participants: getParticipants(roomId) });

      // Notify via notification event
      socket.to(roomId).emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
        type: "user_joined", message: `${user.name} joined the room`, userId: user._id,
      });

      console.log(`[Room] ${user.name} joined ${roomId} | Count: ${rooms.get(roomId).size}`);
    } catch (err) {
      console.error("[Room] join error:", err.message);
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: "Failed to join room" });
    }
  });

  // ── Leave Room ───────────────────────────────────────────────────────
  const leaveRoom = async (roomId) => {
    if (!roomId || !rooms.has(roomId)) return;
    rooms.get(roomId).delete(user._id);
    socket.leave(roomId);
    const remaining = getParticipants(roomId);

    io.to(roomId).emit(SOCKET_EVENTS.ROOM_USER_LEFT, { userId: user._id, name: user.name, participants: remaining });
    io.to(roomId).emit(SOCKET_EVENTS.NOTIFICATION_NEW, { type: "user_left", message: `${user.name} left the room`, userId: user._id });
    socket.emit(SOCKET_EVENTS.ROOM_LEFT, { roomId });

    if (rooms.get(roomId).size === 0) {
      rooms.delete(roomId);
      await Room.findOneAndUpdate({ roomId }, { isActive: false, endedAt: new Date(), participants: [] });
      console.log(`[Room] ${roomId} closed (empty)`);
    } else {
      await Room.findOneAndUpdate({ roomId }, { $pull: { participants: { userId: user._id } } });
    }
    socket.currentRoom = null;
    console.log(`[Room] ${user.name} left ${roomId} | Remaining: ${remaining.length}`);
  };

  socket.on(SOCKET_EVENTS.ROOM_LEAVE, ({ roomId }) => leaveRoom(roomId));
  socket.on(SOCKET_EVENTS.ROOM_PARTICIPANTS, ({ roomId }) => {
    socket.emit(SOCKET_EVENTS.ROOM_PARTICIPANTS, { roomId, participants: getParticipants(roomId) });
  });
  socket.on(SOCKET_EVENTS.DISCONNECT, () => { if (socket.currentRoom) leaveRoom(socket.currentRoom); });
}