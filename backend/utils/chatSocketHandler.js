/**
 * Socket.io Chat Event Handlers
 * Manages real-time chat functionality with MongoDB persistence
 */

import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

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
     * Send message with MongoDB persistence
     */
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, senderId, receiverId, senderName, content } = data;

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

        // Send confirmation to sender
        socket.emit('message-sent', {
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
     * Delete message
     */
    socket.on('delete-message', async (data) => {
      try {
        const { messageId, conversationId, senderId } = data;

        // Delete from MongoDB
        const message = await Message.findByIdAndDelete(messageId);

        if (message) {
          // Update conversation message count
          await Conversation.findByIdAndUpdate(
            conversationId,
            { $inc: { messageCount: -1 } }
          );

          // Broadcast deletion to all participants
          io.to(`conversation-${conversationId}`).emit('message-deleted', {
            messageId: message._id.toString(),
            conversationId,
          });

          console.log(`Message ${messageId} deleted`);
        }
      } catch (error) {
        console.error('Error deleting message:', error);
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
          // Broadcast reaction to all participants
          io.to(`conversation-${conversationId}`).emit('message-reaction', {
            messageId: message._id.toString(),
            conversationId,
            reactions: message.reactions || {},
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
      // Find and remove user from active users
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          console.log(`User ${userId} disconnected`);

          // Broadcast user offline status
          io.emit('user-offline', {
            userId,
            timestamp: new Date(),
          });
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
