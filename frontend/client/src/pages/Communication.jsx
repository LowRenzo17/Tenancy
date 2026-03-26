import { useState } from 'react';
import { Send, MessageSquare, Bell, Users, Plus, X } from 'lucide-react';
import Card from '../components/Card';

/**
 * Tenant Communication Portal
 * Design System: The Architectural Ledger
 * - Messaging system for property managers and tenants
 * - Notification management and broadcast messages
 */
export default function Communication({ tenants, properties }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'Manager',
      to: 'Sarah Johnson',
      subject: 'Rent Payment Reminder',
      message: 'This is a friendly reminder that rent is due on the 1st of the month. Please ensure payment is made on time.',
      date: new Date(2026, 2, 20),
      type: 'reminder',
      read: true,
    },
    {
      id: 2,
      from: 'Sarah Johnson',
      to: 'Manager',
      subject: 'Maintenance Request - Leaky Faucet',
      message: 'The kitchen faucet has been leaking for the past few days. Could you please arrange for a repair?',
      date: new Date(2026, 2, 19),
      type: 'maintenance',
      read: true,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    message: '',
    type: 'general',
  });

  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    subject: '',
    message: '',
    recipients: 'all',
  });

  const handleSendMessage = () => {
    if (!composeData.to || !composeData.subject || !composeData.message) {
      alert('Please fill in all fields');
      return;
    }

    const newMessage = {
      id: Math.max(...messages.map(m => m.id), 0) + 1,
      from: 'Manager',
      to: composeData.to,
      subject: composeData.subject,
      message: composeData.message,
      date: new Date(),
      type: composeData.type,
      read: false,
    };

    setMessages([newMessage, ...messages]);
    setComposeData({
      to: '',
      subject: '',
      message: '',
      type: 'general',
    });
    setShowCompose(false);
  };

  const handleSendBroadcast = () => {
    if (!broadcastData.subject || !broadcastData.message) {
      alert('Please fill in subject and message');
      return;
    }

    const recipientList = broadcastData.recipients === 'all'
      ? tenants.map(t => t.name)
      : [broadcastData.recipients];

    recipientList.forEach(recipient => {
      const newMessage = {
        id: Math.max(...messages.map(m => m.id), 0) + 1,
        from: 'Manager',
        to: recipient,
        subject: broadcastData.subject,
        message: broadcastData.message,
        date: new Date(),
        type: 'broadcast',
        read: false,
      };
      setMessages(prev => [newMessage, ...prev]);
    });

    setBroadcastData({
      subject: '',
      message: '',
      recipients: 'all',
    });
    setShowBroadcast(false);
  };

  const handleMarkAsRead = (messageId) => {
    setMessages(messages.map(m =>
      m.id === messageId ? { ...m, read: true } : m
    ));
  };

  const handleDeleteMessage = (messageId) => {
    setMessages(messages.filter(m => m.id !== messageId));
  };

  // Group messages by conversation
  const conversations = {};
  messages.forEach(msg => {
    const participant = msg.from === 'Manager' ? msg.to : msg.from;
    if (!conversations[participant]) {
      conversations[participant] = [];
    }
    conversations[participant].push(msg);
  });

  const selectedMessages = selectedConversation
    ? conversations[selectedConversation] || []
    : [];

  const unreadCount = messages.filter(m => !m.read).length;

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'reminder':
        return { bg: 'rgba(146, 64, 14, 0.1)', text: '#92400e' };
      case 'maintenance':
        return { bg: 'rgba(0, 52, 65, 0.1)', text: '#003441' };
      case 'broadcast':
        return { bg: 'rgba(22, 101, 52, 0.1)', text: '#166534' };
      default:
        return { bg: 'rgba(0, 52, 65, 0.1)', text: '#003441' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            Tenant Communication
          </h1>
          <p style={{ color: '#40484b' }}>Send messages, reminders, and announcements to tenants</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCompose(!showCompose)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: '#003441',
              color: '#fff',
            }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            <MessageSquare size={18} />
            New Message
          </button>
          <button
            onClick={() => setShowBroadcast(!showBroadcast)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: '#166534',
              color: '#fff',
            }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            <Bell size={18} />
            Broadcast
          </button>
        </div>
      </div>

      {/* Compose Message Form */}
      {showCompose && (
        <Card variant="elevated" className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
              Compose New Message
            </h3>
            <button
              onClick={() => setShowCompose(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} style={{ color: '#40484b' }} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#40484b' }}>
                  To
                </label>
                <select
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: '#f3faff',
                    border: '1px solid #d5ecf8',
                    color: '#071e27',
                  }}
                >
                  <option value="">Select a tenant...</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.name}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#40484b' }}>
                  Message Type
                </label>
                <select
                  value={composeData.type}
                  onChange={(e) => setComposeData({ ...composeData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: '#f3faff',
                    border: '1px solid #d5ecf8',
                    color: '#071e27',
                  }}
                >
                  <option value="general">General</option>
                  <option value="reminder">Reminder</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#40484b' }}>
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g., Rent Payment Reminder"
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  border: '1px solid #d5ecf8',
                  color: '#071e27',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#40484b' }}>
                Message
              </label>
              <textarea
                placeholder="Type your message here..."
                value={composeData.message}
                onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                rows="6"
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  border: '1px solid #d5ecf8',
                  color: '#071e27',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSendMessage}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#003441',
                  color: '#fff',
                }}
                onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.target.style.opacity = '1')}
              >
                <Send size={16} />
                Send Message
              </button>
              <button
                onClick={() => setShowCompose(false)}
                className="px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#e6f6ff',
                  color: '#003441',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#d5ecf8')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#e6f6ff')}
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Broadcast Message Form */}
      {showBroadcast && (
        <Card variant="elevated" className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
              Send Broadcast Message
            </h3>
            <button
              onClick={() => setShowBroadcast(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} style={{ color: '#40484b' }} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#40484b' }}>
                Recipients
              </label>
              <select
                value={broadcastData.recipients}
                onChange={(e) => setBroadcastData({ ...broadcastData, recipients: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  border: '1px solid #d5ecf8',
                  color: '#071e27',
                }}
              >
                <option value="all">All Tenants ({tenants.length})</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.name}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#40484b' }}>
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g., Important Community Announcement"
                value={broadcastData.subject}
                onChange={(e) => setBroadcastData({ ...broadcastData, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  border: '1px solid #d5ecf8',
                  color: '#071e27',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#40484b' }}>
                Message
              </label>
              <textarea
                placeholder="Type your broadcast message here..."
                value={broadcastData.message}
                onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                rows="6"
                className="w-full px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: '#f3faff',
                  border: '1px solid #d5ecf8',
                  color: '#071e27',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSendBroadcast}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#166534',
                  color: '#fff',
                }}
                onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.target.style.opacity = '1')}
              >
                <Bell size={16} />
                Send to All
              </button>
              <button
                onClick={() => setShowBroadcast(false)}
                className="px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#e6f6ff',
                  color: '#003441',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#d5ecf8')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#e6f6ff')}
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Communication Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card variant="elevated" className="p-4">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
            Conversations
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Object.entries(conversations).length > 0 ? (
              Object.entries(conversations).map(([participant, msgs]) => {
                const unread = msgs.filter(m => !m.read).length;
                return (
                  <button
                    key={participant}
                    onClick={() => {
                      setSelectedConversation(participant);
                      msgs.forEach(m => handleMarkAsRead(m.id));
                    }}
                    className="w-full text-left p-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: selectedConversation === participant ? '#e6f6ff' : 'transparent',
                      borderLeft: selectedConversation === participant ? '3px solid #003441' : '3px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedConversation !== participant) {
                        e.target.style.backgroundColor = '#f3faff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedConversation !== participant) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm" style={{ color: '#071e27' }}>
                        {participant}
                      </p>
                      {unread > 0 && (
                        <span
                          className="px-2 py-1 rounded text-xs font-bold"
                          style={{
                            backgroundColor: '#ba1a1a',
                            color: '#fff',
                          }}
                        >
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#40484b' }}>
                      {msgs[0]?.subject || 'No subject'}
                    </p>
                  </button>
                );
              })
            ) : (
              <p style={{ color: '#40484b' }}>No conversations yet</p>
            )}
          </div>
        </Card>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card variant="elevated" className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
                {selectedConversation}
              </h3>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {selectedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: msg.from === 'Manager' ? '#e6f6ff' : '#f3faff',
                      borderLeft: `3px solid ${msg.from === 'Manager' ? '#003441' : '#d5ecf8'}`,
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#071e27' }}>
                          {msg.from}
                        </p>
                        <p className="text-xs" style={{ color: '#40484b' }}>
                          {msg.date.toLocaleDateString()} {msg.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={getMessageTypeColor(msg.type)}
                        >
                          {msg.type.charAt(0).toUpperCase() + msg.type.slice(1)}
                        </span>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-xs px-2 py-1 rounded transition-colors"
                          style={{
                            color: '#ba1a1a',
                            backgroundColor: 'rgba(186, 26, 26, 0.1)',
                          }}
                          onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                          onMouseLeave={(e) => (e.target.style.opacity = '1')}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="font-semibold text-sm mb-2" style={{ color: '#071e27' }}>
                      {msg.subject}
                    </p>
                    <p style={{ color: '#40484b', lineHeight: '1.5' }}>
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card variant="subtle" className="p-12 text-center">
              <MessageSquare size={48} className="mx-auto mb-4" style={{ color: '#003441', opacity: 0.5 }} />
              <p className="text-lg font-medium" style={{ color: '#071e27' }}>Select a conversation</p>
              <p style={{ color: '#40484b' }}>Choose a tenant to view or continue the conversation</p>
            </Card>
          )}
        </div>
      </div>

      {/* Communication Stats */}
      <Card variant="subtle" className="p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
          Communication Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm" style={{ color: '#40484b' }}>Total Messages</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#071e27' }}>
              {messages.length}
            </p>
          </div>
          <div>
            <p className="text-sm" style={{ color: '#40484b' }}>Unread Messages</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#ba1a1a' }}>
              {unreadCount}
            </p>
          </div>
          <div>
            <p className="text-sm" style={{ color: '#40484b' }}>Active Conversations</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#003441' }}>
              {Object.keys(conversations).length}
            </p>
          </div>
          <div>
            <p className="text-sm" style={{ color: '#40484b' }}>Tenants Connected</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Manrope', color: '#166534' }}>
              {tenants.length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
