import React, { useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Edit2, Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MessageDisplay() {
  const { messages, currentConversation, deleteMessage, markMessageAsRead, reactToMessage } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = React.useState(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.receiverId === user?.id && !msg.isRead) {
        markMessageAsRead(msg.id);
      }
    });
  }, [messages, user, markMessageAsRead]);

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === user?.id;

            return (
              <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {/* Sender name if not own */}
                  {!isOwn && <p className="text-xs font-semibold mb-1">{message.senderName}</p>}

                  {/* Message content */}
                  <p className="text-sm break-words">{message.content}</p>

                  {/* Message metadata */}
                  <div className={`flex items-center gap-2 mt-1 text-xs ${isOwn ? 'text-blue-100' : 'text-gray-600'}`}>
                    <span>{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
                    {message.edited && <span className="italic">(edited)</span>}
                    {isOwn && message.isRead && <span>✓✓</span>}
                  </div>

                  {/* Reactions */}
                  {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {Object.entries(message.reactions).map(([userId, reaction]) => (
                        <span key={userId} className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                          {reaction}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {isOwn && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="p-1 hover:bg-blue-600 rounded transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setEditingMessageId(message.id)}
                        className="p-1 hover:bg-blue-600 rounded transition-colors"
                        title="Edit message"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Reaction button */}
                  <button
                    onClick={() => reactToMessage(message.id, '👍')}
                    className={`p-1 rounded transition-colors ${
                      isOwn ? 'hover:bg-blue-600' : 'hover:bg-gray-300'
                    }`}
                    title="React to message"
                  >
                    <Smile className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
