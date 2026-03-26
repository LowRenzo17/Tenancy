# Tenancy Slate Backend API

A comprehensive Node.js + Express + MongoDB backend for the Tenancy Slate property management platform.

## Features

- **User Authentication**: Signup, login, password reset, and 2FA support
- **Property Management**: CRUD operations for properties with occupancy tracking
- **Tenant Management**: Tenant assignment, rent status tracking, and payment history
- **Maintenance Tracking**: Request management with priority, status, and cost tracking
- **Payment Management**: Rent payment tracking with status and late fee management
- **Communication**: Messaging system between owners and tenants
- **Analytics**: Dashboard analytics, revenue reports, occupancy rates, and maintenance costs
- **Security**: JWT authentication, role-based access control, and device trust management

## Project Structure

```
backend/
├── config/
│   └── database.js           # MongoDB connection configuration
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── errorHandler.js      # Global error handling middleware
├── models/
│   ├── User.js              # User schema with 2FA and device trust
│   ├── Property.js          # Property schema
│   ├── Tenant.js            # Tenant schema
│   ├── Maintenance.js       # Maintenance request schema
│   ├── Payment.js           # Payment schema
│   ├── Message.js           # Message schema
│   └── Conversation.js      # Conversation schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── properties.js        # Property management routes
│   ├── tenants.js           # Tenant management routes
│   ├── maintenance.js       # Maintenance routes
│   ├── payments.js          # Payment routes
│   ├── messages.js          # Communication routes
│   └── analytics.js         # Analytics routes
├── utils/
│   ├── tokenUtils.js        # JWT and token generation utilities
│   └── emailUtils.js        # Email notification utilities
├── server.js                # Main Express server
├── package.json             # Dependencies
└── .env                     # Environment variables
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the following values:
     - `MONGODB_URI`: MongoDB connection string
     - `JWT_SECRET`: Secret key for JWT signing
     - `SMTP_*`: Email configuration for notifications

3. **Start the server:**
   ```bash
   npm start          # Production
   npm run dev        # Development with nodemon
   ```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Authentication (`/api/auth`)

- `POST /signup` - Register a new user
- `POST /login` - Authenticate user
- `POST /verify-2fa` - Verify 2FA code
- `POST /enable-2fa` - Enable two-factor authentication
- `POST /confirm-2fa` - Confirm 2FA setup
- `POST /disable-2fa` - Disable 2FA
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `GET /me` - Get current user profile
- `PUT /update-profile` - Update user profile
- `GET /login-history` - Get login history
- `GET /trusted-devices` - Get trusted devices
- `POST /add-trusted-device` - Add trusted device
- `DELETE /trusted-devices/:deviceId` - Remove trusted device

### Properties (`/api/properties`)

- `GET /` - Get all properties for owner
- `GET /:id` - Get single property
- `POST /` - Create new property
- `PUT /:id` - Update property
- `DELETE /:id` - Delete property
- `GET /:id/maintenance-history` - Get property maintenance history

### Tenants (`/api/tenants`)

- `GET /` - Get all tenants for owner
- `GET /:id` - Get single tenant
- `POST /` - Create new tenant
- `PUT /:id` - Update tenant
- `DELETE /:id` - Delete tenant
- `GET /:id/payment-history` - Get tenant payment history
- `PUT /:id/rent-status` - Update tenant rent status

### Maintenance (`/api/maintenance`)

- `GET /` - Get all maintenance requests
- `GET /:id` - Get single maintenance request
- `POST /` - Create new maintenance request
- `PUT /:id` - Update maintenance request
- `DELETE /:id` - Delete maintenance request
- `GET /property/:propertyId` - Get maintenance for property

### Payments (`/api/payments`)

- `GET /` - Get all payments
- `GET /:id` - Get single payment
- `POST /` - Create new payment
- `PUT /:id` - Update payment
- `DELETE /:id` - Delete payment
- `GET /tenant/:tenantId` - Get payments for tenant
- `GET /property/:propertyId` - Get payments for property

### Messages (`/api/messages`)

- `GET /conversations` - Get all conversations
- `GET /conversations/:conversationId` - Get single conversation
- `POST /conversations` - Create new conversation
- `GET /:conversationId` - Get messages in conversation
- `POST /` - Send message
- `PUT /:id` - Update message (mark as read)
- `DELETE /:id` - Delete message
- `PUT /conversation/:conversationId/archive` - Archive conversation

### Analytics (`/api/analytics`)

- `GET /dashboard` - Get dashboard analytics
- `GET /revenue` - Get revenue analytics
- `GET /occupancy` - Get occupancy analytics
- `GET /maintenance` - Get maintenance analytics
- `GET /tenant-rent-status` - Get tenant rent status
- `GET /property/:propertyId` - Get property-specific analytics

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained from the login endpoint and expire after 7 days by default.

## Role-Based Access Control

- **Owner**: Full access to property, tenant, maintenance, payment, and analytics endpoints
- **Tenant**: Limited access to own tenant profile, payment history, and maintenance requests

## Database Models

### User
- Full name, email, password (hashed)
- Account type (owner/tenant)
- 2FA settings and backup codes
- Trusted devices and login history
- Password reset token and expiration

### Property
- Owner reference
- Location and address details
- Property type and specifications
- Occupancy status and current tenant
- Lease dates and rent amount
- Utilities and amenities
- Maintenance history

### Tenant
- Owner and user references
- Contact information
- Assigned property
- Lease dates and rent amount
- Rent status (paid/pending/overdue)
- Payment history
- Maintenance requests
- Emergency contact information

### Maintenance
- Property and tenant references
- Title and description
- Category and priority
- Status tracking
- Dates (requested, start, completion)
- Cost estimation and actual costs
- Contractor information
- Attachments and notes

### Payment
- Tenant, property, and owner references
- Amount and total (with fees/discounts)
- Month and due date
- Payment date and status
- Payment method and transaction ID
- Late fees and discounts

### Message
- Conversation reference
- Sender and receiver references
- Content and message type
- Read status and timestamp
- Attachments and priority

### Conversation
- Participant IDs
- Property and tenant references
- Subject and conversation type
- Last message and timestamp
- Archive status

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `500`: Server error

## Security Features

- **Password Hashing**: Bcryptjs with salt rounds
- **JWT Authentication**: Token-based authentication
- **2FA Support**: TOTP-based two-factor authentication
- **Device Trust**: Device fingerprinting and trusted device management
- **Login History**: Track all login attempts and suspicious activity
- **Password Reset**: Secure token-based password reset with expiration
- **CORS**: Configured for frontend domain
- **Input Validation**: Express-validator for all inputs

## Email Notifications

The backend sends email notifications for:
- Password reset requests
- 2FA verification codes
- Rent payment reminders
- Maintenance request updates

Configure SMTP settings in `.env` to enable email functionality.

## Development

### Running Tests
```bash
npm test
```

### Code Style
The project follows standard JavaScript conventions. Use ESLint for linting:
```bash
npm run lint
```

### Database Seeding
To seed the database with sample data:
```bash
node scripts/seed.js
```

## Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Generate a strong `JWT_SECRET`
4. Configure SMTP for email notifications
5. Set appropriate CORS origins
6. Use HTTPS for all API endpoints
7. Enable rate limiting and request validation
8. Set up monitoring and logging

## License

ISC

## Support

For issues or questions, please contact the development team.
