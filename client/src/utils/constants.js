export const APP_NAME = "SyncSpace";
export const APP_VERSION = "1.0.0";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const ROOM_ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
export const ROOM_ID_LENGTH = 9; // xxx-xxx format

export const MAX_PARTICIPANTS = 12;
export const MAX_MESSAGE_LENGTH = 2000;
export const CHAT_HISTORY_LIMIT = 50;

export const PANEL = {
  CHAT: "chat",
  PARTICIPANTS: "participants",
  NONE: null,
};

export const MEDIA_ERRORS = {
  NOT_ALLOWED: "Camera/microphone permission denied.",
  NOT_FOUND: "No camera or microphone found.",
  IN_USE: "Camera or microphone is in use by another app.",
};