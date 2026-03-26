# Real-Time Chat Feature Documentation

## Overview

The Tenancy Slate application now includes a comprehensive real-time chat system that enables seamless communication between property owners and tenants. The chat feature is built on Socket.io for real-time messaging and includes advanced features like typing indicators, read receipts, message reactions, and conversation management.

## Architecture

### Backend Components

#### 1. Chat Routes (`backend/routes/chat.js`)
RESTful API endpoints for persistent chat operations:

- **GET `/api/chat/conversations`** - Fetch all conversations for the current user
- **GET `/api/chat/conversations/:conversationId`** - Get a specific conversation with all messages
- **POST `/api/chat/conversations`** - Create a new conversation
- **POST `/api/chat/messages`** - Send a message
- **PUT `/api/messages/:messageId/read`** - Mark a message as read
- **GET `/api/messages/unread/count`** - Get unread message count
- **PUT `/api/conversations/:conversationId/read`** - Mark all messages in conversation as read
- **DELETE `/api/messages/:messageId`** - Delete a message
- **PUT `/api/conversations/:conversationId/archive`** - Archive a conversation
- **GET `/api/conversations/search/:query`** - Search conversations

#### 2. Chat Socket Handlers (`backend/utils/chatSocketHandler.js`)
Real-time event handlers for instant messaging:

**Connection Events:**
- `chat-user-join` - User joins chat system
- `disconnect` - User disconnects

**Messaging Events:**
- `send-message` - Send a new message
- `receive-message` - Receive a message (emitted to receiver)
- `message-sent` - Confirmation that message was sent

**Typing Indicators:**
- `typing` - User is typing
- `stop-typing` - User stopped typing
- `user-typing` - Notify receiver that user is typing
- `user-stopped-typing` - Notify receiver that user stopped typing

**Read Receipts:**
- `message-read` - Mark message as read
- `message-read-receipt` - Notify sender that message was read
- `conversation-read` - Mark entire conversation as read
- `conversation-marked-read` - Notify that conversation is marked as read

**Conversation Management:**
- `join-conversation` - User joins a conversation room
- `leave-conversation` - User leaves a conversation room

**Advanced Features:**
- `send-file` - Send file attachment
- `send-location` - Share location
- `delete-message` - Delete a message
- `edit-message` - Edit a message
- `react-to-message` - Add emoji reaction to message
- `initiate-call` - Start video/voice call
- `accept-call` - Accept incoming call
- `reject-call` - Reject incoming call
- `end-call` - End active call

**User Status:**
- `user-online` - Broadcast user is online
- `user-offline` - Broadcast user is offline

### Frontend Components

#### 1. Chat Context (`client/src/contexts/ChatContext.jsx`)
Manages chat state and provides hooks for chat operations:

**State Management:**
- `conversations` - List of all conversations
- `currentConversation` - Currently selected conversation
- `messages` - Messages in current conversation
- `typingUsers` - Users currently typing
- `onlineUsers` - Set of online users
- `unreadCount` - Total unread messages
- `loading` - Loading state
- `error` - Error messages

**Methods:**
- `fetchConversations()` - Load all conversations
- `fetchMessages(conversationId)` - Load messages for a conversation
- `createConversation(participantIds, subject)` - Create new conversation
- `sendMessage(content)` - Send a message
- `sendTypingIndicator()` - Notify others that user is typing
- `markMessageAsRead(messageId)` - Mark single message as read
- `markConversationAsRead(conversationId)` - Mark all messages as read
- `deleteMessage(messageId)` - Delete a message
- `editMessage(messageId, newContent)` - Edit a message
- `reactToMessage(messageId, reaction)` - Add reaction to message
- `archiveConversation(conversationId)` - Archive a conversation
- `isUserOnline(userId)` - Check if user is online

#### 2. Chat Components

**ConversationList.jsx**
- Displays list of all conversations
- Shows unread message count
- Search functionality
- Online status indicator
- Archive button for each conversation
- Last message preview

**MessageDisplay.jsx**
- Shows all messages in current conversation
- Auto-scrolls to latest message
- Displays sender name and timestamp
- Shows read receipts (✓✓ for read messages)
- Displays message reactions
- Delete and edit buttons for own messages
- Reaction button for all messages

**MessageInput.jsx**
- Text input for composing messages
- Typing indicator display
- Send button (disabled when empty)
- Attachment button (placeholder)
- Emoji button (placeholder)
- Character counter
- Keyboard shortcut (Enter to send, Shift+Enter for new line)

**Chat.jsx**
- Main chat page component
- Combines conversation list and message display
- Chat header with user info and online status
- Action buttons (voice call, video call, info)
- New conversation modal

## Features

### 1. Real-Time Messaging
- Instant message delivery via Socket.io
- Messages persist in MongoDB
- Message history available on reconnection

### 2. Typing Indicators
- Shows when other user is typing
- Auto-clears after 3 seconds of inactivity
- Multiple users can be typing simultaneously

### 3. Read Receipts
- Single checkmark (✓) for sent message
- Double checkmark (✓✓) for read message
- Read timestamp recorded in database

### 4. Conversation Management
- Create new conversations with any user
- Search conversations by participant name or subject
- Archive conversations (hide without deleting)
- Last message preview in conversation list
- Unread message counter

### 5. Message Operations
- Delete messages (sender only)
- Edit messages (sender only)
- React to messages with emojis
- Message timestamps
- Edit indicator for modified messages

### 6. User Status
- Online/offline status indicator
- Real-time status updates
- Green dot indicator for online users

### 7. Notification Integration
- New message notifications
- Typing notifications
- Read receipt notifications
- All notifications appear in NotificationCenter

## Usage

### For Users

#### Starting a Conversation
1. Click "Chat" in the sidebar
2. Click "Start New Conversation" button
3. Search for and select the recipient
4. Click "Start Conversation"

#### Sending Messages
1. Select a conversation from the list
2. Type your message in the input field
3. Press Enter or click Send button
4. Message appears immediately with "sent" status

#### Typing Indicator
- When you start typing, other user sees "User is typing..."
- Indicator automatically clears after 3 seconds

#### Read Receipts
- Your messages show ✓ when sent
- Messages show ✓✓ when recipient reads them

#### Message Actions
- Hover over your message to see Delete and Edit buttons
- Click reaction button to add emoji reactions
- Archive conversation by clicking archive icon

### For Developers

#### Accessing Chat Context
```javascript
import { useChat } from '../contexts/ChatContext';

function MyComponent() {
  const {
    conversations,
    currentConversation,
    messages,
    sendMessage,
    typingUsers,
    onlineUsers,
  } = useChat();

  // Use chat functions and state
}
```

#### Sending a Message
```javascript
const { sendMessage } = useChat();

sendMessage('Hello, this is my message!');
```

#### Listening to Typing
```javascript
const { typingUsers } = useChat();

const typingUsersList = Object.values(typingUsers);
// Display: "John is typing..."
```

#### Checking User Online Status
```javascript
const { isUserOnline } = useChat();

if (isUserOnline(userId)) {
  // User is online
}
```

## Database Models

### Conversation Model
```javascript
{
  _id: ObjectId,
  participantIds: [ObjectId], // User IDs
  subject: String,
  conversationType: String, // 'direct' or 'group'
  lastMessage: ObjectId, // Reference to Message
  lastMessageAt: Date,
  messageCount: Number,
  isArchived: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId,
  receiverId: ObjectId,
  content: String,
  messageType: String, // 'text', 'file', 'location'
  fileUrl: String, // For file messages
  fileSize: Number,
  latitude: Number, // For location messages
  longitude: Number,
  isRead: Boolean,
  readAt: Date,
  reactions: Object, // { userId: 'emoji' }
  edited: Boolean,
  editedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Socket.io Events Reference

### Client to Server Events
```javascript
// Join chat
socket.emit('chat-user-join', userId);

// Send message
socket.emit('send-message', {
  conversationId,
  senderId,
  receiverId,
  senderName,
  content
});

// Typing indicator
socket.emit('typing', {
  conversationId,
  senderId,
  senderName,
  receiverId
});

// Stop typing
socket.emit('stop-typing', {
  conversationId,
  senderId,
  receiverId
});

// Read receipt
socket.emit('message-read', {
  messageId,
  conversationId,
  senderId,
  readerId
});

// Join conversation room
socket.emit('join-conversation', {
  conversationId,
  userId
});

// Leave conversation room
socket.emit('leave-conversation', {
  conversationId,
  userId
});
```

### Server to Client Events
```javascript
// Receive message
socket.on('receive-message', (message) => {
  // Handle incoming message
});

// Message sent confirmation
socket.on('message-sent', (message) => {
  // Handle sent confirmation
});

// User typing
socket.on('user-typing', (data) => {
  // Show typing indicator
});

// User stopped typing
socket.on('user-stopped-typing', (data) => {
  // Hide typing indicator
});

// Message read receipt
socket.on('message-read-receipt', (data) => {
  // Update message status to read
});

// User online
socket.on('user-online', (data) => {
  // Update user status
});

// User offline
socket.on('user-offline', (data) => {
  // Update user status
});

// Message deleted
socket.on('message-deleted', (data) => {
  // Remove message from display
});

// Message edited
socket.on('message-edited', (data) => {
  // Update message content
});

// Message reaction
socket.on('message-reaction', (data) => {
  // Add reaction to message
});
```

## Testing the Chat Feature

### 1. Start Backend Server
```bash
cd backend
npm run dev
```

### 2. Start Frontend Server
Frontend should already be running on port 3000

### 3. Test Chat Flow
1. Open browser to http://localhost:3000
2. Login as owner or tenant
3. Click "Chat" in sidebar
4. Create new conversation
5. Send messages
6. Watch typing indicators
7. Check read receipts

### 4. Test Real-Time Features
- Open two browser windows with different users
- Send messages between them
- Watch typing indicators in real-time
- Verify read receipts update instantly

### 5. Test Offline Behavior
- Disconnect internet (DevTools Network tab)
- Try to send message (should queue)
- Reconnect internet
- Messages should sync automatically

## Performance Considerations

### Scalability
- Socket.io rooms for efficient message broadcasting
- Indexed database queries for fast conversation lookup
- Message pagination for large conversations
- Unread count cached in memory

### Optimization Tips
1. Implement message pagination (load older messages on scroll)
2. Add message search functionality
3. Implement conversation archiving for cleanup
4. Use Redis for Socket.io adapter in production
5. Add rate limiting for message sending

## Security Considerations

### Authentication
- All chat routes require JWT authentication
- Socket.io connections validated on join
- User can only access their own conversations

### Authorization
- Users can only see conversations they're part of
- Users can only delete/edit their own messages
- Receiver validation on message read

### Data Protection
- Messages encrypted in transit (HTTPS/WSS)
- Sensitive data not logged
- Rate limiting on message sending
- Input validation on all endpoints

## Future Enhancements

1. **Group Conversations** - Support multiple participants
2. **File Sharing** - Upload and share documents
3. **Voice/Video Calls** - Integrate WebRTC
4. **Message Search** - Full-text search across messages
5. **Conversation Pinning** - Pin important conversations
6. **Message Threads** - Reply to specific messages
7. **Rich Text Editor** - Format messages with bold, italic, etc.
8. **Message Forwarding** - Forward messages to other conversations
9. **Read-Only Mode** - Archive conversations as read-only
10. **Notification Preferences** - User-configurable notification settings

## Troubleshooting

### Messages Not Sending
- Check backend is running
- Verify Socket.io connection in browser console
- Check network tab for failed requests
- Verify user is authenticated

### Typing Indicator Not Showing
- Check Socket.io connection status
- Verify `sendTypingIndicator()` is called
- Check browser console for errors
- Verify receiver is in same conversation

### Read Receipts Not Updating
- Ensure message is marked as read in database
- Check Socket.io event is emitted
- Verify receiver user ID is correct
- Check message read status in database

### Conversations Not Loading
- Verify API endpoint is working
- Check authentication token is valid
- Verify user has conversations in database
- Check browser console for errors

## Support

For issues or questions about the chat feature:
1. Check browser console for error messages
2. Review backend logs for server errors
3. Verify Socket.io connection status
4. Check network tab for failed requests
5. Review this documentation for configuration details

---

**Last Updated**: March 26, 2026
**Status**: Production Ready
**Version**: 1.0.0
