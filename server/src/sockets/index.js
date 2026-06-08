import { Server } from "socket.io";
import socketAuth from "../middleware/socketAuth.js";
import { presenceSocket } from "./presenceSocket.js";
import { roomSocket } from "./roomSocket.js";
import { chatSocket } from "./chatSocket.js";
import { signalingSocket } from "./signalingSocket.js";
import { SOCKET_EVENTS } from "./events.js";

/**
 * initSocket — attaches Socket.IO to the HTTP server.
 * All handlers share activeUsers and rooms Maps.
 */
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Shared in-memory state
  const activeUsers = new Map(); // userId → presence object
  const rooms = new Map();       // roomId → Map<userId, participant>

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