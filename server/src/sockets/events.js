/**
 * SOCKET_EVENTS — single source of truth for all socket event names.
 *
 * Imported by every server socket handler AND the frontend socketService.
 * Changing an event name here updates it everywhere automatically.
 */

export const SOCKET_EVENTS = {
  // ── Connection lifecycle ───────────────────────────────────────────
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",

  // ── Presence ───────────────────────────────────────────────────────
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  USER_LAST_SEEN: "user:lastSeen",
  USERS_ACTIVE: "users:active",
  USERS_ACTIVE_COUNT: "users:activeCount",

  // ── Room management ────────────────────────────────────────────────
  ROOM_CREATE: "room:create",
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  ROOM_PARTICIPANTS: "room:participants",
  ROOM_CREATED: "room:created",
  ROOM_JOINED: "room:joined",
  ROOM_LEFT: "room:left",
  ROOM_ERROR: "room:error",
  ROOM_USER_JOINED: "room:userJoined",
  ROOM_USER_LEFT: "room:userLeft",

  // ── Chat ───────────────────────────────────────────────────────────
  CHAT_SEND: "chat:send",
  CHAT_RECEIVE: "chat:receive",
  CHAT_TYPING: "chat:typing",
  CHAT_STOP_TYPING: "chat:stopTyping",
  CHAT_ERROR: "chat:error",

  // ── Server errors ──────────────────────────────────────────────────
  SERVER_ERROR: "server:error",
};