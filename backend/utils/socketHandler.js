import { Server } from 'socket.io';
import { initializeChatSocket } from './chatSocketHandler.js';

/**
 * Initialize Socket.io server for real-time notifications
 */
export const initializeSocket = (httpServer, chatHandler = null) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Store active users
  const activeUsers = new Map();

  // Initialize chat socket handlers if provided
  if (chatHandler) {
    chatHandler(io);
  } else {
    initializeChatSocket(io);
  }

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins with their ID
    socket.on('user-join', (userId) => {
      activeUsers.set(userId, socket.id);
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined room user-${userId}`);
    });

    // Property events
    socket.on('property-created', (data) => {
      io.emit('property-created', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Property created event emitted');
    });

    socket.on('property-updated', (data) => {
      io.emit('property-updated', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Property updated event emitted');
    });

    socket.on('property-deleted', (data) => {
      io.emit('property-deleted', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Property deleted event emitted');
    });

    // Tenant events
    socket.on('tenant-created', (data) => {
      io.emit('tenant-created', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Tenant created event emitted');
    });

    socket.on('tenant-updated', (data) => {
      io.emit('tenant-updated', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Tenant updated event emitted');
    });

    socket.on('tenant-deleted', (data) => {
      io.emit('tenant-deleted', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Tenant deleted event emitted');
    });

    // Maintenance events
    socket.on('maintenance-created', (data) => {
      io.emit('maintenance-created', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Maintenance created event emitted');
    });

    socket.on('maintenance-updated', (data) => {
      io.emit('maintenance-updated', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Maintenance updated event emitted');
    });

    socket.on('maintenance-completed', (data) => {
      io.emit('maintenance-completed', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Maintenance completed event emitted');
    });

    socket.on('maintenance-deleted', (data) => {
      io.emit('maintenance-deleted', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Maintenance deleted event emitted');
    });

    // Payment events
    socket.on('payment-created', (data) => {
      io.emit('payment-created', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Payment created event emitted');
    });

    socket.on('payment-updated', (data) => {
      io.emit('payment-updated', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Payment updated event emitted');
    });

    socket.on('payment-received', (data) => {
      io.emit('payment-received', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Payment received event emitted');
    });

    socket.on('payment-overdue', (data) => {
      io.emit('payment-overdue', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Payment overdue event emitted');
    });

    // Message events
    socket.on('message-sent', (data) => {
      const { conversationId, receiverId } = data;
      io.to(`user-${receiverId}`).emit('message-received', {
        ...data,
        timestamp: new Date(),
      });
      console.log(`Message sent to user ${receiverId}`);
    });

    socket.on('message-read', (data) => {
      io.emit('message-read', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Message marked as read');
    });

    socket.on('conversation-created', (data) => {
      io.emit('conversation-created', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Conversation created event emitted');
    });

    // Notification events
    socket.on('notification-sent', (data) => {
      const { userId } = data;
      io.to(`user-${userId}`).emit('notification-received', {
        ...data,
        timestamp: new Date(),
      });
      console.log(`Notification sent to user ${userId}`);
    });

    // Rent reminder events
    socket.on('rent-reminder-sent', (data) => {
      const { tenantId } = data;
      io.to(`user-${tenantId}`).emit('rent-reminder-received', {
        ...data,
        timestamp: new Date(),
      });
      console.log(`Rent reminder sent to tenant ${tenantId}`);
    });

    // Analytics update events
    socket.on('analytics-updated', (data) => {
      io.emit('analytics-updated', {
        ...data,
        timestamp: new Date(),
      });
      console.log('Analytics updated event emitted');
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      // Remove user from active users
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
      console.log(`User disconnected: ${socket.id}`);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`Socket error: ${error}`);
    });
  });

  return io;
};

/**
 * Emit chat notification to user
 */
export const emitChatNotification = (io, userId, notification) => {
  io.to(`user-${userId}`).emit('chat-notification', {
    ...notification,
    timestamp: new Date(),
  });
};

/**
 * Emit message to conversation
 */
export const emitToConversation = (io, conversationId, eventName, data) => {
  io.to(`conversation-${conversationId}`).emit(eventName, {
    ...data,
    timestamp: new Date(),
  });
};

/**
 * Emit event to specific user
 */
export const emitToUser = (io, userId, eventName, data) => {
  io.to(`user-${userId}`).emit(eventName, {
    ...data,
    timestamp: new Date(),
  });
};

/**
 * Emit chat message to user
 */
export const emitChatMessage = (io, userId, message) => {
  io.to(`user-${userId}`).emit('receive-message', {
    ...message,
    timestamp: new Date(),
  });
};

/**
 * Emit event to all users
 */
export const emitToAll = (io, eventName, data) => {
  io.emit(eventName, {
    ...data,
    timestamp: new Date(),
  });
};

/**
 * Emit event to all except sender
 */
export const emitToOthers = (io, socketId, eventName, data) => {
  io.except(socketId).emit(eventName, {
    ...data,
    timestamp: new Date(),
  });
};
