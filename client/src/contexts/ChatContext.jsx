import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import apiClient from '../lib/api';

const ChatContext = createContext();

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
      if (currentConversation && message.conversationId === currentConversation._id) {
        setMessages((prev) => [...prev, message]);
      }
      // Refresh conversations to show latest message
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

    socket.on('message-deleted', (data) => {
      if (currentConversation && data.conversationId === currentConversation._id) {
        setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
      }
    });

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
      if (currentConversation && data.conversationId === currentConversation._id) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === data.messageId) {
              return {
                ...msg,
                reactions: {
                  ...(msg.reactions || {}),
                  [data.userId]: data.reaction,
                },
              };
            }
            return msg;
          })
        );
      }
    });

    return () => {
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
      socket.off('message-read-receipt');
      socket.off('user-online');
      socket.off('user-offline');
      socket.off('message-deleted');
      socket.off('message-edited');
      socket.off('message-reaction');
    };
  }, [socket, currentConversation]);

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
        setMessages(response.messages || []);
        // Mark as read
        markConversationAsRead(conversationId);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
            // Conversation already exists, just fetch messages
            await fetchMessages(response.conversation._id);
          } else {
            // New conversation created
            setConversations((prev) => [response.conversation, ...prev]);
            setCurrentConversation(response.conversation);
            setMessages([]);
          }
          return response.conversation;
        }
      } catch (err) {
        setError(err.message);
        console.error('Error creating conversation:', err);
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

      const messageData = {
        conversationId: currentConversation._id,
        senderId: user.id,
        senderName: user.fullName,
        receiverId: currentConversation.participantIds.find((p) => p._id !== user.id)?._id,
        content,
      };

      // Emit via Socket.io for real-time
      socket.emit('send-message', messageData);

      // Also save to database
      apiClient.post('/chat/messages', messageData).catch((err) => {
        console.error('Error saving message:', err);
      });

      // Clear typing indicator
      socket.emit('stop-typing', {
        conversationId: currentConversation._id,
        senderId: user.id,
        receiverId: messageData.receiverId,
      });
    },
    [currentConversation, socket, user]
  );

  // Send typing indicator
  const sendTypingIndicator = useCallback(() => {
    if (!currentConversation || !socket || !user) return;

    socket.emit('typing', {
      conversationId: currentConversation._id,
      senderId: user.id,
      senderName: user.fullName,
      receiverId: currentConversation.participantIds.find((p) => p._id !== user.id)?._id,
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
      if (!socket || !user) return;

      apiClient
        .put(`/chat/conversations/${conversationId}/read`, {})
        .then(() => {
          socket.emit('conversation-read', {
            conversationId,
            userId: user.id,
          });
          fetchUnreadCount();
        })
        .catch((err) => {
          console.error('Error marking conversation as read:', err);
        });
    },
    [socket, user, fetchUnreadCount]
  );

  // Delete message
  const deleteMessage = useCallback(
    (messageId) => {
      if (!socket || !currentConversation) return;

      apiClient
        .delete(`/chat/messages/${messageId}`, {})
        .then(() => {
          socket.emit('delete-message', {
            messageId,
            conversationId: currentConversation._id,
            senderId: user.id,
            receiverId: currentConversation.participantIds.find((p) => p._id !== user.id)?._id,
          });
        })
        .catch((err) => {
          console.error('Error deleting message:', err);
        });
    },
    [socket, currentConversation, user]
  );

  // Edit message
  const editMessage = useCallback(
    (messageId, newContent) => {
      if (!socket || !currentConversation) return;

      socket.emit('edit-message', {
        messageId,
        conversationId: currentConversation._id,
        senderId: user.id,
        newContent,
        receiverId: currentConversation.participantIds.find((p) => p._id !== user.id)?._id,
      });
    },
    [socket, currentConversation, user]
  );

  // React to message
  const reactToMessage = useCallback(
    (messageId, reaction) => {
      if (!socket || !currentConversation) return;

      socket.emit('react-to-message', {
        messageId,
        conversationId: currentConversation._id,
        userId: user.id,
        reaction,
      });
    },
    [socket, currentConversation, user]
  );

  // Archive conversation
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
