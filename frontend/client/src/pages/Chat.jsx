import { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import ConversationList from '../components/ConversationList';
import MessageDisplay from '../components/MessageDisplay';
import MessageInput from '../components/MessageInput';
import { Plus, Phone, Video, Info, X, MessageCircle, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../lib/api';

/**
 * Chat Page — Owner & Tenant View
 * Design System: The Architectural Ledger
 * - Owner: picks from their linked tenants (uses tenant.userId)
 * - Tenant: auto-discovers their assigned property manager (no free-form input)
 */
export default function Chat({ tenants = [] }) {
  const { currentConversation, createConversation, isUserOnline, deleteConversation } = useChat();
  const { user } = useAuth();
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Owner state
  const [selectedTenantUserId, setSelectedTenantUserId] = useState('');

  // Tenant state — auto-discovered property manager
  const [propertyManager, setPropertyManager] = useState(null); // { _id, fullName, email }
  const [managerLoading, setManagerLoading] = useState(false);
  const [managerError, setManagerError] = useState(null);

  const isOwner = user?.accountType === 'owner';
  const linkedTenants = tenants.filter(t => t.userId);

  const myId = user?.id?.toString();
  const otherParticipant = currentConversation?.participantIds?.find(
    (p) => (p._id?.toString() || p?.toString()) !== myId
  );
  const isOnline = otherParticipant
    ? isUserOnline(otherParticipant._id?.toString() || otherParticipant?.toString())
    : false;

  // When the modal opens for a tenant, auto-fetch their property manager
  useEffect(() => {
    if (showNewConversation && !isOwner && !propertyManager && !managerLoading) {
      setManagerLoading(true);
      setManagerError(null);
      apiClient.get('/tenants/my-owner')
        .then(res => {
          if (res.success) {
            setPropertyManager(res.owner);
          } else {
            setManagerError('Could not find your property manager. Contact support.');
          }
        })
        .catch(err => {
          setManagerError(err?.message || 'Could not load property manager info.');
        })
        .finally(() => setManagerLoading(false));
    }
  }, [showNewConversation, isOwner]);

  const resetModal = () => {
    setShowNewConversation(false);
    setSelectedTenantUserId('');
    // Keep propertyManager cached — don't clear it so re-opens are instant
  };

  // Owner: start conversation with a selected tenant
  const handleOwnerStartConversation = async () => {
    if (!selectedTenantUserId) { toast.error('Please select a tenant'); return; }
    setIsCreating(true);
    try {
      await createConversation([selectedTenantUserId]);
      toast.success('Conversation started');
      resetModal();
    } catch (err) {
      toast.error(err?.message || 'Failed to start conversation');
    } finally {
      setIsCreating(false);
    }
  };

  // Tenant: start conversation with their auto-discovered property manager
  const handleTenantStartConversation = async () => {
    if (!propertyManager?._id) { toast.error('Property manager not loaded'); return; }
    setIsCreating(true);
    try {
      await createConversation([propertyManager._id]);
      toast.success('Conversation started with your property manager');
      resetModal();
    } catch (err) {
      toast.error(err?.message || 'Failed to start conversation');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Conversation List sidebar */}
      <div className="w-72 shrink-0 bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
          <h2 className="font-bold text-sm uppercase tracking-widest text-foreground">Messages</h2>
          <button
            onClick={() => setShowNewConversation(true)}
            className="p-1.5 rounded-md hover:bg-secondary text-primary transition-colors"
            title="New conversation"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList onSelectConversation={() => setShowInfo(false)} />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm min-w-0">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-border px-5 py-4 flex items-center justify-between bg-secondary/20 shrink-0">
              {/* Left: avatar + name + presence */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar with presence dot */}
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {(otherParticipant?.fullName || currentConversation.subject || 'PM')[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${
                      isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    title={isOnline ? 'Online' : 'Offline'}
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-foreground truncate">
                    {otherParticipant?.fullName || currentConversation.subject || 'Property Manager'}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isOnline
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`}
                    />
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Right: action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toast.info('Voice calls are not supported in this version')}
                  className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Voice call (not available)"
                >
                  <Phone size={17} />
                </button>
                <button
                  onClick={() => toast.info('Video calls are not supported in this version')}
                  className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Video call (not available)"
                >
                  <Video size={17} />
                </button>

                {/* Clear chat — for me only */}
                <button
                  onClick={() => {
                    toast('Clear chat from your view?', {
                      description: 'Only you will lose this chat — the other party is unaffected.',
                      action: {
                        label: 'Clear for me',
                        onClick: () => deleteConversation(currentConversation._id),
                      },
                      cancel: { label: 'Cancel', onClick: () => {} },
                      duration: 8000,
                    });
                  }}
                  className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Clear chat (for me only)"
                >
                  <Trash2 size={17} />
                </button>

                <button
                  onClick={() => setShowInfo((v) => !v)}
                  className={`p-2 rounded-md transition-colors ${
                    showInfo
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                  title="Conversation info"
                >
                  <Info size={17} />
                </button>
              </div>
            </div>

            <div className="flex flex-1 min-h-0">
              {/* Messages */}
              <div className="flex-1 flex flex-col min-w-0">
                <MessageDisplay />
                <MessageInput />
              </div>

              {/* Info Panel */}
              {showInfo && (
                <div className="w-64 border-l border-border shrink-0 overflow-y-auto bg-secondary/10 p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">Details</h4>
                    <button onClick={() => setShowInfo(false)} className="p-1 rounded hover:bg-secondary text-muted-foreground"><X size={14} /></button>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Participant</p>
                    <p className="text-sm font-semibold text-foreground">{otherParticipant?.fullName || 'Property Manager'}</p>
                    {otherParticipant?.email && <p className="text-xs text-muted-foreground mt-0.5">{otherParticipant.email}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Subject</p>
                    <p className="text-sm text-foreground">{currentConversation.subject || 'General'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${isOnline ? 'bg-green-50 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle size={28} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground mb-1">No conversation selected</p>
              <p className="text-sm text-muted-foreground">
                {isOwner
                  ? 'Select a conversation or start a new one with a tenant.'
                  : 'Select a conversation or message your property manager below.'}
              </p>
            </div>
            <button
              onClick={() => setShowNewConversation(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus size={16} />
              {isOwner ? 'Start New Conversation' : 'Message Property Manager'}
            </button>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={resetModal}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">
                {isOwner ? 'New Conversation' : 'Message Your Property Manager'}
              </h3>
              <button onClick={resetModal} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-5">
              {isOwner ? (
                /* ── OWNER: pick from their linked tenants only ── */
                <>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-2">
                      Select Tenant
                    </label>
                    {linkedTenants.length === 0 ? (
                      <div className="flex items-start gap-3 p-3 bg-secondary/40 rounded-lg">
                        <AlertCircle size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          No tenants have registered yet. Share the signup link with your tenants so they can create an account.
                        </p>
                      </div>
                    ) : (
                      <select
                        value={selectedTenantUserId}
                        onChange={e => setSelectedTenantUserId(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">-- Choose a tenant --</option>
                        {linkedTenants.map(t => (
                          <option key={t.userId} value={t.userId}>
                            {t.name || t.fullName} — {t.email}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-border">
                    <button
                      onClick={handleOwnerStartConversation}
                      disabled={!selectedTenantUserId || isCreating || linkedTenants.length === 0}
                      className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {isCreating ? 'Starting…' : 'Start Conversation'}
                    </button>
                    <button onClick={resetModal} className="px-5 py-2.5 border border-border rounded-lg font-semibold text-sm hover:bg-secondary">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                /* ── TENANT: auto-discovered property manager only ── */
                <>
                  <p className="text-xs text-muted-foreground">
                    Your message will be sent directly to your assigned property manager.
                  </p>

                  {managerLoading ? (
                    <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                      <Loader2 size={18} className="animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Finding your property manager…</span>
                    </div>
                  ) : managerError ? (
                    <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
                      <p className="text-sm text-destructive">{managerError}</p>
                    </div>
                  ) : propertyManager ? (
                    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {propertyManager.fullName?.[0]?.toUpperCase() ?? 'P'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{propertyManager.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{propertyManager.email}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-primary/10 text-primary rounded shrink-0">
                        Property Manager
                      </span>
                    </div>
                  ) : null}

                  <div className="flex gap-3 pt-2 border-t border-border">
                    <button
                      onClick={handleTenantStartConversation}
                      disabled={!propertyManager || isCreating || managerLoading || !!managerError}
                      className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {isCreating ? 'Starting…' : 'Send Message'}
                    </button>
                    <button onClick={resetModal} className="px-5 py-2.5 border border-border rounded-lg font-semibold text-sm hover:bg-secondary">
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
