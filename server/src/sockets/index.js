import { Server } from "socket.io";
import socketAuth from "../middleware/socketAuth.js";
import presenceSocket from "./presenceSocket.js";
import roomSocket from "./roomSocket.js";
import chatSocket from "./chatSocket.js";
import { SOCKET_EVENTS } from "./events.js";

/**
 * initSocket — attaches Socket.IO to the existing HTTP server.
 *
 * Shared state (in-memory):
 * - activeUsers: Map<userId, userObject>   — who is currently online
 * - rooms:       Map<roomId, Map<userId, participantObject>>  — room participants
 *
 * These Maps are passed into each handler so all handlers share the same state.
 *
 * @param {import("http").Server} httpServer
 * @returns {import("socket.io").Server} io
 */
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Ping timeout/interval — keeps connections alive and detects dead sockets
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Shared in-memory state ─────────────────────────────────────────
  const activeUsers = new Map(); // userId → user presence object
  const rooms = new Map();       // roomId → Map<userId, participant>

  // ── Auth middleware — runs before every connection ─────────────────
  io.use(socketAuth);

  // ── Connection handler ─────────────────────────────────────────────
  io.on(SOCKET_EVENTS.CONNECT, (socket) => {
    console.log(`[Socket] Connected: ${socket.user.name} (${socket.id})`);

    // Wire all feature handlers, passing shared state
    presenceSocket(socket, activeUsers, io);
    roomSocket(socket, rooms, io);
    chatSocket(socket, io);

    // ── Global disconnect log ────────────────────────────────────────
    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log(
        `[Socket] Disconnected: ${socket.user.name} — reason: ${reason}`
      );
    });

    // ── Global error handler ─────────────────────────────────────────
    socket.on("error", (error) => {
      console.error(`[Socket] Error for ${socket.user.name}:`, error.message);
    });
  });

  console.log("[Socket] Socket.IO initialized");
  return io;
};

export default initSocket;