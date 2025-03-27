import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import scriptRoutes from './routes/script.js';
import { errorHandler } from './middleware/errorHandler.js';
import pool from './config/database.js';
import { logger } from './utils/logger.js';
import { networkInterfaces } from 'os';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Configure CORS to accept requests from any origin on the local network
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    
    // Allow requests from any origin in development
    return callback(null, true);
  },
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/script', scriptRoutes);

// Error handler
app.use(errorHandler);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    logger.info('Health check passed');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Get local IP addresses
const getLocalIpAddresses = () => {
  const interfaces = networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  
  return addresses;
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  const localIps = getLocalIpAddresses();
  
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API is accessible at http://localhost:${PORT}`);
  
  if (localIps.length > 0) {
    logger.info('For local network access, use any of these URLs:');
    localIps.forEach(ip => {
      logger.info(`http://${ip}:${PORT}`);
    });
  } else {
    logger.info('No network interfaces detected for local network access');
  }
});