import { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader } from "lucide-react";
import { useSocket } from "../../hooks/useSocket.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { SOCKET_EVENTS } from "../../utils/socketEvents.js";
import { ChatMessage } from "./ChatMessage.jsx";
import { ChatInput } from "./ChatInput.jsx";
import api from "../../services/api.js";

/**
 * ChatPanel — full real-time chat with history loading.
 * Fetches previous messages from REST API on mount.
 * New messages arrive via Socket.IO in real time.
 */
export function ChatPanel({ roomId, onClose }) {
  const { socket, connected, sendMessage, sendTyping, sendStopTyping } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);

  // ── Load chat history on mount ─────────────────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await api.get(`/messages/${roomId}`);
        if (data.success) setMessages(data.messages);
      } catch {
        // History load failure is non-critical
      } finally {
        setLoadingHistory(false);
      }
    };
    if (roomId) loadHistory();
  }, [roomId]);

  // ── Real-time message listener ─────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onReceive = (message) => {
      setMessages((prev) => {
        // Deduplicate in case message arrives twice
        if (prev.find((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    const onTyping = ({ userId, name }) => {
      if (userId === user._id) return;
      setTypingUsers((prev) =>
        prev.find((u) => u.userId === userId) ? prev : [...prev, { userId, name }]
      );
    };

    const onStopTyping = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    const onReactionUpdate = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => m._id === messageId ? { ...m, reactions } : m)
      );
    };

    socket.on(SOCKET_EVENTS.CHAT_RECEIVE, onReceive);
    socket.on(SOCKET_EVENTS.CHAT_TYPING, onTyping);
    socket.on(SOCKET_EVENTS.CHAT_STOP_TYPING, onStopTyping);
    socket.on(SOCKET_EVENTS.MESSAGE_REACTION_UPDATE, onReactionUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_RECEIVE, onReceive);
      socket.off(SOCKET_EVENTS.CHAT_TYPING, onTyping);
      socket.off(SOCKET_EVENTS.CHAT_STOP_TYPING, onStopTyping);
      socket.off(SOCKET_EVENTS.MESSAGE_REACTION_UPDATE, onReactionUpdate);
    };
  }, [socket, user._id]);

  // ── Auto-scroll to bottom ──────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // ── Actions ────────────────────────────────────────────────────────
  const handleSend = useCallback((text) => {
    if (roomId && text) sendMessage(roomId, text);
  }, [roomId, sendMessage]);

  const handleReaction = useCallback((messageId, emoji) => {
    socket?.emit(SOCKET_EVENTS.MESSAGE_REACTION, { messageId, roomId, emoji });
  }, [socket, roomId]);

  const typingLabel = () => {
    if (!typingUsers.length) return null;
    if (typingUsers.length === 1) return `${typingUsers[0].name} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
    return "Several people are typing...";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">Chat</span>
          {messages.length > 0 && (
            <span className="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full">
              {messages.length}
            </span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loadingHistory ? (
          <div className="flex justify-center py-6">
            <Loader size={18} className="text-white/30 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-20">
            <p className="text-xs text-white/30">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg._id}
              message={msg}
              isSelf={msg.sender._id === user._id}
              onReact={handleReaction}
            />
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-[10px] text-white/40">{typingLabel()}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onTyping={() => sendTyping(roomId)}
        onStopTyping={() => sendStopTyping(roomId)}
        disabled={!connected}
      />
    </div>
  );
}