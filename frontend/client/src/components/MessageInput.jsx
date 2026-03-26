import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { Send, Paperclip, Smile } from 'lucide-react';

export default function MessageInput() {
  const { sendMessage, sendTypingIndicator, currentConversation, typingUsers } = useChat();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  if (!currentConversation) {
    return null;
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const typingUsersList = Object.values(typingUsers);

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* Typing indicator */}
      {typingUsersList.length > 0 && (
        <div className="mb-2 text-xs text-gray-500">
          {typingUsersList.join(', ')} {typingUsersList.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Message input area */}
      <div className="flex gap-2 items-end">
        {/* Attachments button */}
        <button
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Emoji button */}
        <button
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="Add emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Message input */}
        <textarea
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows="1"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          style={{ minHeight: '40px', maxHeight: '120px' }}
        />

        {/* Send button */}
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="p-2 text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded transition-colors"
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Character count */}
      <div className="mt-2 text-xs text-gray-400">
        {message.length} characters
      </div>
    </div>
  );
}
