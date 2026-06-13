import React, { useState, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { Send } from 'lucide-react';

/**
 * MessageInput
 * Design System: The Architectural Ledger
 * - Uses design token CSS variables, not raw Tailwind colors
 * - Sends via Socket.io through ChatContext
 */
export default function MessageInput() {
  const { sendMessage, sendTypingIndicator, currentConversation, typingUsers } = useChat();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  if (!currentConversation) return null;

  const typingUsersList = Object.values(typingUsers);

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator();
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setMessage('');
    setIsTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-card border-t border-border px-4 py-3 shrink-0">
      {/* Typing indicator */}
      {typingUsersList.length > 0 && (
        <p className="text-xs text-muted-foreground mb-2 italic">
          {typingUsersList.join(', ')} {typingUsersList.length === 1 ? 'is' : 'are'} typing…
        </p>
      )}

      <div className="flex gap-2 items-end">
        {/* Textarea */}
        <textarea
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
          rows={1}
          className="flex-1 px-3 py-2 border border-border rounded-lg bg-card text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
          style={{ minHeight: '40px', maxHeight: '120px' }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="p-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
