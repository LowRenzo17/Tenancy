import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import { initializeSocket } from './utils/socketHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import tenantRoutes from './routes/tenants.js';
import maintenanceRoutes from './routes/maintenance.js';
import paymentRoutes from './routes/payments.js';
import messageRoutes from './routes/messages.js';
import analyticsRoutes from './routes/analytics.js';

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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);

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
