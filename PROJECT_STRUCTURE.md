# Tenancy Slate - Project Structure

## Overview

Tenancy Slate is now organized with a clear separation between frontend and backend, following a monorepo structure with workspaces.

## Directory Structure

```
tenancy-slate/
├── frontend/                          # React + Vite frontend application
│   ├── client/                        # React application source
│   │   ├── public/                    # Static assets
│   │   ├── src/
│   │   │   ├── components/            # Reusable React components
│   │   │   ├── contexts/              # React Context providers
│   │   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   │   ├── DataContext.jsx    # Application data state
│   │   │   │   ├── ChatContext.jsx    # Chat state management
│   │   │   │   └── SocketContext.jsx  # Socket.io connection
│   │   │   ├── pages/                 # Page components
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Properties.jsx
│   │   │   │   ├── Tenants.jsx
│   │   │   │   ├── Maintenance.jsx
│   │   │   │   ├── Payments.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   └── Chat.jsx
│   │   │   ├── lib/                   # Utility functions
│   │   │   │   └── api.js             # API client
│   │   │   ├── App.jsx                # Main app component
│   │   │   ├── main.jsx               # React entry point
│   │   │   └── index.css              # Global styles
│   │   └── index.html                 # HTML template
│   ├── vite.config.ts                 # Vite configuration
│   ├── tsconfig.json                  # TypeScript config
│   ├── components.json                # shadcn/ui config
│   └── package.json                   # Frontend dependencies
│
├── backend/                           # Express + MongoDB backend
│   ├── server.js                      # Express server entry point
│   ├── config/
│   │   └── database.js                # MongoDB connection
│   ├── models/                        # Mongoose schemas
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── Tenant.js
│   │   ├── Maintenance.js
│   │   ├── Payment.js
│   │   ├── Message.js
│   │   └── Conversation.js
│   ├── routes/                        # API routes
│   │   ├── auth.js                    # Authentication endpoints
│   │   ├── properties.js              # Property management
│   │   ├── tenants.js                 # Tenant management
│   │   ├── maintenance.js             # Maintenance requests
│   │   ├── payments.js                # Payment tracking
│   │   ├── messages.js                # Messaging endpoints
│   │   ├── chat.js                    # Chat endpoints
│   │   └── analytics.js               # Analytics endpoints
│   ├── middleware/
│   │   ├── auth.js                    # JWT authentication
│   │   └── errorHandler.js            # Error handling
│   ├── utils/
│   │   ├── tokenUtils.js              # JWT utilities
│   │   ├── emailUtils.js              # Email notifications
│   │   ├── socketHandler.js           # Socket.io handlers
│   │   └── chatSocketHandler.js       # Chat Socket.io handlers
│   ├── .env                           # Backend environment variables
│   ├── .env.example                   # Environment template
│   ├── package.json                   # Backend dependencies
│   └── README.md                      # Backend documentation
│
├── shared/                            # Shared utilities
│   └── const.ts                       # Shared constants
│
├── server/                            # Server placeholder
│   └── index.ts                       # Server entry point
│
├── patches/                           # pnpm patches
│   └── wouter@3.7.1.patch
│
├── package.json                       # Root package.json
├── pnpm-lock.yaml                     # Dependency lock file
├── tsconfig.json                      # Root TypeScript config
│
├── BACKEND_INTEGRATION.md             # Backend setup guide
├── CHAT_FEATURE_DOCUMENTATION.md      # Chat feature docs
├── MONGODB_INTEGRATION_GUIDE.md       # MongoDB setup guide
├── PROJECT_SUMMARY.md                 # Project overview
├── TESTING_GUIDE.md                   # Testing procedures
└── PROJECT_STRUCTURE.md               # This file
```

## Key Features

### Frontend (React + Vite)
- **Authentication**: Owner and Tenant login with JWT tokens
- **Dashboard**: Real-time analytics and metrics
- **Property Management**: CRUD operations for properties
- **Tenant Management**: Track tenants and assignments
- **Maintenance Tracking**: Request and manage maintenance
- **Payment Management**: Track rent payments and late fees
- **Real-time Chat**: Socket.io powered messaging between owners and tenants
- **Notifications**: Real-time notifications via Socket.io

### Backend (Express + MongoDB)
- **REST API**: 40+ endpoints for all features
- **Authentication**: JWT-based with 2FA support
- **Real-time Communication**: Socket.io for live updates
- **Message Persistence**: MongoDB storage for chat history
- **Database Models**: 7 MongoDB schemas for complete data management
- **Email Notifications**: Automated email alerts
- **Error Handling**: Comprehensive error middleware

## Development Workflow

### Running the Application

```bash
# Install dependencies
pnpm install

# Start frontend (from root)
pnpm dev

# Start backend (from backend folder)
cd backend
npm run dev

# Build frontend
pnpm build

# Start production server
pnpm start
```

### Frontend Development

```bash
cd frontend
pnpm dev          # Start Vite dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm check        # Type check with TypeScript
```

### Backend Development

```bash
cd backend
npm run dev       # Start with nodemon
npm run build     # Build for production
npm start         # Start production server
```

## Environment Configuration

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tenancy-slate
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/2fa/setup` - Setup 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA code
- `POST /api/auth/password-reset` - Request password reset

### Properties
- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Tenants
- `GET /api/tenants` - Get all tenants
- `POST /api/tenants` - Create tenant
- `GET /api/tenants/:id` - Get tenant details
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant

### Chat
- `GET /api/chat/conversations` - Get all conversations
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations/:id` - Get conversation
- `GET /api/chat/conversations/:id/messages` - Get paginated messages
- `POST /api/chat/messages` - Send message
- `PUT /api/chat/messages/:id` - Edit message
- `DELETE /api/chat/messages/:id` - Delete message

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/occupancy` - Occupancy rates
- `GET /api/analytics/maintenance` - Maintenance costs

## Socket.io Events

### Client to Server
- `chat-user-join` - User joins chat
- `send-message` - Send message
- `typing` - User typing indicator
- `message-read` - Mark message as read
- `delete-message` - Delete message

### Server to Client
- `receive-message` - New message received
- `user-typing` - User typing
- `message-read-receipt` - Message read confirmation
- `notification` - System notification

## Database Schemas

### User
```javascript
{
  email: String,
  password: String (hashed),
  fullName: String,
  role: 'owner' | 'tenant',
  phone: String,
  address: String,
  twoFactorEnabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Property
```javascript
{
  name: String,
  address: String,
  type: String,
  bedrooms: Number,
  bathrooms: Number,
  rentAmount: Number,
  occupancyStatus: String,
  ownerId: ObjectId,
  tenantId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  conversationId: ObjectId,
  senderId: ObjectId,
  receiverId: ObjectId,
  content: String,
  isRead: Boolean,
  readAt: Date,
  edited: Boolean,
  editedAt: Date,
  reactions: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Frontend
- Built with Vite for optimal performance
- Static files in `dist/public`
- Can be deployed to any static hosting (Vercel, Netlify, etc.)

### Backend
- Node.js Express server
- Requires MongoDB Atlas or self-hosted MongoDB
- Can be deployed to Heroku, Railway, Render, etc.

## Testing

See `TESTING_GUIDE.md` for comprehensive testing procedures.

## Documentation

- `BACKEND_INTEGRATION.md` - Backend setup and integration
- `CHAT_FEATURE_DOCUMENTATION.md` - Chat feature details
- `MONGODB_INTEGRATION_GUIDE.md` - MongoDB setup guide
- `PROJECT_SUMMARY.md` - Project overview
- `TESTING_GUIDE.md` - Testing procedures

## Next Steps

1. **Set up MongoDB Atlas** - Configure database connection
2. **Configure environment variables** - Update .env files
3. **Test API endpoints** - Verify backend functionality
4. **Test Socket.io** - Verify real-time communication
5. **Deploy frontend** - Push to production
6. **Deploy backend** - Push to production

---

**Last Updated**: March 26, 2026
**Version**: 1.0.0
**Status**: Production Ready
