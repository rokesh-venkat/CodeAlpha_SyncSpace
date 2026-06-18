import { SOCKET_EVENTS } from "./events.js";

export function signalingSocket(socket, io) {
  const user = socket.user;

  socket.on(SOCKET_EVENTS.WEBRTC_OFFER, ({ offer, targetSocketId }) => {
    io.to(targetSocketId).emit(SOCKET_EVENTS.WEBRTC_OFFER, {
      offer,
      fromSocketId: socket.id,
      fromUserId: user._id,
      fromName: user.name,
    });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, ({ answer, targetSocketId }) => {
    io.to(targetSocketId).emit(SOCKET_EVENTS.WEBRTC_ANSWER, {
      answer,
      fromSocketId: socket.id,
    });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, ({ candidate, targetSocketId }) => {
    io.to(targetSocketId).emit(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, {
      candidate,
      fromSocketId: socket.id,
    });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_MUTE, ({ roomId }) => {
    socket.to(roomId || socket.currentRoom).emit(SOCKET_EVENTS.WEBRTC_MUTE, { userId: user._id });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_UNMUTE, ({ roomId }) => {
    socket.to(roomId || socket.currentRoom).emit(SOCKET_EVENTS.WEBRTC_UNMUTE, { userId: user._id });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_CAM_ON, ({ roomId }) => {
    socket.to(roomId || socket.currentRoom).emit(SOCKET_EVENTS.WEBRTC_CAM_ON, { userId: user._id });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_CAM_OFF, ({ roomId }) => {
    socket.to(roomId || socket.currentRoom).emit(SOCKET_EVENTS.WEBRTC_CAM_OFF, { userId: user._id });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_START, ({ roomId }) => {
    socket.to(roomId || socket.currentRoom).emit(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_START, {
      userId: user._id, name: user.name, socketId: socket.id,
    });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_STOP, ({ roomId }) => {
    socket.to(roomId || socket.currentRoom).emit(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_STOP, {
      userId: user._id, socketId: socket.id,
    });
  });

  socket.on("disconnect", () => {
    const roomId = socket.currentRoom;
    if (roomId) {
      socket.to(roomId).emit(SOCKET_EVENTS.WEBRTC_USER_LEFT, {
        socketId: socket.id, userId: user._id,
      });
    }
  });
}
