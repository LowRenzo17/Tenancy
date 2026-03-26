/**
 * Socket.io Chat Event Handlers
 * Manages real-time chat functionality including messages, typing indicators, and read receipts
 */

// Store active users and their socket IDs
const activeUsers = new Map();

// Store typing users
const typingUsers = new Map();

export const initializeChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    /**
     * User joins chat
     */
    socket.on('chat-user-join', (userId) => {
      activeUsers.set(userId, socket.id);
      socket.join(`user-${userId}`);
      socket.join(`chat-${userId}`);
      console.log(`User ${userId} joined chat (socket: ${socket.id})`);

      // Broadcast user online status
      io.emit('user-online', {
        userId,
        timestamp: new Date(),
      });
    });

    /**
     * Send message
     */
    socket.on('send-message', async (data) => {
      const { conversationId, senderId, receiverId, senderName, content } = data;

      const message = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId,
        receiverId,
        senderName,
        content,
        timestamp: new Date(),
        isRead: false,
      };

      // Send to receiver
      io.to(`user-${receiverId}`).emit('receive-message', message);

      // Send confirmation to sender
      socket.emit('message-sent', {
        ...message,
        status: 'sent',
      });

      console.log(`Message sent from ${senderId} to ${receiverId}`);
    });

    /**
     * Typing indicator
     */
    socket.on('typing', (data) => {
      const { conversationId, senderId, senderName, receiverId } = data;

      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Set());
      }
      typingUsers.get(conversationId).add(senderId);

      // Notify receiver
      io.to(`user-${receiverId}`).emit('user-typing', {
        conversationId,
        senderId,
        senderName,
        timestamp: new Date(),
      });

      // Auto-clear typing status after 3 seconds
      setTimeout(() => {
        const typingSet = typingUsers.get(conversationId);
        if (typingSet) {
          typingSet.delete(senderId);
          if (typingSet.size === 0) {
            typingUsers.delete(conversationId);
          }
        }

        io.to(`user-${receiverId}`).emit('user-stopped-typing', {
          conversationId,
          senderId,
        });
      }, 3000);
    });

    /**
     * Stop typing
     */
    socket.on('stop-typing', (data) => {
      const { conversationId, senderId, receiverId } = data;

      const typingSet = typingUsers.get(conversationId);
      if (typingSet) {
        typingSet.delete(senderId);
      }

      io.to(`user-${receiverId}`).emit('user-stopped-typing', {
        conversationId,
        senderId,
      });
    });

    /**
     * Message read receipt
     */
    socket.on('message-read', (data) => {
      const { messageId, conversationId, senderId, readerId } = data;

      io.to(`user-${senderId}`).emit('message-read-receipt', {
        messageId,
        conversationId,
        readerId,
        timestamp: new Date(),
      });

      console.log(`Message ${messageId} read by ${readerId}`);
    });

    /**
     * Mark conversation as read
     */
    socket.on('conversation-read', (data) => {
      const { conversationId, userId } = data;

      io.to(`user-${userId}`).emit('conversation-marked-read', {
        conversationId,
        timestamp: new Date(),
      });
    });

    /**
     * Join conversation room
     */
    socket.on('join-conversation', (data) => {
      const { conversationId, userId } = data;
      socket.join(`conversation-${conversationId}`);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    /**
     * Leave conversation room
     */
    socket.on('leave-conversation', (data) => {
      const { conversationId, userId } = data;
      socket.leave(`conversation-${conversationId}`);
      console.log(`User ${userId} left conversation ${conversationId}`);
    });

    /**
     * Start video call
     */
    socket.on('initiate-call', (data) => {
      const { conversationId, callerId, callerName, receiverId } = data;

      io.to(`user-${receiverId}`).emit('incoming-call', {
        conversationId,
        callerId,
        callerName,
        callId: `call-${Date.now()}`,
        timestamp: new Date(),
      });

      console.log(`Call initiated from ${callerId} to ${receiverId}`);
    });

    /**
     * Accept call
     */
    socket.on('accept-call', (data) => {
      const { callId, conversationId, accepterId, callerId } = data;

      io.to(`user-${callerId}`).emit('call-accepted', {
        callId,
        conversationId,
        accepterId,
        timestamp: new Date(),
      });

      console.log(`Call ${callId} accepted by ${accepterId}`);
    });

    /**
     * Reject call
     */
    socket.on('reject-call', (data) => {
      const { callId, conversationId, rejectedBy, callerId } = data;

      io.to(`user-${callerId}`).emit('call-rejected', {
        callId,
        conversationId,
        rejectedBy,
        timestamp: new Date(),
      });

      console.log(`Call ${callId} rejected by ${rejectedBy}`);
    });

    /**
     * End call
     */
    socket.on('end-call', (data) => {
      const { callId, conversationId, userId, otherUserId } = data;

      io.to(`user-${otherUserId}`).emit('call-ended', {
        callId,
        conversationId,
        endedBy: userId,
        timestamp: new Date(),
      });

      console.log(`Call ${callId} ended by ${userId}`);
    });

    /**
     * Send file/attachment
     */
    socket.on('send-file', (data) => {
      const { conversationId, senderId, receiverId, senderName, fileName, fileUrl, fileSize } = data;

      const message = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId,
        receiverId,
        senderName,
        content: `Shared file: ${fileName}`,
        fileUrl,
        fileSize,
        messageType: 'file',
        timestamp: new Date(),
        isRead: false,
      };

      io.to(`user-${receiverId}`).emit('receive-message', message);
      socket.emit('message-sent', { ...message, status: 'sent' });

      console.log(`File sent from ${senderId} to ${receiverId}`);
    });

    /**
     * Send location
     */
    socket.on('send-location', (data) => {
      const { conversationId, senderId, receiverId, senderName, latitude, longitude } = data;

      const message = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId,
        receiverId,
        senderName,
        content: 'Shared location',
        latitude,
        longitude,
        messageType: 'location',
        timestamp: new Date(),
        isRead: false,
      };

      io.to(`user-${receiverId}`).emit('receive-message', message);
      socket.emit('message-sent', { ...message, status: 'sent' });

      console.log(`Location sent from ${senderId} to ${receiverId}`);
    });

    /**
     * Delete message
     */
    socket.on('delete-message', (data) => {
      const { messageId, conversationId, senderId, receiverId } = data;

      io.to(`conversation-${conversationId}`).emit('message-deleted', {
        messageId,
        conversationId,
        deletedBy: senderId,
        timestamp: new Date(),
      });

      console.log(`Message ${messageId} deleted by ${senderId}`);
    });

    /**
     * Edit message
     */
    socket.on('edit-message', (data) => {
      const { messageId, conversationId, senderId, newContent, receiverId } = data;

      io.to(`conversation-${conversationId}`).emit('message-edited', {
        messageId,
        conversationId,
        newContent,
        editedBy: senderId,
        editedAt: new Date(),
      });

      console.log(`Message ${messageId} edited by ${senderId}`);
    });

    /**
     * React to message
     */
    socket.on('react-to-message', (data) => {
      const { messageId, conversationId, userId, reaction } = data;

      io.to(`conversation-${conversationId}`).emit('message-reaction', {
        messageId,
        conversationId,
        userId,
        reaction,
        timestamp: new Date(),
      });

      console.log(`Reaction added to message ${messageId}`);
    });

    /**
     * User disconnect
     */
    socket.on('disconnect', () => {
      let disconnectedUserId;
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          activeUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        io.emit('user-offline', {
          userId: disconnectedUserId,
          timestamp: new Date(),
        });
        console.log(`User ${disconnectedUserId} disconnected`);
      }

      console.log(`Socket ${socket.id} disconnected`);
    });

    /**
     * Error handler
     */
    socket.on('error', (error) => {
      console.error(`Socket error: ${error}`);
    });
  });

  return io;
};

/**
 * Get active users
 */
export const getActiveUsers = () => {
  return Array.from(activeUsers.keys());
};

/**
 * Get active user socket ID
 */
export const getActiveUserSocket = (userId) => {
  return activeUsers.get(userId);
};

/**
 * Check if user is online
 */
export const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};
