import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { Search, Plus, Archive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ConversationList({ onSelectConversation }) {
  const { conversations, currentConversation, unreadCount, isUserOnline, fetchMessages, archiveConversation } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participantIds?.some((p) => p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectConversation = (conversation) => {
    fetchMessages(conversation._id);
    onSelectConversation(conversation);
  };

  const handleArchive = (e, conversationId) => {
    e.stopPropagation();
    if (confirm('Archive this conversation?')) {
      archiveConversation(conversationId);
    }
  };

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
        {unreadCount > 0 && (
          <div className="mb-4 p-2 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">{unreadCount} unread messages</p>
          </div>
        )}
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Start a new conversation with a tenant or owner</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipant = conversation.participantIds.find((p) => p._id !== localStorage.getItem('userId'));
            const isSelected = currentConversation?._id === conversation._id;
            const hasUnread = conversation.messageCount > 0; // Simplified check

            return (
              <div
                key={conversation._id}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-sm font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {otherParticipant?.fullName || conversation.subject || 'Unnamed Conversation'}
                      </h3>
                      {isUserOnline(otherParticipant?._id) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {otherParticipant?.email}
                    </p>
                    {conversation.lastMessage && (
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                    {conversation.lastMessageAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleArchive(e, conversation._id)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                    title="Archive conversation"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
