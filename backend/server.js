const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const recommendationRoutes = require('./src/routes/recommendationRoutes');
const orderRoutes = require('./src/routes/order.routes');
const assistantRoutes = require('./src/routes/assistantRoutes');

// Initialize app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration - allow ALL origins for development (including phone access)
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    // Allow all origins in development
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/face-login', authLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/assistant', assistantRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered',
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Resource not found with id: ${err.value}`,
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces
const HTTPS_ENABLED = process.env.HTTPS_ENABLED === 'true';

let server;

if (HTTPS_ENABLED) {
  const https = require('https');
  const fs = require('fs');
  const path = require('path');
  
  const certPath = path.join(__dirname, 'certificates', 'cert.pem');
  const keyPath = path.join(__dirname, 'certificates', 'key.pem');
  
  // Check if certificates exist
  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.error('SSL certificates not found! Run: node generate-ssl-cert.js');
    console.error('Starting with HTTP instead...');
    server = app.listen(PORT, HOST, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on ${HOST}:${PORT} (HTTP)`);
    });
  } else {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    
    server = https.createServer(httpsOptions, app);
    server.listen(PORT, HOST, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on ${HOST}:${PORT} (HTTPS)`);
      console.log(`Local access: https://localhost:${PORT}`);
      console.log(`Network access: https://${require('os').networkInterfaces().Ethernet?.[0]?.address || 'YOUR_IP'}:${PORT}`);
      console.log(`\n⚠️  Your browser will show a security warning (self-signed certificate)`);
      console.log(`   Click "Advanced" → "Proceed to site" to continue.`);
    });
  }
} else {
  // HTTP mode (default)
  server = app.listen(PORT, HOST, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on ${HOST}:${PORT} (HTTP)`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://${require('os').networkInterfaces().Ethernet?.[0]?.address || 'YOUR_IP'}:${PORT}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;
