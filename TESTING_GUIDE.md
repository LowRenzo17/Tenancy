# Tenancy Slate - Testing & Integration Guide

## Project Status

The Tenancy Slate application has been successfully converted from TypeScript to JavaScript and integrated with Socket.io for real-time notifications.

## Completed Conversions

### Frontend Conversion
- ✅ Removed `App.tsx` - replaced with `App.jsx`
- ✅ Converted `main.tsx` to `main.jsx`
- ✅ Updated `index.html` to reference `main.jsx`
- ✅ Removed unnecessary TypeScript files
- ✅ All pages remain functional with JSX

### Context Providers Integration
- ✅ **AuthContext**: Manages user authentication and login state
- ✅ **DataContext**: Manages application data (properties, tenants, maintenance, payments)
- ✅ **SocketContext**: Manages real-time Socket.io connections and events

### Socket.io Implementation

#### Backend (Express Server)
- Socket.io server initialized on port 5000
- CORS configured for frontend connection
- Event handlers for all features:
  - Property management events
  - Tenant management events
  - Maintenance request events
  - Payment events
  - Message and conversation events
  - Notification events
  - Analytics update events

#### Frontend (React Client)
- Socket.io client connects to backend
- Real-time event listeners for all features
- Notification Center component displays events
- Connection status indicator
- Auto-reconnection with exponential backoff

## Testing the Application

### 1. Start the Backend Server

```bash
cd /home/ubuntu/tenancy-slate/backend
npm run dev
```

Expected output:
```
Server running on port 5000
Socket.io server initialized
```

### 2. Start the Frontend Server

The frontend is already running on port 3000. If you need to restart:

```bash
cd /home/ubuntu/tenancy-slate/client
npm run dev
```

### 3. Test Authentication Flow

1. Open http://localhost:3000 in your browser
2. You should see the login page with:
   - Owner Login tab
   - Tenant Login tab
   - Email and password fields
   - "Remember this device" checkbox
   - Sign In button

3. Test signup by clicking the signup link
4. Create an account with:
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPassword123
   - Account Type: Owner or Tenant

### 4. Test Real-time Notifications

After logging in, the notification system should be active:

1. **Connection Status**: Bottom-right corner shows "Connected" (green) or "Disconnected" (red)
2. **Test Events**: Open browser console and trigger events:

```javascript
// Get socket from context
const socket = document.querySelector('[data-socket]');

// Emit a test property created event
socket.emit('property-created', {
  name: 'Test Property',
  location: 'Downtown',
  monthlyRent: 1500
});
```

### 5. Test Socket.io Events

#### Property Events
```javascript
// Create property
socket.emit('property-created', {
  name: 'New Property',
  location: 'Downtown',
  monthlyRent: 1500
});

// Update property
socket.emit('property-updated', {
  id: 'property-123',
  name: 'Updated Property'
});

// Delete property
socket.emit('property-deleted', {
  id: 'property-123',
  name: 'Deleted Property'
});
```

#### Tenant Events
```javascript
// Create tenant
socket.emit('tenant-created', {
  fullName: 'John Doe',
  email: 'john@example.com',
  monthlyRent: 1500
});

// Update tenant
socket.emit('tenant-updated', {
  id: 'tenant-123',
  fullName: 'Jane Doe'
});

// Delete tenant
socket.emit('tenant-deleted', {
  id: 'tenant-123',
  fullName: 'Jane Doe'
});
```

#### Maintenance Events
```javascript
// Create maintenance request
socket.emit('maintenance-created', {
  title: 'Leaky faucet',
  description: 'Kitchen faucet is leaking',
  priority: 'high'
});

// Update maintenance
socket.emit('maintenance-updated', {
  id: 'maintenance-123',
  status: 'in-progress'
});

// Complete maintenance
socket.emit('maintenance-completed', {
  id: 'maintenance-123',
  actualCost: 150
});

// Delete maintenance
socket.emit('maintenance-deleted', {
  id: 'maintenance-123'
});
```

#### Payment Events
```javascript
// Create payment
socket.emit('payment-created', {
  tenantId: 'tenant-123',
  amount: 1500,
  month: '2024-03-01'
});

// Update payment
socket.emit('payment-updated', {
  id: 'payment-123',
  status: 'paid'
});

// Payment received
socket.emit('payment-received', {
  id: 'payment-123',
  amount: 1500,
  tenantName: 'John Doe'
});

// Payment overdue
socket.emit('payment-overdue', {
  id: 'payment-123',
  amount: 1500,
  tenantName: 'John Doe'
});
```

#### Message Events
```javascript
// Send message
socket.emit('message-sent', {
  conversationId: 'conv-123',
  receiverId: 'user-456',
  senderName: 'Admin',
  content: 'Hello, how are you?'
});

// Mark message as read
socket.emit('message-read', {
  messageId: 'msg-789'
});

// Create conversation
socket.emit('conversation-created', {
  participantIds: ['user-123', 'user-456'],
  subject: 'Rent Discussion'
});
```

### 6. Monitor Notifications

1. Notifications appear in the bottom-right corner
2. Each notification shows:
   - Title
   - Message
   - Timestamp
   - Close button (X)
3. Notifications auto-dismiss after 5 seconds
4. Connection status indicator shows real-time connection state

### 7. Test Disconnection/Reconnection

1. Open browser DevTools (F12)
2. Go to Network tab
3. Throttle network or simulate offline mode
4. Watch the connection status change to "Disconnected"
5. Restore connection
6. Socket should automatically reconnect with exponential backoff

## Browser Console Testing

Open browser console (F12) and check for:

1. **Connection logs**:
   ```
   Socket.io connected
   User joined room user-{userId}
   ```

2. **Event logs**:
   ```
   Notification: Property Created - New property: Test Property
   Notification: Tenant Added - New tenant: John Doe
   ```

3. **Error logs**: Should be minimal if everything is working

## API Integration Testing

### Test Backend API Endpoints

1. **Authentication**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "fullName": "Test User",
       "email": "test@example.com",
       "password": "TestPassword123",
       "accountType": "owner"
     }'
   ```

2. **Get Properties**:
   ```bash
   curl -X GET http://localhost:5000/api/properties \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Create Property**:
   ```bash
   curl -X POST http://localhost:5000/api/properties \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Property",
       "location": "Downtown",
       "monthlyRent": 1500
     }'
   ```

## Troubleshooting

### Socket.io Connection Issues

**Problem**: Connection status shows "Disconnected"

**Solutions**:
1. Verify backend is running: `curl http://localhost:5000`
2. Check CORS configuration in backend
3. Verify `VITE_API_URL` in frontend `.env`
4. Check browser console for connection errors

### Authentication Issues

**Problem**: Login fails or redirects to login page

**Solutions**:
1. Verify backend is running
2. Check API endpoint in `lib/api.js`
3. Verify JWT secret in backend `.env`
4. Check browser console for error messages

### Notification Not Appearing

**Problem**: Events emitted but notifications don't appear

**Solutions**:
1. Check browser console for Socket.io connection
2. Verify NotificationCenter component is rendered
3. Check SocketContext is properly initialized
4. Verify event names match between backend and frontend

## Performance Testing

### Load Testing Socket.io

Test with multiple simultaneous events:

```javascript
// Send 100 property created events
for (let i = 0; i < 100; i++) {
  socket.emit('property-created', {
    name: `Property ${i}`,
    location: 'Downtown',
    monthlyRent: 1500
  });
}
```

Monitor:
- Browser memory usage
- CPU usage
- Network traffic
- Notification queue length (max 50 notifications)

## Deployment Checklist

Before deploying to production:

- [ ] Backend environment variables configured
- [ ] MongoDB connection verified
- [ ] Frontend API URL points to production backend
- [ ] Socket.io CORS configured for production domain
- [ ] SSL/TLS certificates installed
- [ ] Error logging configured
- [ ] Database backups automated
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Load testing completed

## Next Steps

1. **Connect to MongoDB**: Update `MONGODB_URI` in backend `.env`
2. **Test with Real Data**: Create properties, tenants, and maintenance requests
3. **Implement Error Handling**: Add proper error messages and recovery
4. **Add Loading States**: Show spinners during API calls
5. **Implement Pagination**: For large datasets
6. **Add Search & Filtering**: For properties, tenants, and maintenance
7. **Set Up Monitoring**: Track application performance and errors
8. **Configure Email Notifications**: Send emails for important events
9. **Add User Preferences**: Allow users to customize notifications
10. **Implement Analytics**: Track user behavior and system performance

## Support

For issues or questions:
1. Check browser console for error messages
2. Review backend logs for server errors
3. Verify all environment variables are set
4. Check network tab in DevTools for failed requests
5. Review Socket.io connection status

---

**Last Updated**: March 26, 2026
**Status**: Ready for Testing
