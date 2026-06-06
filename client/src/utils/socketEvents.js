/**
 * SOCKET_EVENTS — client-side mirror of server/src/socket/events.js
 *
 * Keep this in sync with the server events file.
 * Both files must have identical values.
 */
export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",

  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  USER_LAST_SEEN: "user:lastSeen",
  USERS_ACTIVE: "users:active",
  USERS_ACTIVE_COUNT: "users:activeCount",

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

  CHAT_SEND: "chat:send",
  CHAT_RECEIVE: "chat:receive",
  CHAT_TYPING: "chat:typing",
  CHAT_STOP_TYPING: "chat:stopTyping",
  CHAT_ERROR: "chat:error",

  SERVER_ERROR: "server:error",
};