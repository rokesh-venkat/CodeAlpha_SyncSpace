import { createContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth.js";
import * as socketService from "../services/socketService.js";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const newSocket = socketService.connect(token);
    setSocket(newSocket);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onConnectError = () => setConnected(false);
    const onUsersActive = ({ users = [], count = 0 }) => { setActiveUsers(users); setOnlineCount(count); };
    const onActiveCount = ({ count = 0 }) => setOnlineCount(count);
    const onUserOnline = (user) => {
      setActiveUsers((prev) => prev.find((u) => u._id === user.userId) ? prev : [...prev, { _id: user.userId, name: user.name, avatar: user.avatar }]);
      setOnlineCount((c) => c + 1);
    };
    const onUserOffline = ({ userId }) => {
      setActiveUsers((prev) => prev.filter((u) => u._id !== userId));
      setOnlineCount((c) => Math.max(0, c - 1));
    };

    newSocket.on(SOCKET_EVENTS.CONNECT, onConnect);
    newSocket.on(SOCKET_EVENTS.DISCONNECT, onDisconnect);
    newSocket.on(SOCKET_EVENTS.CONNECT_ERROR, onConnectError);
    newSocket.on(SOCKET_EVENTS.USERS_ACTIVE, onUsersActive);
    newSocket.on(SOCKET_EVENTS.USERS_ACTIVE_COUNT, onActiveCount);
    newSocket.on(SOCKET_EVENTS.USER_ONLINE, onUserOnline);
    newSocket.on(SOCKET_EVENTS.USER_OFFLINE, onUserOffline);

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

  const joinRoom = useCallback((roomId) => socketService.joinRoom(roomId), []);
  const leaveRoom = useCallback((roomId) => socketService.leaveRoom(roomId), []);
  const sendMessage = useCallback((roomId, message) => socketService.sendMessage(roomId, message), []);
  const sendTyping = useCallback((roomId) => socketService.sendTyping(roomId), []);
  const sendStopTyping = useCallback((roomId) => socketService.sendStopTyping(roomId), []);

  return (
    <SocketContext.Provider value={{ socket, connected, activeUsers, onlineCount, joinRoom, leaveRoom, sendMessage, sendTyping, sendStopTyping }}>
      {children}
    </SocketContext.Provider>
  );
}
