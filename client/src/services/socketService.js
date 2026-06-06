import { io } from "socket.io-client";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";

/**
 * socketService — manages the singleton socket.io-client connection.
 *
 * Only one socket instance exists for the entire app lifetime.
 * Components never import socket.io-client directly — they use this
 * service through SocketContext.
 */

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

/**
 * connect — creates and returns the socket connection.
 * Passes the JWT as auth so the server can verify it in socketAuth middleware.
 *
 * @param {string} token — JWT from localStorage
 */
export const connect = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: `Bearer ${token}` },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  return socket;
};

/**
 * disconnect — cleanly closes the socket connection.
 */
export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * getSocket — returns the current socket instance.
 */
export const getSocket = () => socket;

// ── Room actions ───────────────────────────────────────────────────────

export const createRoom = (roomId, roomName) => {
  socket?.emit(SOCKET_EVENTS.ROOM_CREATE, { roomId, roomName });
};

export const joinRoom = (roomId) => {
  socket?.emit(SOCKET_EVENTS.ROOM_JOIN, { roomId });
};

export const leaveRoom = (roomId) => {
  socket?.emit(SOCKET_EVENTS.ROOM_LEAVE, { roomId });
};

export const getParticipants = (roomId) => {
  socket?.emit(SOCKET_EVENTS.ROOM_PARTICIPANTS, { roomId });
};

// ── Chat actions ───────────────────────────────────────────────────────

export const sendMessage = (roomId, message) => {
  socket?.emit(SOCKET_EVENTS.CHAT_SEND, { roomId, message });
};

export const sendTyping = (roomId) => {
  socket?.emit(SOCKET_EVENTS.CHAT_TYPING, { roomId });
};

export const sendStopTyping = (roomId) => {
  socket?.emit(SOCKET_EVENTS.CHAT_STOP_TYPING, { roomId });
};

// ── Generic event helpers ──────────────────────────────────────────────

export const on = (event, callback) => {
  socket?.on(event, callback);
};

export const off = (event, callback) => {
  socket?.off(event, callback);
};

export const emit = (event, data) => {
  socket?.emit(event, data);
};

export { SOCKET_EVENTS };