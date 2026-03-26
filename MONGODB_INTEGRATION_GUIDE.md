# MongoDB Integration Guide for Tenancy Slate Chat

## Overview

This guide explains how to set up and test MongoDB integration for the Tenancy Slate chat feature. The chat system now persists all messages, conversations, and metadata to MongoDB for reliable message history and data integrity.

## Prerequisites

- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)
- Node.js 14+ and npm/pnpm
- Backend running on port 5000
- Frontend running on port 3000

## Setup Instructions

### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account or log in
3. Create a new project
4. Click "Create a Deployment" and select "Free" tier
5. Choose your cloud provider and region
6. Wait for cluster to be created (usually 5-10 minutes)

### 2. Configure Database Access

1. In MongoDB Atlas, go to "Database Access"
2. Click "Add New Database User"
3. Create a username and password
4. Set privileges to "Atlas admin"
5. Click "Add User"

### 3. Get Connection String

1. In MongoDB Atlas, go to "Clusters"
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<username>` with your database username

### 4. Configure Backend Environment

Update `/home/ubuntu/tenancy-slate/backend/.env`:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/tenancy-slate?retryWrites=true&w=majority

# Rest of configuration...
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 5. Verify Connection

Start the backend server:

```bash
cd /home/ubuntu/tenancy-slate/backend
npm run dev
```

You should see in the logs:
```
MongoDB Connected: ac-xxxxx.xxxxx.mongodb.net
```

## Database Schema

### Conversation Schema

```javascript
{
  _id: ObjectId,
  participantIds: [ObjectId],      // User IDs
  propertyId: ObjectId,             // Optional property reference
  tenantId: ObjectId,               // Optional tenant reference
  ownerId: ObjectId,                // Required owner ID
  subject: String,                  // Optional conversation subject
  conversationType: String,         // 'direct', 'group', 'broadcast'
  lastMessage: ObjectId,            // Reference to last message
  lastMessageAt: Date,              // Timestamp of last message
  messageCount: Number,             // Total messages in conversation
  isArchived: Boolean,              // Archive status
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema

```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,         // Reference to conversation
  senderId: ObjectId,               // Sender user ID
  receiverId: ObjectId,             // Receiver user ID
  content: String,                  // Message content
  messageType: String,              // 'text', 'reminder', 'maintenance', etc.
  attachments: [{                   // Optional file attachments
    name: String,
    url: String,
    type: String,
    uploadedAt: Date
  }],
  isRead: Boolean,                  // Read status
  readAt: Date,                     // When message was read
  priority: String,                 // 'low', 'normal', 'high'
  reactions: Object,                // { userId: 'emoji' }
  edited: Boolean,                  // Whether message was edited
  editedAt: Date,                   // When message was edited
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Conversation Endpoints

**Get all conversations for current user**
```
GET /api/chat/conversations
Authorization: Bearer <token>
```

**Get specific conversation with messages**
```
GET /api/chat/conversations/:conversationId
Authorization: Bearer <token>
```

**Create new conversation**
```
POST /api/chat/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "participantIds": ["userId1", "userId2"],
  "subject": "Property Discussion"
}
```

**Get paginated messages**
```
GET /api/chat/conversations/:conversationId/messages?page=1&limit=50
Authorization: Bearer <token>
```

**Search messages in conversation**
```
GET /api/chat/conversations/:conversationId/search?query=maintenance
Authorization: Bearer <token>
```

### Message Endpoints

**Send message**
```
POST /api/chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "convId",
  "receiverId": "userId",
  "content": "Hello, this is a message"
}
```

**Mark message as read**
```
PUT /api/chat/messages/:messageId/read
Authorization: Bearer <token>
```

**Mark conversation as read**
```
PUT /api/chat/conversations/:conversationId/read
Authorization: Bearer <token>
```

**Edit message**
```
PUT /api/chat/messages/:messageId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated message content"
}
```

**Delete message**
```
DELETE /api/chat/messages/:messageId
Authorization: Bearer <token>
```

**Add reaction to message**
```
POST /api/chat/messages/:messageId/reactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "reaction": "👍"
}
```

**Archive conversation**
```
PUT /api/chat/conversations/:conversationId/archive
Authorization: Bearer <token>
```

## Socket.io Events

### Client to Server

**Join chat system**
```javascript
socket.emit('chat-user-join', userId);
```

**Send message**
```javascript
socket.emit('send-message', {
  conversationId: 'convId',
  senderId: 'userId',
  receiverId: 'recipientId',
  senderName: 'John Doe',
  content: 'Hello!'
});
```

**Typing indicator**
```javascript
socket.emit('typing', {
  conversationId: 'convId',
  senderId: 'userId',
  senderName: 'John Doe',
  receiverId: 'recipientId'
});
```

**Mark message as read**
```javascript
socket.emit('message-read', {
  messageId: 'msgId',
  conversationId: 'convId',
  senderId: 'senderId',
  readerId: 'userId'
});
```

### Server to Client

**Receive message**
```javascript
socket.on('receive-message', (message) => {
  // message contains: id, conversationId, senderId, senderName, content, timestamp, isRead
});
```

**Message sent confirmation**
```javascript
socket.on('message-sent', (message) => {
  // Confirmation that message was sent and saved to MongoDB
});
```

**Message read receipt**
```javascript
socket.on('message-read-receipt', (data) => {
  // data contains: messageId, conversationId, readAt
});
```

**User typing**
```javascript
socket.on('user-typing', (data) => {
  // data contains: conversationId, senderId, senderName, timestamp
});
```

**User stopped typing**
```javascript
socket.on('user-stopped-typing', (data) => {
  // data contains: conversationId, senderId
});
```

**Message deleted**
```javascript
socket.on('message-deleted', (data) => {
  // data contains: messageId, conversationId
});
```

**Message edited**
```javascript
socket.on('message-edited', (data) => {
  // data contains: messageId, conversationId, content, editedAt
});
```

**Message reaction**
```javascript
socket.on('message-reaction', (data) => {
  // data contains: messageId, conversationId, reactions
});
```

## Testing the Integration

### 1. Manual Testing

1. Start backend server:
   ```bash
   cd /home/ubuntu/tenancy-slate/backend
   npm run dev
   ```

2. Start frontend server:
   ```bash
   cd /home/ubuntu/tenancy-slate
   npm run dev
   ```

3. Open browser to http://localhost:3000

4. Login with test account

5. Navigate to Chat section

6. Create a conversation

7. Send messages and verify they appear in MongoDB

### 2. Verify MongoDB Persistence

1. Go to MongoDB Atlas
2. Click "Collections" on your cluster
3. Select "tenancy-slate" database
4. View "messages" and "conversations" collections
5. Verify documents are being created

### 3. Test Message History

1. Send several messages in a conversation
2. Refresh the browser
3. Go back to Chat
4. Select the same conversation
5. Verify all previous messages are loaded from MongoDB

### 4. Test Pagination

1. Send 100+ messages in a conversation
2. Make API request:
   ```bash
   curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/chat/conversations/<convId>/messages?page=1&limit=50
   ```
3. Verify pagination metadata in response

### 5. Test Search

1. Send messages with specific keywords
2. Make API request:
   ```bash
   curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/chat/conversations/<convId>/search?query=maintenance
   ```
3. Verify search results are returned

## Monitoring and Debugging

### Check MongoDB Connection

```bash
# In backend logs, look for:
# "MongoDB Connected: ac-xxxxx.xxxxx.mongodb.net"
```

### View Database Metrics

1. Go to MongoDB Atlas
2. Click "Metrics" on your cluster
3. Monitor:
   - Connections
   - Operations
   - Network I/O
   - Storage

### Enable Debug Logging

Add to backend `.env`:
```env
DEBUG=mongoose:*
```

Then restart backend server to see detailed MongoDB queries.

### Common Issues

**Connection refused**
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas (should include your IP)
- Verify database user credentials

**Messages not persisting**
- Check backend logs for errors
- Verify Socket.io handlers are saving to MongoDB
- Check MongoDB collections exist

**Slow queries**
- Add database indexes
- Implement message pagination
- Archive old conversations

## Performance Optimization

### 1. Add Database Indexes

```javascript
// Message indexes
db.messages.createIndex({ conversationId: 1, createdAt: -1 });
db.messages.createIndex({ senderId: 1 });
db.messages.createIndex({ receiverId: 1, isRead: 1 });

// Conversation indexes
db.conversations.createIndex({ participantIds: 1, lastMessageAt: -1 });
db.conversations.createIndex({ ownerId: 1 });
```

### 2. Message Pagination

Always use pagination for large conversations:
```javascript
// Good - paginated
GET /api/chat/conversations/:convId/messages?page=1&limit=50

// Bad - all messages at once
GET /api/chat/conversations/:convId
```

### 3. Archive Old Conversations

Periodically archive conversations to reduce active data:
```javascript
PUT /api/chat/conversations/:conversationId/archive
```

## Backup and Recovery

### Automatic Backups

MongoDB Atlas provides:
- Daily automated backups (free tier)
- Point-in-time recovery (paid tier)
- Backup retention for 7 days

### Manual Backup

```bash
mongodump --uri="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/tenancy-slate"
```

### Restore from Backup

```bash
mongorestore --uri="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/tenancy-slate" ./dump/tenancy-slate
```

## Security Best Practices

1. **Never commit `.env` file** with credentials to Git
2. **Use strong passwords** for database users
3. **Enable IP whitelist** in MongoDB Atlas
4. **Rotate credentials** regularly
5. **Use SSL/TLS** for all connections (enabled by default)
6. **Implement rate limiting** on API endpoints
7. **Validate all inputs** on backend
8. **Use JWT tokens** for authentication

## Troubleshooting

### Messages not appearing after refresh

**Problem**: Messages are sent via Socket.io but don't appear after page refresh

**Solution**: 
- Verify Socket.io handlers are calling MongoDB save
- Check backend logs for save errors
- Verify MongoDB connection is active

### Slow message loading

**Problem**: Loading messages takes a long time

**Solution**:
- Implement pagination
- Add database indexes
- Check MongoDB query performance
- Consider archiving old conversations

### Connection timeouts

**Problem**: Frequent connection timeouts to MongoDB

**Solution**:
- Increase connection pool size
- Check network latency
- Verify MongoDB Atlas cluster is running
- Check firewall rules

## Support and Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Socket.io Documentation](https://socket.io/docs/)

---

**Last Updated**: March 26, 2026
**Status**: Production Ready
**Version**: 1.0.0
