// server/server.js - Optimized for Railway + Render
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
const { testConnection, sequelize } = require('./config/database');

// Initialize express app
const app = express();

// ✅ Configuration Constants
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ✅ Get client URL based on environment
const getClientUrl = () => {
  if (NODE_ENV === 'production') {
    return process.env.CLIENT_URL || 'https://afyalink-frontend.onrender.com';
  }
  return process.env.CLIENT_URL || 'http://localhost:3000';
};

const CLIENT_URL = getClientUrl();

// ✅ Trust proxy for Render
app.set('trust proxy', 1);

// ------------------------------------
// Security & Middleware Configuration
// ------------------------------------

// Simplified Helmet for production
app.use(helmet({
  contentSecurityPolicy: false, // Disable for simplicity in production
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 100 : 500,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for production
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// ------------------------------------
// Request Logging Middleware
// ------------------------------------
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ------------------------------------
// API Routes
// ------------------------------------
const apiRoutes = [
  { path: '/api/auth', route: require('./routes/auth') },
  { path: '/api/health-services', route: require('./routes/healthServices') },
  { path: '/api/preventive-care', route: require('./routes/preventiveCare') },
  { path: '/api/mental-health', route: require('./routes/mentalHealth') },
  { path: '/api/education', route: require('./routes/education') },
  { path: '/api/emergency', route: require('./routes/emergency') },
  { path: '/api/admin', route: require('./routes/admin') },
  { path: '/api/chat', route: require('./routes/chatRoutes') }
];

// Register all routes
apiRoutes.forEach(({ path, route }) => {
  app.use(path, route);
  console.log(`✅ Registered route: ${path}`);
});

// ------------------------------------
// Health & Diagnostic Endpoints
// ------------------------------------

/**
 * @route GET /api/health
 * @description Health check endpoint
 */
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    database: 'Checking...',
    uptime: process.uptime(),
    clientUrl: CLIENT_URL
  };

  try {
    await sequelize.authenticate();
    healthCheck.database = 'Connected';
    
    // Simple table check without complex error handling
    try {
      const userCount = await sequelize.models.User?.count() || 0;
      healthCheck.userCount = userCount;
    } catch (tableError) {
      healthCheck.tables = 'Initializing';
    }
    
    res.json(healthCheck);
  } catch (error) {
    healthCheck.status = 'Degraded';
    healthCheck.database = 'Disconnected';
    healthCheck.error = error.message;
    
    res.status(503).json(healthCheck);
  }
});

/**
 * @route GET /api/debug/db
 * @description Database debugging information
 */
app.get('/api/debug/db', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    const [dbInfo] = await sequelize.query('SELECT DATABASE() as db, USER() as user');
    const [tables] = await sequelize.query('SHOW TABLES');
    
    res.json({
      status: 'Connected',
      database: dbInfo[0].db,
      user: dbInfo[0].user,
      tables: tables.map(t => Object.values(t)[0]),
      environment: NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      error: error.message,
      environment: NODE_ENV
    });
  }
});

/**
 * @route POST /api/sync-db
 * @description Database synchronization (development only)
 */
app.post('/api/sync-db', async (req, res) => {
  if (NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Database sync is disabled in production' 
    });
  }

  try {
    const { force = false, alter = true } = req.body;
    
    await sequelize.sync({ force, alter });
    res.json({ 
      message: 'Database synced successfully',
      mode: force ? 'force' : alter ? 'alter' : 'safe'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Database sync failed',
      details: error.message 
    });
  }
});

// ------------------------------------
// Production Route Handling
// ------------------------------------
if (NODE_ENV === 'production') {
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// ------------------------------------
// Error Handling Middleware
// ------------------------------------

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);

  // Database errors
  if (err.name?.includes('Sequelize')) {
    return res.status(400).json({
      message: 'Database operation failed',
      error: NODE_ENV === 'development' ? err.message : 'Database error'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    message: 'Internal server error',
    error: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ------------------------------------
// Server Initialization
// ------------------------------------
const startServer = async () => {
  try {
    console.log('🚀 Starting AfyaLink Server...');
    console.log(`🌐 Environment: ${NODE_ENV}`);
    console.log(`🔗 Client URL: ${CLIENT_URL}`);
    
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Cannot start server without database connection');
      
      if (NODE_ENV === 'development') {
        console.warn('⚠️  Starting in degraded mode (frontend only)');
      } else {
        process.exit(1);
      }
    }
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Host: 0.0.0.0`);
      console.log(`🕒 Started at: ${new Date().toISOString()}`);
      
      if (NODE_ENV === 'development') {
        console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      } else {
        console.log(`🔗 Production health: [your-backend-url].onrender.com/api/health`);
      }
    });
    
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;