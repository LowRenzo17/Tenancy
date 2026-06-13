import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import apiClient from '../lib/api';
import { toast } from 'sonner';

const ChatContext = createContext();

/**
 * Normalize a message object to a consistent shape regardless of source:
 * - Socket messages: { id, senderId: string, senderName, timestamp, ... }
 * - REST messages:  { _id, senderId: { _id, fullName }, createdAt, ... }
 */
function normalizeMessage(msg) {
  return {
    id: msg.id || msg._id?.toString(),
    conversationId: msg.conversationId?.toString(),
    senderId:
      typeof msg.senderId === 'object' && msg.senderId !== null
        ? msg.senderId._id?.toString()
        : msg.senderId?.toString(),
    senderName:
      typeof msg.senderId === 'object' && msg.senderId !== null
        ? msg.senderId.fullName
        : msg.senderName,
    receiverId: msg.receiverId?.toString?.() || msg.receiverId,
    content: msg.content,
    timestamp: msg.timestamp || msg.createdAt,
    isRead: msg.isRead,
    edited: msg.edited,
    reactions: msg.reactions || {},
  };
}

/** Get the receiver's ID out of a populated participantIds array */
function getReceiverId(participantIds, myId) {
  if (!participantIds || !myId) return undefined;
  const receiver = participantIds.find(
    (p) => (p?._id?.toString() || p?.toString()) !== myId.toString()
  );
  return receiver?._id?.toString() || receiver?.toString();
}

export const ChatProvider = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const { user, isAuthenticated } = useAuth();

  // Chat state
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch conversations on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [isAuthenticated, user]);

  // Join chat when socket connects
  useEffect(() => {
    if (isConnected && user) {
      socket.emit('chat-user-join', user.id);
    }
  }, [isConnected, user, socket]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (message) => {
      const normalized = normalizeMessage(message);
      const isCurrentConv =
        currentConversation &&
        normalized.conversationId === currentConversation._id?.toString();

      if (isCurrentConv) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === normalized.id)) return prev;
          return [...prev, normalized];
        });
        // No badge increment — user is actively viewing this conversation
      } else {
        // Message arrived in a conversation the user isn't currently viewing.
        // Only increment if it was NOT sent by this user (safety guard).
        const myId = user?.id?.toString();
        if (myId && normalized.senderId !== myId) {
          setUnreadCount((c) => c + 1);
        }
      }
      // Refresh conversation list to show latest message preview
      fetchConversations();
    });

    socket.on('message-sent', (message) => {
      const normalized = normalizeMessage(message);
      if (currentConversation && normalized.conversationId === currentConversation._id?.toString()) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === normalized.id)) return prev;
          return [...prev, normalized];
        });
      }
      fetchConversations();
    });

    socket.on('user-typing', (data) => {
      if (currentConversation && data.conversationId === currentConversation._id) {
        setTypingUsers((prev) => ({
          ...prev,
          [data.senderId]: data.senderName,
        }));
      }
    });

    socket.on('user-stopped-typing', (data) => {
      if (currentConversation && data.conversationId === currentConversation._id) {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[data.senderId];
          return updated;
        });
      }
    });

    socket.on('message-read-receipt', (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, isRead: true, readAt: data.timestamp } : msg
        )
      );
    });

    socket.on('user-online', (data) => {
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
    });

    socket.on('user-offline', (data) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });
    });

    // Full presence snapshot — sent on join and after any disconnect
    socket.on('online-users', (data) => {
      setOnlineUsers(new Set(data.userIds || []));
    });

    // NOTE: 'message-deleted' is intentionally NOT listened to here.
    // Deletion is "for me only" (soft-delete). The deleting user's local state
    // is updated directly in deleteMessage(). No socket broadcast is sent.

    socket.on('message-edited', (data) => {
      if (currentConversation && data.conversationId === currentConversation._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, content: data.newContent, edited: true } : msg
          )
        );
      }
    });

    socket.on('message-reaction', (data) => {
      // Backend emits full reactions object: { messageId, conversationId, reactions: {} }
      if (
        currentConversation &&
        data.conversationId?.toString() === currentConversation._id?.toString()
      ) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === data.messageId?.toString()) {
              return { ...msg, reactions: data.reactions || {} };
            }
            return msg;
          })
        );
      }
    });

    // NOTE: 'conversation-deleted' is intentionally NOT listened to here.
    // Delete Chat is "for me only" (soft-delete). The requesting user's state
    // is updated directly in deleteConversation(). No socket broadcast is sent.

    return () => {
      socket.off('receive-message');
      socket.off('message-sent');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
      socket.off('message-read-receipt');
      socket.off('user-online');
      socket.off('user-offline');
      socket.off('online-users');
      socket.off('message-edited');
      socket.off('message-reaction');
    };
  }, [socket, currentConversation, user]);

  // Fetch conversations from API
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/chat/conversations');
      if (response.success) {
        setConversations(response.conversations || []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/chat/conversations/${conversationId}`);
      if (response.success) {
        setCurrentConversation(response.conversation);
        // Normalize to canonical message shape before storing in state
        setMessages((response.messages || []).map(normalizeMessage));
        markConversationAsRead(conversationId);
        // Join the conversation room to receive room-scoped socket events
        if (socket && user) {
          socket.emit('join-conversation', {
            conversationId,
            userId: user.id,
          });
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [socket, user]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get('/chat/messages/unread/count');
      if (response.success) {
        setUnreadCount(response.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Create or get conversation
  const createConversation = useCallback(
    async (participantIds, subject = '') => {
      try {
        setLoading(true);
        const response = await apiClient.post('/chat/conversations', {
          participantIds,
          subject,
        });
        if (response.success) {
          if (!response.isNew) {
            // Conversation already exists, fetch its messages
            await fetchMessages(response.conversation._id);
          } else {
            // New conversation
            setConversations((prev) => [response.conversation, ...prev]);
            setCurrentConversation(response.conversation);
            setMessages([]);
            // Join the conversation room immediately for room-scoped events
            if (socket && user) {
              socket.emit('join-conversation', {
                conversationId: response.conversation._id,
                userId: user.id,
              });
            }
          }
          return response.conversation;
        }
      } catch (err) {
        setError(err.message);
        console.error('Error creating conversation:', err);
        throw err; // Re-throw so callers can show their own error feedback
      } finally {
        setLoading(false);
      }
    },
    [fetchMessages]
  );

  // Send message
  const sendMessage = useCallback(
    (content) => {
      if (!currentConversation || !socket || !user) return;

      const myId = user.id?.toString();
      const receiverId = getReceiverId(currentConversation.participantIds, myId);

      const messageData = {
        conversationId: currentConversation._id,
        senderId: myId,
        senderName: user.fullName,
        receiverId,
        content,
      };

      // Emit via Socket.io for real-time and MongoDB persistence
      socket.emit('send-message', messageData);

      // Clear typing indicator
      socket.emit('stop-typing', {
        conversationId: currentConversation._id,
        senderId: myId,
        receiverId,
      });
    },
    [currentConversation, socket, user]
  );

  // Send typing indicator
  const sendTypingIndicator = useCallback(() => {
    if (!currentConversation || !socket || !user) return;

    const myId = user.id?.toString();
    socket.emit('typing', {
      conversationId: currentConversation._id,
      senderId: myId,
      senderName: user.fullName,
      receiverId: getReceiverId(currentConversation.participantIds, myId),
    });
  }, [currentConversation, socket, user]);

  // Mark message as read
  const markMessageAsRead = useCallback(
    (messageId) => {
      if (!socket || !user) return;

      apiClient
        .put(`/chat/messages/${messageId}/read`, {})
        .then(() => {
          socket.emit('message-read', {
            messageId,
            conversationId: currentConversation._id,
            senderId: messages.find((m) => m.id === messageId)?.senderId,
            readerId: user.id,
          });
        })
        .catch((err) => {
          console.error('Error marking message as read:', err);
        });
    },
    [socket, user, currentConversation, messages]
  );

  // Mark conversation as read
  const markConversationAsRead = useCallback(
    (conversationId) => {
      if (!user || !conversationId) return;

      // Optimistically clear the badge immediately for snappy UX
      setUnreadCount(0);

      apiClient
        .put(`/chat/conversations/${conversationId}/read`, {})
        .then(() => {
          if (socket) {
            socket.emit('conversation-read', {
              conversationId,
              userId: user.id,
            });
          }
          // Re-fetch the true count from DB in case there are other unread convs
          fetchUnreadCount();
        })
        .catch((err) => {
          console.error('Error marking conversation as read:', err);
          // Restore accurate count on failure
          fetchUnreadCount();
        });
    },
    [socket, user, fetchUnreadCount]
  );

  // Delete message — "for me only" (soft-delete)
  // The message is hidden from the deleting user only; the other participant still sees it.
  const deleteMessage = useCallback(
    (messageId) => {
      if (!currentConversation) return;

      apiClient
        .delete(`/chat/messages/${messageId}`, {})
        .then(() => {
          // Remove only from local state — no socket broadcast to the other user
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
        })
        .catch((err) => {
          console.error('Error deleting message:', err);
          toast.error('Failed to delete message. Please try again.');
        });
    },
    [currentConversation]
  );

  // Edit message
  const editMessage = useCallback(
    (messageId, newContent) => {
      if (!socket || !currentConversation) return;

      const myId = user.id?.toString();
      socket.emit('edit-message', {
        messageId,
        conversationId: currentConversation._id,
        senderId: myId,
        newContent,
        receiverId: getReceiverId(currentConversation.participantIds, myId),
      });
    },
    [socket, currentConversation, user]
  );

  // React to message — optimistic update + socket persistence
  const reactToMessage = useCallback(
    (messageId, reaction) => {
      if (!socket || !currentConversation || !user) return;

      const myId = user.id?.toString();

      // Optimistic update: toggle if same reaction, otherwise set new one
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          const current = msg.reactions || {};
          // Toggle off if clicking the same reaction again
          if (current[myId] === reaction) {
            const updated = { ...current };
            delete updated[myId];
            return { ...msg, reactions: updated };
          }
          return { ...msg, reactions: { ...current, [myId]: reaction } };
        })
      );

      socket.emit('react-to-message', {
        messageId,
        conversationId: currentConversation._id,
        userId: myId,
        reaction,
      });
    },
    [socket, currentConversation, user]
  );

  // Delete entire chat — "for me only" (soft-delete)
  // Hides the conversation AND all its messages from the current user's view.
  // The other participant sees absolutely nothing change.
  const deleteConversation = useCallback(
    async (conversationId) => {
      try {
        await apiClient.delete(`/chat/conversations/${conversationId}`);

        // Remove only from THIS user's local state — no socket to other party
        setConversations((prev) => prev.filter((c) => c._id !== conversationId));
        if (currentConversation?._id === conversationId) {
          setCurrentConversation(null);
          setMessages([]);
        }
        toast.success('Chat cleared from your view');
      } catch (err) {
        console.error('Error clearing conversation:', err);
        toast.error(err?.message || 'Failed to clear chat. Please try again.');
      }
    },
    [currentConversation]
  );

  const archiveConversation = useCallback(
    async (conversationId) => {
      try {
        const response = await apiClient.put(`/chat/conversations/${conversationId}/archive`, {});
        if (response.success) {
          setConversations((prev) => prev.filter((c) => c._id !== conversationId));
          if (currentConversation?._id === conversationId) {
            setCurrentConversation(null);
            setMessages([]);
          }
        }
      } catch (err) {
        setError(err.message);
        console.error('Error archiving conversation:', err);
      }
    },
    [currentConversation]
  );

  // Check if user is online
  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  const value = {
    conversations,
    currentConversation,
    messages,
    typingUsers,
    onlineUsers,
    unreadCount,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    createConversation,
    sendMessage,
    sendTypingIndicator,
    markMessageAsRead,
    markConversationAsRead,
    deleteMessage,
    deleteConversation,
    editMessage,
    reactToMessage,
    archiveConversation,
    isUserOnline,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
