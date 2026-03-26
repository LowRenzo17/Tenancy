import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { X, Bell } from 'lucide-react';

export default function NotificationCenter() {
  const { notifications, clearNotification, isConnected } = useSocket();
  const [displayedNotifications, setDisplayedNotifications] = useState([]);

  useEffect(() => {
    // Show new notifications with auto-dismiss after 5 seconds
    if (notifications.length > displayedNotifications.length) {
      const newNotification = notifications[0];
      setDisplayedNotifications((prev) => [newNotification, ...prev].slice(0, 5));

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        clearNotification(newNotification.id);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications, displayedNotifications.length, clearNotification]);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {/* Connection Status */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isConnected
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      {/* Notifications */}
      {displayedNotifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-slide-in"
        >
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm">{notification.title}</h3>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => clearNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
