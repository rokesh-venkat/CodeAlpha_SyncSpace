import { SOCKET_EVENTS } from "./events.js";

/**
 * signalingSocket — WebRTC signaling via Socket.IO.
 *
 * The server is a RELAY only — it never touches media streams.
 * Flow: Caller → offer → server → callee → answer → server → caller
 * Then ICE candidates are exchanged the same way until P2P is established.
 *
 * Mesh topology: every peer connects directly to every other peer.
 * For N participants: N*(N-1)/2 peer connections total.
 */
export function signalingSocket(socket, io) {
  const user = socket.user;

  // ── Relay WebRTC offer to target peer ───────────────────────────────
  socket.on(SOCKET_EVENTS.WEBRTC_OFFER, ({ offer, targetSocketId, roomId }) => {
    console.log(`[WebRTC] Offer: ${user.name} → ${targetSocketId}`);
    io.to(targetSocketId).emit(SOCKET_EVENTS.WEBRTC_OFFER, {
      offer,
      fromSocketId: socket.id,
      fromUser: { _id: user._id, name: user.name, avatar: user.avatar },
    });
  });

  // ── Relay WebRTC answer to target peer ───────────────────────────────
  socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, ({ answer, targetSocketId }) => {
    console.log(`[WebRTC] Answer: ${user.name} → ${targetSocketId}`);
    io.to(targetSocketId).emit(SOCKET_EVENTS.WEBRTC_ANSWER, {
      answer,
      fromSocketId: socket.id,
    });
  });

  // ── Relay ICE candidate to target peer ──────────────────────────────
  socket.on(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, ({ candidate, targetSocketId }) => {
    io.to(targetSocketId).emit(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, {
      candidate,
      fromSocketId: socket.id,
    });
  });

  // ── Broadcast media state changes to room ───────────────────────────
  socket.on(SOCKET_EVENTS.WEBRTC_TOGGLE_AUDIO, ({ roomId, enabled }) => {
    socket.to(roomId).emit(SOCKET_EVENTS.WEBRTC_TOGGLE_AUDIO, {
      userId: user._id, socketId: socket.id, enabled,
    });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_TOGGLE_VIDEO, ({ roomId, enabled }) => {
    socket.to(roomId).emit(SOCKET_EVENTS.WEBRTC_TOGGLE_VIDEO, {
      userId: user._id, socketId: socket.id, enabled,
    });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE, ({ roomId }) => {
    socket.to(roomId).emit(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE, {
      userId: user._id, socketId: socket.id, name: user.name,
    });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_SCREEN_STOP, ({ roomId }) => {
    socket.to(roomId).emit(SOCKET_EVENTS.WEBRTC_SCREEN_STOP, {
      userId: user._id, socketId: socket.id,
    });
  });
}