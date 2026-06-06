/**
 * useSocket — re-exported from SocketContext for a cleaner import path.
 *
 * Usage:
 *   import { useSocket } from "../hooks/useSocket";
 *   const { connected, onlineCount, sendMessage } = useSocket();
 */
export { useSocket } from "../context/SocketContext.jsx";