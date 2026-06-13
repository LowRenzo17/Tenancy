import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import { initializeSocket } from './utils/socketHandler.js';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import hpp from 'hpp';

// Global Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 requests per `window`
  message: { success: false, message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' }
});

// Global Rate Limiting for general API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 150, // Limit each IP to 150 requests per `window`
  message: { success: false, message: 'API rate limit exceeded. Please try again after 15 minutes.' }
});

// Import routes
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import tenantRoutes from './routes/tenants.js';
import maintenanceRoutes from './routes/maintenance.js';
import paymentRoutes from './routes/payments.js';
import messageRoutes from './routes/messages.js';
import analyticsRoutes from './routes/analytics.js';
import chatRoutes from './routes/chat.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = http.createServer(app);
const io = initializeSocket(httpServer);

// Make io accessible to routes
app.set('io', io);

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(mongoSanitize());
// Prevent XSS attacks
app.use(xss());
// Prevent HTTP Param Pollution
app.use(hpp());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/properties', apiLimiter, propertyRoutes);
app.use('/api/tenants', apiLimiter, tenantRoutes);
app.use('/api/maintenance', apiLimiter, maintenanceRoutes);
app.use('/api/payments', apiLimiter, paymentRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/chat', apiLimiter, chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server initialized`);
});
