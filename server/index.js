import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finveda';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FinVeda Lending & Microfinance Backend',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/settings', settingsRoutes);

// Fallback 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' does not exist`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    message: status === 500 && process.env.NODE_ENV === 'production'
      ? 'A server-side error occurred. Please try again later.'
      : message,
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`[Database] Connected to MongoDB at: ${MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(`[Server] FinVeda RBAC API server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[Database] Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

export default app;
