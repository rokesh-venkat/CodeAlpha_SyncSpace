import { Server } from "socket.io";
import socketAuth from "../middleware/socketAuth.js";
import { presenceSocket } from "./presenceSocket.js";
import { roomSocket } from "./roomSocket.js";
import { chatSocket } from "./chatSocket.js";
import { signalingSocket } from "./signalingSocket.js";
import { SOCKET_EVENTS } from "./events.js";

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  const activeUsers = new Map();
  const rooms = new Map();

  io.use(socketAuth);

  io.on(SOCKET_EVENTS.CONNECT, (socket) => {
    console.log(`[Socket] Connected: ${socket.user.name} (${socket.id})`);

    presenceSocket(socket, activeUsers, io);
    roomSocket(socket, rooms, io);
    chatSocket(socket, io);
    signalingSocket(socket, io);

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log(`[Socket] Disconnected: ${socket.user.name} — ${reason}`);
    });

    socket.on("error", (err) => {
      console.error(`[Socket] Error (${socket.user.name}):`, err.message);
    });
  });

  console.log("[Socket] Socket.IO initialized");
  return io;
};

export default initSocket;
