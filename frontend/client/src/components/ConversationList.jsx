import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, Archive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * ConversationList
 * Design System: The Architectural Ledger
 * - Uses AuthContext for current user ID (not localStorage)
 * - Design tokens via CSS variables, not raw Tailwind colors
 */
export default function ConversationList({ onSelectConversation }) {
  const { conversations, currentConversation, unreadCount, isUserOnline, fetchMessages, archiveConversation } = useChat();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participantIds?.some(p => p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()))
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
    <div className="flex flex-col h-full">
      {/* Unread badge */}
      {unreadCount > 0 && (
        <div className="mx-3 mt-3 px-3 py-1.5 bg-primary/10 rounded-lg">
          <p className="text-xs text-primary font-semibold">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-border rounded-lg bg-card text-sm outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start a new conversation with the + button above</p>
          </div>
        ) : (
          filteredConversations.map(conversation => {
            // Use auth context user id — not localStorage
            const myId = user?.id?.toString();
            const otherParticipant = conversation.participantIds?.find(
              (p) => (p._id?.toString() || p?.toString()) !== myId
            );
            const isSelected = currentConversation?._id === conversation._id;

            return (
              <div
                key={conversation._id}
                onClick={() => handleSelectConversation(conversation)}
                className={`px-4 py-3 border-b border-border cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">
                        {(otherParticipant?.fullName || conversation.subject || '?')[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {otherParticipant?.fullName || conversation.subject || 'Conversation'}
                        </h3>
                        {isUserOnline(otherParticipant?._id?.toString() || otherParticipant?.toString()) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                        )}
                      </div>
                      {conversation.lastMessage?.content && (
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      {conversation.lastMessageAt && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={e => handleArchive(e, conversation._id)}
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors shrink-0 mt-0.5 opacity-0 group-hover:opacity-100"
                    title="Archive conversation"
                  >
                    <Archive className="w-3.5 h-3.5" />
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
