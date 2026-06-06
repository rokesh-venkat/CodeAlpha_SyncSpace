import { SOCKET_EVENTS } from "./events.js";

/**
 * roomSocket — manages meeting room lifecycle events.
 *
 * Uses Socket.IO rooms (built-in) to group participants.
 * Each room ID maps to a Set of participant objects in the rooms Map.
 *
 * @param {import("socket.io").Socket} socket
 * @param {Map} rooms — shared Map: roomId → Set of participant objects
 * @param {import("socket.io").Server} io
 */
const roomSocket = (socket, rooms, io) => {
  const user = socket.user;

  // ── Helper: get participants array for a room ──────────────────────
  const getRoomParticipants = (roomId) => {
    return rooms.has(roomId)
      ? Array.from(rooms.get(roomId).values())
      : [];
  };

  // ── Create room ────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.ROOM_CREATE, ({ roomId, roomName }) => {
    try {
      if (!roomId) {
        return socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
          message: "Room ID is required",
        });
      }

      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }

      // Add creator as first participant
      rooms.get(roomId).set(user._id, {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        isHost: true,
        joinedAt: new Date().toISOString(),
      });

      // Join the Socket.IO room
      socket.join(roomId);
      socket.currentRoom = roomId;

      socket.emit(SOCKET_EVENTS.ROOM_CREATED, {
        roomId,
        roomName: roomName || roomId,
        participants: getRoomParticipants(roomId),
      });

      console.log(`[Room] ${user.name} created room: ${roomId}`);
    } catch (error) {
      console.error("[Room] create error:", error.message);
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: "Failed to create room" });
    }
  });

  // ── Join room ──────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.ROOM_JOIN, ({ roomId }) => {
    try {
      if (!roomId) {
        return socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
          message: "Room ID is required",
        });
      }

      // Initialize room if joining before creator (edge case)
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }

      const participant = {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        isHost: rooms.get(roomId).size === 0, // first person is host
        joinedAt: new Date().toISOString(),
      };

      rooms.get(roomId).set(user._id, participant);

      // Join the Socket.IO room
      socket.join(roomId);
      socket.currentRoom = roomId;

      // Confirm join to this socket
      socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
        roomId,
        participants: getRoomParticipants(roomId),
      });

      // Notify everyone else in the room
      socket.to(roomId).emit(SOCKET_EVENTS.ROOM_USER_JOINED, {
        user: participant,
        participants: getRoomParticipants(roomId),
      });

      console.log(
        `[Room] ${user.name} joined ${roomId} | Participants: ${rooms.get(roomId).size}`
      );
    } catch (error) {
      console.error("[Room] join error:", error.message);
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: "Failed to join room" });
    }
  });

  // ── Leave room ─────────────────────────────────────────────────────
  const leaveRoom = (roomId) => {
    if (!roomId || !rooms.has(roomId)) return;

    rooms.get(roomId).delete(user._id);
    socket.leave(roomId);

    const remaining = getRoomParticipants(roomId);

    // Notify remaining participants
    io.to(roomId).emit(SOCKET_EVENTS.ROOM_USER_LEFT, {
      userId: user._id,
      name: user.name,
      participants: remaining,
    });

    socket.emit(SOCKET_EVENTS.ROOM_LEFT, { roomId });

    // Clean up empty room
    if (rooms.get(roomId).size === 0) {
      rooms.delete(roomId);
      console.log(`[Room] Room ${roomId} deleted (empty)`);
    }

    socket.currentRoom = null;
    console.log(`[Room] ${user.name} left ${roomId} | Remaining: ${remaining.length}`);
  };

  socket.on(SOCKET_EVENTS.ROOM_LEAVE, ({ roomId }) => leaveRoom(roomId));

  // ── Get participants ───────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.ROOM_PARTICIPANTS, ({ roomId }) => {
    socket.emit(SOCKET_EVENTS.ROOM_PARTICIPANTS, {
      roomId,
      participants: getRoomParticipants(roomId),
    });
  });

  // ── Auto-leave on disconnect ───────────────────────────────────────
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    if (socket.currentRoom) {
      leaveRoom(socket.currentRoom);
    }
  });
};

export default roomSocket;