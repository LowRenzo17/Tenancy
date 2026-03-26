import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket.io connected');
      setIsConnected(true);
      // Emit user join event
      newSocket.emit('user-join', user.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.io disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
    });

    // Property events
    newSocket.on('property-created', (data) => {
      addNotification('Property Created', `New property: ${data.name}`);
    });

    newSocket.on('property-updated', (data) => {
      addNotification('Property Updated', `Property ${data.name} has been updated`);
    });

    newSocket.on('property-deleted', (data) => {
      addNotification('Property Deleted', `Property ${data.name} has been deleted`);
    });

    // Tenant events
    newSocket.on('tenant-created', (data) => {
      addNotification('Tenant Added', `New tenant: ${data.fullName}`);
    });

    newSocket.on('tenant-updated', (data) => {
      addNotification('Tenant Updated', `Tenant ${data.fullName} has been updated`);
    });

    newSocket.on('tenant-deleted', (data) => {
      addNotification('Tenant Removed', `Tenant ${data.fullName} has been removed`);
    });

    // Maintenance events
    newSocket.on('maintenance-created', (data) => {
      addNotification('Maintenance Request', `New request: ${data.title}`);
    });

    newSocket.on('maintenance-updated', (data) => {
      addNotification('Maintenance Updated', `Request ${data.title} has been updated`);
    });

    newSocket.on('maintenance-completed', (data) => {
      addNotification('Maintenance Completed', `Request ${data.title} has been completed`);
    });

    newSocket.on('maintenance-deleted', (data) => {
      addNotification('Maintenance Deleted', `Request ${data.title} has been deleted`);
    });

    // Payment events
    newSocket.on('payment-created', (data) => {
      addNotification('Payment Created', `New payment record for $${data.amount}`);
    });

    newSocket.on('payment-updated', (data) => {
      addNotification('Payment Updated', `Payment record has been updated`);
    });

    newSocket.on('payment-received', (data) => {
      addNotification('Payment Received', `Payment of $${data.amount} has been received`);
    });

    newSocket.on('payment-overdue', (data) => {
      addNotification('Payment Overdue', `Payment of $${data.amount} is now overdue`);
    });

    // Message events
    newSocket.on('message-received', (data) => {
      addNotification('New Message', `Message from ${data.senderName}`);
    });

    newSocket.on('message-read', (data) => {
      addNotification('Message Read', 'Your message has been read');
    });

    newSocket.on('conversation-created', (data) => {
      addNotification('New Conversation', 'A new conversation has been started');
    });

    // Notification events
    newSocket.on('notification-received', (data) => {
      addNotification(data.title, data.message);
    });

    // Rent reminder events
    newSocket.on('rent-reminder-received', (data) => {
      addNotification('Rent Reminder', `Rent payment is due on ${data.dueDate}`);
    });

    // Analytics update events
    newSocket.on('analytics-updated', (data) => {
      addNotification('Analytics Updated', 'Your dashboard analytics have been updated');
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  const addNotification = (title, message) => {
    const notification = {
      id: Date.now(),
      title,
      message,
      timestamp: new Date(),
    };
    setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50
    console.log(`Notification: ${title} - ${message}`);
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Emit events
  const emitPropertyCreated = (property) => {
    if (socket) socket.emit('property-created', property);
  };

  const emitPropertyUpdated = (property) => {
    if (socket) socket.emit('property-updated', property);
  };

  const emitPropertyDeleted = (property) => {
    if (socket) socket.emit('property-deleted', property);
  };

  const emitTenantCreated = (tenant) => {
    if (socket) socket.emit('tenant-created', tenant);
  };

  const emitTenantUpdated = (tenant) => {
    if (socket) socket.emit('tenant-updated', tenant);
  };

  const emitTenantDeleted = (tenant) => {
    if (socket) socket.emit('tenant-deleted', tenant);
  };

  const emitMaintenanceCreated = (maintenance) => {
    if (socket) socket.emit('maintenance-created', maintenance);
  };

  const emitMaintenanceUpdated = (maintenance) => {
    if (socket) socket.emit('maintenance-updated', maintenance);
  };

  const emitMaintenanceCompleted = (maintenance) => {
    if (socket) socket.emit('maintenance-completed', maintenance);
  };

  const emitMaintenanceDeleted = (maintenance) => {
    if (socket) socket.emit('maintenance-deleted', maintenance);
  };

  const emitPaymentCreated = (payment) => {
    if (socket) socket.emit('payment-created', payment);
  };

  const emitPaymentUpdated = (payment) => {
    if (socket) socket.emit('payment-updated', payment);
  };

  const emitPaymentReceived = (payment) => {
    if (socket) socket.emit('payment-received', payment);
  };

  const emitPaymentOverdue = (payment) => {
    if (socket) socket.emit('payment-overdue', payment);
  };

  const emitMessageSent = (message) => {
    if (socket) socket.emit('message-sent', message);
  };

  const emitMessageRead = (messageId) => {
    if (socket) socket.emit('message-read', { messageId });
  };

  const emitConversationCreated = (conversation) => {
    if (socket) socket.emit('conversation-created', conversation);
  };

  const emitNotificationSent = (notification) => {
    if (socket) socket.emit('notification-sent', notification);
  };

  const emitRentReminderSent = (reminder) => {
    if (socket) socket.emit('rent-reminder-sent', reminder);
  };

  const emitAnalyticsUpdated = (analytics) => {
    if (socket) socket.emit('analytics-updated', analytics);
  };

  const value = {
    socket,
    isConnected,
    notifications,
    addNotification,
    clearNotification,
    clearAllNotifications,
    emitPropertyCreated,
    emitPropertyUpdated,
    emitPropertyDeleted,
    emitTenantCreated,
    emitTenantUpdated,
    emitTenantDeleted,
    emitMaintenanceCreated,
    emitMaintenanceUpdated,
    emitMaintenanceCompleted,
    emitMaintenanceDeleted,
    emitPaymentCreated,
    emitPaymentUpdated,
    emitPaymentReceived,
    emitPaymentOverdue,
    emitMessageSent,
    emitMessageRead,
    emitConversationCreated,
    emitNotificationSent,
    emitRentReminderSent,
    emitAnalyticsUpdated,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
