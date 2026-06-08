import { useState, useRef, useCallback } from "react";
import { Send, Smile } from "lucide-react";

/**
 * ChatInput — message input with typing indicator support.
 *
 * Calls onTyping() while the user is typing and onStopTyping() after
 * a 1.5s pause. The parent (ChatPanel) forwards these to the socket.
 */
export function ChatInput({ onSend, onTyping, onStopTyping, disabled = false }) {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleChange = (e) => {
    setMessage(e.target.value);

    // Emit typing start once
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping?.();
    }

    // Reset the stop-typing timer on each keystroke
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onStopTyping?.();
    }, 1500);
  };

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) return;

    onSend?.(trimmed);
    setMessage("");

    // Stop typing indicator immediately on send
    clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    onStopTyping?.();
  }, [message, onSend, onStopTyping]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-2.5 border-t border-white/5 flex items-center gap-2 shrink-0">
      <button className="text-white/40 hover:text-white/70 transition-colors shrink-0">
        <Smile size={16} />
      </button>
      <input
        type="text"
        placeholder="Message..."
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="
          flex-1 bg-white/5 border border-white/10 rounded-xl
          px-3 py-1.5 text-xs text-white placeholder:text-white/30
          outline-none focus:border-violet-500/50 transition-colors
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      />
      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="
          text-white/40 hover:text-violet-400 transition-colors shrink-0
          disabled:opacity-30 disabled:cursor-not-allowed
        "
      >
        <Send size={14} />
      </button>
    </div>
  );
}