/**
 * Socket.io Chat Event Handlers
 * Manages real-time chat functionality with MongoDB persistence
 */

import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Store active users and their socket IDs
const activeUsers = new Map();

// Store typing users
const typingUsers = new Map();

export const initializeChatSocket = (io) => {
  /**
   * JWT Authentication Middleware
   * Every socket connection must present a valid token.
   * Rejects the connection before any event handler runs.
   */
  io.use((socket, next) => {
    // Reuse verified user if already decoded by previous middleware
    if (socket.user?.id) {
      socket.userId = socket.user.id.toString();
      return next();
    }

    const authToken =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      socket.handshake.headers?.authorization;

    if (!authToken) {
      return next(new Error('Authentication error: No token provided'));
    }

    let token;
    if (typeof authToken === 'string' && authToken.startsWith('Bearer ')) {
      token = authToken.split(' ')[1];
    } else if (typeof authToken === 'string') {
      token = authToken;
    }

    if (!token) {
      return next(new Error('Authentication error: Invalid token format'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Attach verified userId to socket for use in all handlers
      socket.userId = (decoded.id || decoded._id)?.toString();
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    /**
     * User joins chat
     */
    socket.on('chat-user-join', (userId) => {
      const isFirstSocket = !activeUsers.has(userId);
      if (isFirstSocket) {
        activeUsers.set(userId, new Set());
      }
      activeUsers.get(userId).add(socket.id);

      socket.join(`user-${userId}`);
      socket.join(`chat-${userId}`);
      console.log(`User ${userId} joined chat (socket: ${socket.id})`);

      if (isFirstSocket) {
        // Tell everyone this user came online
        io.emit('user-online', {
          userId,
          timestamp: new Date(),
        });
      }

      // Send THIS joining user a snapshot of who is currently online
      // so they don't have to wait for the next user-join broadcast
      socket.emit('online-users', {
        userIds: Array.from(activeUsers.keys()),
      });
    });

    /**
     * Send message with MongoDB persistence
     */
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, receiverId, senderName, content } = data;
        // Use server-authenticated userId, NOT client-provided senderId (prevents spoofing)
        const senderId = socket.userId;
        if (!senderId) {
          socket.emit('message-error', { error: 'Not authenticated' });
          return;
        }

        // Validate conversation exists
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('message-error', {
            error: 'Conversation not found',
          });
          return;
        }

        // Create and save message to MongoDB
        const message = new Message({
          conversationId,
          senderId,
          receiverId,
          content,
          messageType: 'text',
          isRead: false,
        });

        await message.save();
        await message.populate('senderId', 'fullName email');

        // Update conversation metadata
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
        conversation.messageCount = (conversation.messageCount || 0) + 1;
        conversation.deletedFor = [];
        await conversation.save();

        const messageData = {
          id: message._id.toString(),
          conversationId: message.conversationId.toString(),
          senderId: message.senderId._id.toString(),
          senderName: message.senderId.fullName,
          content: message.content,
          timestamp: message.createdAt,
          isRead: message.isRead,
        };

        // Send to receiver
        io.to(`user-${receiverId}`).emit('receive-message', messageData);

        // Send confirmation to sender (all tabs)
        io.to(`user-${senderId}`).emit('message-sent', {
          ...messageData,
          status: 'sent',
        });

        console.log(`Message saved to MongoDB: ${message._id}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', {
          error: error.message,
        });
      }
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

      if (typingUsers.has(conversationId)) {
        typingUsers.get(conversationId).delete(senderId);
      }

      io.to(`user-${receiverId}`).emit('user-stopped-typing', {
        conversationId,
        senderId,
      });
    });

    /**
     * Mark message as read with MongoDB persistence
     */
    socket.on('message-read', async (data) => {
      try {
        const { messageId, conversationId, senderId, readerId } = data;

        // Update message in MongoDB
        const message = await Message.findByIdAndUpdate(
          messageId,
          {
            isRead: true,
            readAt: new Date(),
          },
          { new: true }
        );

        if (message) {
          // Notify sender that message was read
          io.to(`user-${senderId}`).emit('message-read-receipt', {
            messageId: message._id.toString(),
            conversationId,
            readAt: message.readAt,
          });

          console.log(`Message ${messageId} marked as read`);
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    /**
     * Mark entire conversation as read
     */
    socket.on('conversation-read', async (data) => {
      try {
        const { conversationId, userId } = data;

        // Update all unread messages in conversation
        const result = await Message.updateMany(
          {
            conversationId,
            receiverId: userId,
            isRead: false,
          },
          {
            isRead: true,
            readAt: new Date(),
          }
        );

        // Notify other participants
        io.to(`conversation-${conversationId}`).emit('conversation-marked-read', {
          conversationId,
          userId,
          modifiedCount: result.modifiedCount,
        });

        console.log(`Conversation ${conversationId} marked as read (${result.modifiedCount} messages)`);
      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    });

    /**
     * Delete message — "for me only" (soft-delete via socket)
     */
    socket.on('delete-message', async (data) => {
      try {
        const { messageId, userId } = data;

        // Soft-delete: add userId to deletedFor — message stays for others
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { deletedFor: userId },
        });

        // No broadcast — this is a per-user delete only
        console.log(`Message ${messageId} hidden for user ${userId}`);
      } catch (error) {
        console.error('Error soft-deleting message:', error);
      }
    });

    /**
     * Edit message
     */
    socket.on('edit-message', async (data) => {
      try {
        const { messageId, conversationId, newContent } = data;

        // Update message in MongoDB
        const message = await Message.findByIdAndUpdate(
          messageId,
          {
            content: newContent,
            edited: true,
            editedAt: new Date(),
          },
          { new: true }
        );

        if (message) {
          // Broadcast edit to all participants
          io.to(`conversation-${conversationId}`).emit('message-edited', {
            messageId: message._id.toString(),
            conversationId,
            content: message.content,
            editedAt: message.editedAt,
          });

          console.log(`Message ${messageId} edited`);
        }
      } catch (error) {
        console.error('Error editing message:', error);
      }
    });

    /**
     * React to message
     */
    socket.on('react-to-message', async (data) => {
      try {
        const { messageId, conversationId, userId, reaction } = data;

        // Update message reactions in MongoDB
        const message = await Message.findByIdAndUpdate(
          messageId,
          {
            $set: { [`reactions.${userId}`]: reaction },
          },
          { new: true }
        );

        if (message) {
          // Convert Mongoose Map → plain object before socket emit
          // (JSON.stringify silently drops Map entries without this)
          const reactionsObj = message.reactions
            ? Object.fromEntries(message.reactions)
            : {};

          io.to(`conversation-${conversationId}`).emit('message-reaction', {
            messageId: message._id.toString(),
            conversationId,
            reactions: reactionsObj,
          });

          console.log(`Reaction added to message ${messageId}`);
        }
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
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
     * User disconnects
     */
    socket.on('disconnect', () => {
      for (const [userId, socketIds] of activeUsers.entries()) {
        if (socketIds.has(socket.id)) {
          socketIds.delete(socket.id);
          console.log(`Socket ${socket.id} for user ${userId} disconnected`);

          if (socketIds.size === 0) {
            activeUsers.delete(userId);
            console.log(`User ${userId} went completely offline`);

            // Tell everyone this user went offline
            io.emit('user-offline', {
              userId,
              timestamp: new Date(),
            });

            // Send remaining clients an updated snapshot of who is online
            io.emit('online-users', {
              userIds: Array.from(activeUsers.keys()),
            });
          }
          break;
        }
      }
    });

    /**
     * Handle socket errors
     */
    socket.on('error', (error) => {
      console.error(`Socket error: ${error}`);
    });
  });
};
