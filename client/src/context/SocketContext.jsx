import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import * as socketService from "../services/socketService.js";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";

/**
 * SocketContext — global real-time socket state.
 *
 * Provides:
 *   socket          — the raw socket.io-client instance
 *   connected       — boolean connection status
 *   activeUsers     — array of currently online users
 *   onlineCount     — number of online users
 *   joinRoom()      — join a meeting room
 *   leaveRoom()     — leave a meeting room
 *   sendMessage()   — send a chat message
 *   sendTyping()    — emit typing indicator
 *   sendStopTyping()— emit stop typing
 *
 * Lifecycle:
 * - Connects automatically when the user logs in (isAuthenticated = true)
 * - Disconnects automatically when the user logs out (isAuthenticated = false)
 * - Reconnects automatically on network drop (handled by socket.io-client)
 */

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const socketRef = useRef(null);

  // ── Connect when authenticated ──────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const newSocket = socketService.connect(token);
    socketRef.current = newSocket;
    setSocket(newSocket);

    // ── Core connection events ────────────────────────────────────────
    const onConnect = () => {
      setConnected(true);
      console.log("[Socket] Connected:", newSocket.id);
    };

    const onDisconnect = (reason) => {
      setConnected(false);
      console.log("[Socket] Disconnected:", reason);
    };

    const onConnectError = (error) => {
      setConnected(false);
      console.error("[Socket] Connection error:", error.message);
    };

    // ── Presence events ───────────────────────────────────────────────
    const onUsersActive = ({ users, count }) => {
      setActiveUsers(users);
      setOnlineCount(count);
    };

    const onActiveCount = ({ count }) => {
      setOnlineCount(count);
    };

    const onUserOnline = (user) => {
      setActiveUsers((prev) => {
        const exists = prev.find((u) => u._id === user.userId);
        if (exists) return prev;
        return [...prev, { _id: user.userId, name: user.name, avatar: user.avatar }];
      });
      setOnlineCount((c) => c + 1);
    };

    const onUserOffline = ({ userId }) => {
      setActiveUsers((prev) => prev.filter((u) => u._id !== userId));
      setOnlineCount((c) => Math.max(0, c - 1));
    };

    // ── Register all listeners ────────────────────────────────────────
    newSocket.on(SOCKET_EVENTS.CONNECT, onConnect);
    newSocket.on(SOCKET_EVENTS.DISCONNECT, onDisconnect);
    newSocket.on(SOCKET_EVENTS.CONNECT_ERROR, onConnectError);
    newSocket.on(SOCKET_EVENTS.USERS_ACTIVE, onUsersActive);
    newSocket.on(SOCKET_EVENTS.USERS_ACTIVE_COUNT, onActiveCount);
    newSocket.on(SOCKET_EVENTS.USER_ONLINE, onUserOnline);
    newSocket.on(SOCKET_EVENTS.USER_OFFLINE, onUserOffline);

    // ── Cleanup on logout / unmount ───────────────────────────────────
    return () => {
      newSocket.off(SOCKET_EVENTS.CONNECT, onConnect);
      newSocket.off(SOCKET_EVENTS.DISCONNECT, onDisconnect);
      newSocket.off(SOCKET_EVENTS.CONNECT_ERROR, onConnectError);
      newSocket.off(SOCKET_EVENTS.USERS_ACTIVE, onUsersActive);
      newSocket.off(SOCKET_EVENTS.USERS_ACTIVE_COUNT, onActiveCount);
      newSocket.off(SOCKET_EVENTS.USER_ONLINE, onUserOnline);
      newSocket.off(SOCKET_EVENTS.USER_OFFLINE, onUserOffline);
      socketService.disconnect();
      setSocket(null);
      setConnected(false);
      setActiveUsers([]);
      setOnlineCount(0);
    };
  }, [isAuthenticated, token]);

  // ── Actions ─────────────────────────────────────────────────────────
  const joinRoom = useCallback((roomId) => {
    socketService.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId) => {
    socketService.leaveRoom(roomId);
  }, []);

  const sendMessage = useCallback((roomId, message) => {
    socketService.sendMessage(roomId, message);
  }, []);

  const sendTyping = useCallback((roomId) => {
    socketService.sendTyping(roomId);
  }, []);

  const sendStopTyping = useCallback((roomId) => {
    socketService.sendStopTyping(roomId);
  }, []);

  const value = {
    socket,
    connected,
    activeUsers,
    onlineCount,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    sendStopTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}