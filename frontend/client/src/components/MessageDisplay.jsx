import React, { useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, MessageSquare, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

/** Safe relative time — never throws on invalid/missing dates */
function RelativeTime({ value }) {
  if (!value) return <span>just now</span>;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return <span>just now</span>;
    return <span>{formatDistanceToNow(d, { addSuffix: true })}</span>;
  } catch {
    return <span>just now</span>;
  }
}

/** Reaction pill — grouped by emoji, highlights if current user reacted */
function ReactionPill({ emoji, userIds, myId, onClick }) {
  const mine = userIds.includes(myId);
  return (
    <button
      onClick={onClick}
      className={`
        text-xs px-2 py-0.5 rounded-full border transition-colors
        ${mine
          ? 'bg-amber-100 border-amber-300 text-amber-700 font-semibold'
          : 'bg-secondary border-border text-muted-foreground hover:bg-muted'
        }
      `}
    >
      {emoji}{userIds.length > 1 ? ` ${userIds.length}` : ''}
    </button>
  );
}

export default function MessageDisplay() {
  const { messages, currentConversation, deleteMessage, reactToMessage } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <MessageSquare size={26} className="text-primary opacity-60" />
          </div>
          <p className="text-muted-foreground text-sm">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const myId = user?.id?.toString();

  /**
   * "Delete for me only" — same as WhatsApp "Delete for me".
   * The message is soft-deleted in the DB (deletedFor array).
   * The other party's view is NOT affected at all.
   */
  const handleDelete = (messageId) => {
    toast('Delete this message?', {
      description: 'This message will only be removed from your view.',
      action: {
        label: 'Delete for me',
        onClick: () => deleteMessage(messageId),
      },
      cancel: { label: 'Keep', onClick: () => {} },
      duration: 7000,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare size={22} className="text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">No messages yet — say hello!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => {
            const isOwn = message.senderId?.toString() === myId;

            // Group reactions by emoji: { "👍": [userId1, userId2], ... }
            const reactionMap = {};
            if (message.reactions && typeof message.reactions === 'object') {
              Object.entries(message.reactions).forEach(([uid, emoji]) => {
                if (!reactionMap[emoji]) reactionMap[emoji] = [];
                reactionMap[emoji].push(uid);
              });
            }

            return (
              <div
                key={message.id}
                className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
              >
                {/* Message row: action buttons + bubble */}
                <div
                  className={`
                    flex items-end gap-2
                    ${isOwn ? 'flex-row-reverse' : 'flex-row'}
                    max-w-[78%]
                  `}
                >
                  {/*
                    ── Action buttons ─────────────────────────────────────────
                    These are in the NORMAL DOCUMENT FLOW (no absolute/fixed
                    positioning). This means overflow-y: auto on the scroll
                    container CANNOT clip them — they are always visible.
                  */}
                  <div className="flex flex-col gap-1.5 shrink-0 self-end pb-0.5">
                    {/* React 👍 — all messages */}
                    <button
                      onClick={() => reactToMessage(message.id, '👍')}
                      className={`
                        w-7 h-7 flex items-center justify-center rounded-full
                        border text-sm transition-all duration-150
                        ${message.reactions?.[myId] === '👍'
                          ? 'bg-amber-100 border-amber-400 scale-110'
                          : 'bg-card border-border text-muted-foreground hover:border-amber-300 hover:bg-amber-50'
                        }
                      `}
                      title="React with 👍"
                      aria-label="React with thumbs up"
                    >
                      👍
                    </button>

                    {/*
                      Delete button — OWN messages only.
                      "Delete for me" — only removes from YOUR view.
                      The other party's messages are NOT affected.
                    */}
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="
                          w-7 h-7 flex items-center justify-center rounded-full
                          border border-red-200 bg-red-50 text-red-500
                          hover:bg-red-100 hover:border-red-400 hover:text-red-700
                          transition-all duration-150
                        "
                        title="Delete for me"
                        aria-label="Delete this message for me only"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`
                      px-4 py-2.5 rounded-2xl min-w-0
                      ${isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-secondary text-foreground rounded-bl-sm'
                      }
                    `}
                  >
                    {/* Sender label — incoming only */}
                    {!isOwn && message.senderName && (
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">
                        {message.senderName}
                      </p>
                    )}

                    {/* Message text — full content, wraps naturally */}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    {/* Timestamp + read receipt */}
                    <div
                      className={`
                        flex items-center gap-1.5 mt-1 text-[10px]
                        ${isOwn ? 'justify-end text-primary-foreground/60' : 'text-muted-foreground'}
                      `}
                    >
                      <RelativeTime value={message.timestamp} />
                      {message.edited && <span className="italic">(edited)</span>}
                      {isOwn && (
                        <CheckCheck
                          size={12}
                          className={message.isRead ? 'text-blue-300' : 'opacity-40'}
                          title={message.isRead ? 'Read' : 'Sent'}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Reaction pills — below bubble */}
                {Object.keys(reactionMap).length > 0 && (
                  <div
                    className={`
                      flex gap-1 mt-1 flex-wrap
                      ${isOwn ? 'justify-end pr-10' : 'pl-10'}
                    `}
                  >
                    {Object.entries(reactionMap).map(([emoji, uids]) => (
                      <ReactionPill
                        key={emoji}
                        emoji={emoji}
                        userIds={uids}
                        myId={myId}
                        onClick={() => reactToMessage(message.id, emoji)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
