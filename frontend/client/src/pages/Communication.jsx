import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import Chat from './Chat';
import Card from '../components/Card';
import apiClient from '../lib/api';
import { useChat } from '../contexts/ChatContext';
import { toast } from 'sonner';

/**
 * Tenant Communication Portal (Live)
 * Wraps the full robust Chat component while retaining the ability 
 * to broadcast messages individually to all linked tenants.
 */
export default function Communication({ tenants }) {
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ subject: '', message: '', recipients: 'all' });
  const [isSending, setIsSending] = useState(false);
  const { fetchConversations } = useChat();

  const handleSendBroadcast = async () => {
    if (!broadcastData.subject || !broadcastData.message) {
      toast.error('Please fill in both the subject and the message content.');
      return;
    }

    try {
      setIsSending(true);
      // Filter the tenants based on selection
      const recipientList = broadcastData.recipients === 'all'
        ? tenants
        : tenants.filter(t => t.id === broadcastData.recipients || t._id === broadcastData.recipients);

      let sentCount = 0;
      for (const tenant of recipientList) {
        // Broadcasts can only be sent to tenants who have successfully linked a platform user account.
        if (!tenant.userId) continue; 

        // 1. Create or get conversation with this tenant
        const convRes = await apiClient.post('/chat/conversations', {
          participantIds: [tenant.userId],
          subject: broadcastData.subject
        });

        if (convRes.success) {
          const conversationId = convRes.conversation._id;
          
          // 2. Send the actual message
          await apiClient.post('/chat/messages', {
            conversationId,
            receiverId: tenant.userId,
            content: broadcastData.message
          });
          sentCount++;
        }
      }

      toast.success(`Broadcast delivered to ${sentCount} tenant${sentCount !== 1 ? 's' : ''}`);
      setShowBroadcast(false);
      setBroadcastData({ subject: '', message: '', recipients: 'all' });
      
      // Refresh conversation list to show the new messages in the sidebar
      if (sentCount > 0) {
        fetchConversations();
      }
    } catch (err) {
      console.error('Error during broadcast:', err);
      toast.error('Failed to send broadcast. Check your connection and try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Tenant Communication
          </h1>
          <p className="text-sm text-muted-foreground">Message tenants individually or broadcast announcements safely.</p>
        </div>
        <button
          onClick={() => setShowBroadcast(true)}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-[#003441] text-white font-bold rounded-lg shadow-sm hover:opacity-90 transition-colors"
        >
          <Bell size={16} />
          Broadcast Announcement
        </button>
      </div>

      {/* The main live Chat UI — tenants prop enables the owner tenant-picker */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Chat tenants={tenants} />
      </div>

      {showBroadcast && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <Card variant="elevated" className="p-6 max-w-lg w-full bg-white shadow-xl border border-border animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h3 className="text-xl font-bold tracking-tight text-foreground">Send Broadcast Message</h3>
              <button disabled={isSending} onClick={() => setShowBroadcast(false)} className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-md transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#003441]/70 mb-2">Recipients</label>
                <select
                  disabled={isSending}
                  value={broadcastData.recipients}
                  onChange={e => setBroadcastData({...broadcastData, recipients: e.target.value})}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-[#003441]/20 focus:border-[#003441] outline-none transition-all text-foreground font-medium"
                >
                  <option value="all">All Linked Tenants ({tenants.filter(t => t.userId).length})</option>
                  {tenants.filter(t => t.userId).map(t => (
                    <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>
                  ))}
                </select>
                {tenants.filter(t => !t.userId).length > 0 && (
                  <p className="text-xs mt-2 text-[#ba1a1a] font-medium bg-[#ba1a1a]/5 p-2 rounded">
                    * {tenants.filter(t => !t.userId).length} tenant(s) are ignored because they have not created an account.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#003441]/70 mb-2">Subject Summary</label>
                <input
                  disabled={isSending}
                  type="text"
                  placeholder="e.g. Water Maintenance"
                  value={broadcastData.subject}
                  onChange={e => setBroadcastData({...broadcastData, subject: e.target.value})}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-[#003441]/20 focus:border-[#003441] outline-none transition-all text-foreground font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#003441]/70 mb-2">Message content</label>
                <textarea
                  disabled={isSending}
                  rows={5}
                  placeholder="Hello, please be advised that..."
                  value={broadcastData.message}
                  onChange={e => setBroadcastData({...broadcastData, message: e.target.value})}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-[#003441]/20 focus:border-[#003441] outline-none transition-all text-foreground font-medium resize-y max-h-64"
                />
              </div>

              <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-border">
                <button
                  disabled={isSending}
                  onClick={() => setShowBroadcast(false)}
                  className="px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-colors rounded-lg hover:bg-secondary text-foreground"
                >
                  Cancel
                </button>
                <button
                  disabled={isSending}
                  onClick={handleSendBroadcast}
                  className={`px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest text-xs text-white transition-all shadow-sm ${isSending ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#003441] hover:opacity-90'}`}
                >
                  {isSending ? 'Sending Broadcast...' : 'Send Broadcast'} 
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
