// server/index.js - DEBUG VERSION
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
const { testConnection, sequelize } = require('./config/database');

// Initialize express app
const app = express();

// ✅ DEBUG: Log environment variables
console.log('🔍 ENVIRONMENT CHECK:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('JWT_EXPIRE:', process.env.JWT_EXPIRE || '7d (default)');

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
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 100 : 500,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
});
app.use(limiter);

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
// Debug Endpoints
// ------------------------------------

/**
 * @route GET /api/debug/env
 * @description Debug environment variables
 */
app.get('/api/debug/env', (req, res) => {
  res.json({
    databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL,
    port: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    jwtExpire: process.env.JWT_EXPIRE || 'NOT SET',
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || key.includes('URL') || key.includes('NODE') || key.includes('JWT')
    )
  });
});

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

// Production Route Handling
if (NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error Handling
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(err.status || 500).json({
    message: 'Internal server error',
    error: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ------------------------------------
// Server Initialization - ONLY CHANGE: Added Auto-Sync
// ------------------------------------
const startServer = async () => {
  try {
    console.log('🚀 Starting AfyaLink Server...');
    console.log(`🌐 Environment: ${NODE_ENV}`);
    console.log(`🔗 Client URL: ${CLIENT_URL}`);
    
    // ✅ CRITICAL: Check JWT_SECRET before starting
    if (!process.env.JWT_SECRET) {
      console.error('❌ FATAL ERROR: JWT_SECRET is not set!');
      console.log('💡 Please set JWT_SECRET in Render environment variables');
      console.log('💡 Go to: Render Dashboard > Your Service > Environment > Add JWT_SECRET');
      // Don't exit - let it continue but warn heavily
    }
    
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ FATAL: Cannot start server without database connection');
      console.log('💡 Check if DATABASE_URL is set in Render environment variables');
      process.exit(1);
    }
    
    // ✅ Database sync with safer options
    console.log('🔄 Syncing database tables...');
    try {
      // Use force: false and alter: false for production to avoid issues
      const syncOptions = NODE_ENV === 'production' 
        ? { force: false, alter: false } 
        : { alter: false }; // Changed from alter: true to avoid index issues
      
      await sequelize.sync(syncOptions);
      console.log('✅ Database tables synchronized successfully');
      
      // Show table count
      const [tables] = await sequelize.query(`
        SELECT COUNT(*) as tableCount 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `);
      console.log(`📊 Total tables created: ${tables[0].tableCount}`);
    } catch (syncError) {
      console.error('❌ Auto-sync failed:', syncError.message);
      console.log('💡 Tip: You may need to manually create tables or check your model definitions');
      // Don't exit - continue server startup
    }
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Host: 0.0.0.0`);
      console.log(`🕒 Started at: ${new Date().toISOString()}`);
      console.log(`🔗 Health check: https://your-backend.onrender.com/api/health`);
      console.log(`🐛 Debug env: https://your-backend.onrender.com/api/debug/env`);
    });
    
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;