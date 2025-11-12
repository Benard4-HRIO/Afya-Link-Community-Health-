// server/index.js - PRODUCTION READY WITH AUTO-SYNC
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
const { testConnection, sequelize, syncDatabase } = require('./config/database');

// Initialize express app
const app = express();

// ✅ DEBUG: Log environment variables
console.log('🔍 ENVIRONMENT CHECK:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('PORT:', process.env.PORT);

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
// Debug & Sync Endpoints
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
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || key.includes('URL') || key.includes('NODE')
    )
  });
});

/**
 * @route POST /api/sync-db
 * @description Manual database synchronization
 */
app.post('/api/sync-db', async (req, res) => {
  try {
    console.log('🔄 Manual database sync requested...');
    const result = await syncDatabase({ alter: true });
    
    if (result) {
      res.json({ 
        message: 'Database synchronized successfully',
        tables: await getTableCount()
      });
    } else {
      res.status(500).json({ error: 'Database sync failed' });
    }
  } catch (error) {
    console.error('Sync endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
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
      const tableCount = await getTableCount();
      healthCheck.tableCount = tableCount;
      healthCheck.tables = tableCount > 0 ? 'Ready' : 'No tables';
    } catch (tableError) {
      healthCheck.tables = 'Error checking tables';
    }
    
    res.json(healthCheck);
  } catch (error) {
    healthCheck.status = 'Degraded';
    healthCheck.database = 'Disconnected';
    healthCheck.error = error.message;
    
    res.status(503).json(healthCheck);
  }
});

// Helper function to get table count
async function getTableCount() {
  try {
    const [tables] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    return tables[0].count;
  } catch (error) {
    return 0;
  }
}

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
// Server Initialization with Auto-Sync
// ------------------------------------
const startServer = async () => {
  try {
    console.log('🚀 Starting AfyaLink Server...');
    console.log(`🌐 Environment: ${NODE_ENV}`);
    console.log(`🔗 Client URL: ${CLIENT_URL}`);
    
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ FATAL: Cannot start server without database connection');
      process.exit(1);
    }
    
    // ✅ AUTO-SYNC DATABASE ON STARTUP
    console.log('🔄 Auto-syncing database tables on startup...');
    try {
      const syncResult = await syncDatabase({ alter: true });
      
      if (syncResult) {
        const tableCount = await getTableCount();
        console.log(`✅ Database sync completed. Tables created: ${tableCount}`);
        
        // List all models that were synchronized
        const modelNames = Object.keys(sequelize.models);
        console.log(`📋 Models synchronized: ${modelNames.join(', ')}`);
      } else {
        console.warn('⚠️ Database sync may have failed, but continuing server startup...');
      }
    } catch (syncError) {
      console.error('❌ Auto-sync failed:', syncError.message);
      console.log('⚠️ Continuing server startup without database sync...');
    }
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Host: 0.0.0.0`);
      console.log(`🕒 Started at: ${new Date().toISOString()}`);
      console.log(`🔗 Health check: https://afya-link-community-health-3.onrender.com/api/health`);
      console.log(`🔗 Manual sync: https://afya-link-community-health-3.onrender.com/api/sync-db`);
      console.log(`🔗 Debug info: https://afya-link-community-health-3.onrender.com/api/debug/env`);
    });
    
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;