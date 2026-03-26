import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import ConversationList from '../components/ConversationList';
import MessageDisplay from '../components/MessageDisplay';
import MessageInput from '../components/MessageInput';
import { Plus, Phone, Video, Info } from 'lucide-react';

export default function Chat() {
  const { currentConversation, createConversation, isUserOnline } = useChat();
  const { user } = useAuth();
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleStartConversation = async () => {
    if (selectedUsers.length > 0) {
      await createConversation(selectedUsers);
      setSelectedUsers([]);
      setShowNewConversation(false);
    }
  };

  const otherParticipant = currentConversation?.participantIds.find((p) => p._id !== user?.id);

  return (
    <div className="flex h-full gap-4">
      {/* Conversation List */}
      <ConversationList onSelectConversation={() => {}} />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {otherParticipant?.fullName || currentConversation.subject}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isUserOnline(otherParticipant?._id) ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Active now
                      </span>
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </div>

              {/* Chat Actions */}
              <div className="flex gap-2">
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Start voice call"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Start video call"
                >
                  <Video className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Conversation info"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <MessageDisplay />

            {/* Message Input */}
            <MessageInput />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-gray-500 text-lg">No conversation selected</p>
            <button
              onClick={() => setShowNewConversation(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Start New Conversation
            </button>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Start New Conversation</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select recipient
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNewConversation(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartConversation}
                disabled={selectedUsers.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
