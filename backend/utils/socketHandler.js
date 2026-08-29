import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
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

  // Socket authentication middleware
  io.use((socket, next) => {
    const authToken = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    let token;

    if (typeof authToken === 'string' && authToken.startsWith('Bearer ')) {
      token = authToken.split(' ')[1];
    } else if (typeof authToken === 'string') {
      token = authToken;
    }

    if (!token) {
      return next(new Error('Authentication error: token required'));
    }

    if (!process.env.JWT_SECRET) {
      return next(new Error('Server configuration error: JWT_SECRET is not defined'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id };
      return next();
    } catch (error) {
      return next(new Error('Authentication error: invalid or expired token'));
    }
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

    if (socket.user?.id) {
      if (!activeUsers.has(socket.user.id)) {
        activeUsers.set(socket.user.id, new Set());
      }
      activeUsers.get(socket.user.id).add(socket.id);
      socket.join(`user-${socket.user.id}`);
      console.log(`Authenticated user ${socket.user.id} joined room user-${socket.user.id}`);
    }

    // User joins additional rooms by ID if needed
    socket.on('user-join', (userId) => {
      if (!socket.user?.id || socket.user.id !== userId) {
        return;
      }
      if (!activeUsers.has(userId)) {
        activeUsers.set(userId, new Set());
      }
      activeUsers.get(userId).add(socket.id);
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined room user-${userId}`);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      // Remove user from active users
      for (const [userId, socketIds] of activeUsers.entries()) {
        if (socketIds.has(socket.id)) {
          socketIds.delete(socket.id);
          if (socketIds.size === 0) {
            activeUsers.delete(userId);
            console.log(`User ${userId} disconnected (all tabs closed)`);
          }
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
