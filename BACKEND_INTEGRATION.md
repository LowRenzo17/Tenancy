# Tenancy Slate Backend Integration Guide

This document provides a comprehensive guide for setting up and integrating the Node.js + Express + MongoDB backend with the React frontend.

## Project Structure

The project now has two main directories:

```
tenancy-slate/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── lib/
│   │   │   └── api.js     # API client utility
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx    # Authentication state management
│   │   │   └── DataContext.jsx    # Application data management
│   │   ├── pages/         # Page components
│   │   └── components/    # Reusable UI components
│   └── package.json
└── backend/               # Node.js + Express backend
    ├── config/
    │   └── database.js    # MongoDB connection
    ├── middleware/
    │   ├── auth.js        # JWT authentication
    │   └── errorHandler.js
    ├── models/            # Mongoose schemas
    ├── routes/            # API endpoints
    ├── utils/             # Helper utilities
    ├── server.js          # Express server
    ├── package.json
    └── .env               # Environment variables
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/tenancy-slate

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRE=7d

# Email (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend
FRONTEND_URL=http://localhost:3000

# 2FA
TOTP_WINDOW=2
```

### 3. Start MongoDB

Ensure MongoDB is running on your system:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 4. Start the Backend Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The backend will be available at `http://localhost:5000`.

## Frontend Integration

### 1. Configure API URL

The frontend uses the `VITE_API_URL` environment variable to connect to the backend. Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Update App.tsx

Wrap your app with the new context providers:

```tsx
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        {/* Your app content */}
      </DataProvider>
    </AuthProvider>
  );
}
```

### 3. Use API Client in Components

Components can now use the `useAuth` and `useData` hooks:

```jsx
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  const { properties, createProperty } = useData();

  // Use the hooks in your component
}
```

## API Client Usage

The `apiClient` utility provides methods for all backend endpoints:

### Authentication

```javascript
import apiClient from '@/lib/api';

// Signup
const response = await apiClient.signup(fullName, email, password, accountType);

// Login
const response = await apiClient.login(email, password);

// Verify 2FA
const response = await apiClient.verify2FA(code);

// Get current user
const response = await apiClient.getCurrentUser();
```

### Properties

```javascript
// Get all properties
const response = await apiClient.getProperties();

// Create property
const response = await apiClient.createProperty({
  name: 'Apartment 101',
  location: 'Downtown',
  monthlyRent: 1500,
  // ... other fields
});

// Update property
const response = await apiClient.updateProperty(propertyId, { name: 'New Name' });

// Delete property
const response = await apiClient.deleteProperty(propertyId);
```

### Tenants

```javascript
// Get all tenants
const response = await apiClient.getTenants();

// Create tenant
const response = await apiClient.createTenant({
  fullName: 'John Doe',
  email: 'john@example.com',
  assignedProperty: propertyId,
  monthlyRent: 1500,
  // ... other fields
});

// Update tenant
const response = await apiClient.updateTenant(tenantId, { fullName: 'Jane Doe' });

// Delete tenant
const response = await apiClient.deleteTenant(tenantId);
```

### Maintenance

```javascript
// Get all maintenance requests
const response = await apiClient.getMaintenance();

// Create maintenance request
const response = await apiClient.createMaintenanceRequest({
  title: 'Leaky faucet',
  description: 'Kitchen faucet is leaking',
  category: 'plumbing',
  propertyId: propertyId,
  // ... other fields
});

// Update maintenance request
const response = await apiClient.updateMaintenanceRequest(maintenanceId, {
  status: 'completed',
  actualCost: 150,
});

// Delete maintenance request
const response = await apiClient.deleteMaintenanceRequest(maintenanceId);
```

### Payments

```javascript
// Get all payments
const response = await apiClient.getPayments();

// Create payment
const response = await apiClient.createPayment({
  tenantId: tenantId,
  propertyId: propertyId,
  amount: 1500,
  month: new Date('2024-03-01'),
  dueDate: new Date('2024-03-05'),
  // ... other fields
});

// Update payment
const response = await apiClient.updatePayment(paymentId, {
  status: 'paid',
  paymentDate: new Date(),
});

// Delete payment
const response = await apiClient.deletePayment(paymentId);
```

### Analytics

```javascript
// Get dashboard analytics
const response = await apiClient.getDashboardAnalytics();

// Get revenue analytics
const response = await apiClient.getRevenueAnalytics(startDate, endDate);

// Get occupancy analytics
const response = await apiClient.getOccupancyAnalytics();

// Get maintenance analytics
const response = await apiClient.getMaintenanceAnalytics();

// Get property-specific analytics
const response = await apiClient.getPropertyAnalytics(propertyId);
```

## Running Both Servers

To run both frontend and backend simultaneously:

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

## Database Schema Overview

### User
- Authentication credentials and profile
- Two-factor authentication settings
- Trusted devices and login history
- Password reset tokens

### Property
- Property details and specifications
- Occupancy status and current tenant
- Lease information
- Maintenance history

### Tenant
- Tenant information and contact details
- Assigned property and lease dates
- Rent status and payment history
- Maintenance requests

### Maintenance
- Request details and priority
- Status tracking and dates
- Cost estimation and actual costs
- Contractor information

### Payment
- Rent payment tracking
- Payment status and method
- Transaction details
- Late fees and discounts

### Message & Conversation
- Direct and group messaging
- Conversation management
- Message read status
- Archive functionality

## Error Handling

The API returns standardized responses:

```json
{
  "success": true,
  "data": { /* response data */ }
}
```

Or on error:

```json
{
  "success": false,
  "message": "Error description"
}
```

Handle errors in components:

```jsx
try {
  const response = await apiClient.createProperty(data);
  if (response.success) {
    // Handle success
  }
} catch (error) {
  console.error('Error:', error.message);
  // Show error to user
}
```

## Security Considerations

1. **JWT Tokens**: Stored in localStorage and sent in Authorization header
2. **Password Hashing**: Bcryptjs with salt rounds on backend
3. **2FA Support**: TOTP-based two-factor authentication
4. **Device Trust**: Device fingerprinting and trusted device management
5. **CORS**: Configured for frontend domain
6. **Input Validation**: Express-validator on all endpoints

## Development Workflow

1. **Make API changes**: Update backend routes/models
2. **Restart backend**: `npm run dev` will auto-reload
3. **Update frontend**: Use new API methods in components
4. **Test integration**: Verify data flows correctly

## Deployment

### Backend Deployment

Deploy the backend to a Node.js hosting service (Heroku, Railway, Render, etc.):

1. Set environment variables on hosting platform
2. Configure MongoDB Atlas or self-hosted MongoDB
3. Deploy backend code
4. Update `VITE_API_URL` in frontend to point to deployed backend

### Frontend Deployment

Deploy the frontend to a static hosting service (Vercel, Netlify, etc.):

1. Build frontend: `npm run build`
2. Deploy `dist` folder
3. Ensure `VITE_API_URL` points to deployed backend

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify `.env` file is configured
- Check port 5000 is not in use

### API requests failing
- Verify backend is running on correct port
- Check `VITE_API_URL` is correct
- Verify CORS is configured for frontend domain
- Check browser console for error messages

### Authentication issues
- Verify JWT_SECRET is set
- Check token is being stored in localStorage
- Verify Authorization header is being sent

### Database connection issues
- Verify MongoDB is running
- Check MONGODB_URI is correct
- Ensure database user credentials are correct

## Next Steps

1. Test all API endpoints with the frontend
2. Implement error handling and user feedback
3. Add loading states and spinners
4. Set up proper logging and monitoring
5. Configure email notifications
6. Set up automated backups for database
7. Implement rate limiting and security headers
8. Add comprehensive testing suite

## Support

For issues or questions about the backend integration, refer to the backend README or contact the development team.
