// server/config/database.js - Updated for Railway MySQL + Render
const { Sequelize } = require('sequelize');
require('dotenv').config();

// ✅ Configuration Constants
const NODE_ENV = process.env.NODE_ENV || 'development';

// ------------------------------------
// Database Configuration - SIMPLIFIED
// ------------------------------------

/**
 * Get database configuration - PRIORITIZE DATABASE_URL
 */
const getDatabaseConfig = () => {
  // Always use DATABASE_URL first (Railway provides this)
  if (process.env.DATABASE_URL) {
    console.log('🔗 Using DATABASE_URL from Railway');
    return {
      connectionString: process.env.DATABASE_URL,
      dialect: 'mysql'
    };
  }

  // Fallback for local development only
  console.log('🔗 Using local MySQL database');
  return {
    database: process.env.DB_NAME || 'afyalink_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql'
  };
};

/**
 * Get Sequelize dialect options - OPTIMIZED FOR RAILWAY
 */
const getDialectOptions = () => {
  const baseOptions = {
    charset: 'utf8mb4',
    decimalNumbers: true,
    supportBigNumbers: true,
    bigNumberStrings: false
  };

  // Railway MySQL requires SSL in production
  if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
    baseOptions.ssl = {
      require: true,
      rejectUnauthorized: false
    };
  }

  return baseOptions;
};

/**
 * Initialize Sequelize - SIMPLIFIED FOR DEPLOYMENT
 */
const initializeSequelize = () => {
  try {
    const dbConfig = getDatabaseConfig();
    const dialectOptions = getDialectOptions();

    const sequelizeConfig = {
      dialect: 'mysql',
      logging: NODE_ENV === 'development' ? 
        (msg) => console.log(`📊 Sequelize: ${msg}`) : false,
      pool: {
        max: 5, // Reduced for better performance
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      dialectOptions,
      define: {
        freezeTableName: true,
        timestamps: true,
        underscored: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      },
      retry: {
        max: 2, // Reduced retries for faster failure detection
      },
      // Remove complex retry delay for simplicity
    };

    // Use DATABASE_URL (Railway) or individual config (local)
    if (dbConfig.connectionString) {
      console.log('📍 Connecting to Railway MySQL...');
      return new Sequelize(dbConfig.connectionString, sequelizeConfig);
    } else {
      console.log('📍 Connecting to local MySQL...');
      return new Sequelize(
        dbConfig.database,
        dbConfig.username,
        dbConfig.password,
        {
          host: dbConfig.host,
          port: dbConfig.port,
          ...sequelizeConfig
        }
      );
    }
  } catch (error) {
    console.error('❌ Failed to initialize Sequelize:', error.message);
    throw error;
  }
};

// Initialize Sequelize connection
const sequelize = initializeSequelize();

// ------------------------------------
// Connection Test - SIMPLIFIED
// ------------------------------------

/**
 * Test database connection with basic retry logic
 */
const testConnection = async (retryCount = 0) => {
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 2000;
  
  try {
    console.log(`🔄 Testing database connection (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');

    // Get basic database information
    const [dbInfo] = await sequelize.query('SELECT DATABASE() as db, USER() as user');
    console.log(`📍 Connected to: ${dbInfo[0].db}`);
    console.log(`👤 Database user: ${dbInfo[0].user}`);

    return true;

  } catch (error) {
    console.error(`❌ Database connection failed (attempt ${retryCount + 1}):`, error.message);

    // Log which database we're trying to connect to
    const dbConfig = getDatabaseConfig();
    if (dbConfig.connectionString) {
      const safeUrl = dbConfig.connectionString.replace(/:[^:@]+@/, ':****@');
      console.log(`🔗 Trying to connect to: ${safeUrl}`);
    }

    // Simple retry logic
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`⏳ Retrying in 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return testConnection(retryCount + 1);
    }

    console.error('💥 All connection attempts failed');
    return false;
  }
};

// ------------------------------------
// Safe Database Synchronization
// ------------------------------------

/**
 * Safely synchronize database models
 */
const syncDatabase = async (options = {}) => {
  try {
    const syncOptions = {
      force: false, // ⚠️ Never use force in production!
      alter: NODE_ENV === 'development', // Only alter in development
      ...options
    };

    if (syncOptions.force && NODE_ENV === 'production') {
      throw new Error('Force sync is not allowed in production');
    }

    console.log(`🔄 Synchronizing database (${NODE_ENV} mode)...`);
    
    if (syncOptions.force) {
      console.warn('⚠️  FORCE SYNC: This will drop all tables and data!');
    } else if (syncOptions.alter) {
      console.log('🔧 ALTER SYNC: Modifying existing tables');
    } else {
      console.log('🔒 SAFE SYNC: Creating missing tables only');
    }

    await sequelize.sync(syncOptions);
    console.log('✅ Database synchronized successfully');

    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error.message);
    return false;
  }
};

// ------------------------------------
// Health Check Function - SIMPLIFIED
// ------------------------------------

/**
 * Comprehensive database health check
 */
const checkDatabaseHealth = async () => {
  try {
    // Test basic connection
    await sequelize.authenticate();

    // Get database stats
    const [dbInfo] = await sequelize.query('SELECT DATABASE() as db, NOW() as serverTime');
    const [tableCount] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);

    return {
      status: 'healthy',
      database: dbInfo[0].db,
      serverTime: dbInfo[0].serverTime,
      tableCount: tableCount[0].count,
      models: Object.keys(sequelize.models).length
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// ------------------------------------
// Utility Functions
// ------------------------------------

/**
 * Close database connection gracefully
 */
const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed gracefully');
    return true;
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
    return false;
  }
};

/**
 * Execute a raw SQL query with error handling
 */
const executeQuery = async (query, options = {}) => {
  try {
    const results = await sequelize.query(query, {
      logging: NODE_ENV === 'development',
      ...options
    });
    return { success: true, results };
  } catch (error) {
    console.error('❌ Query execution failed:', error.message);
    return { success: false, error: error.message };
  }
};

// ------------------------------------
// Export everything
// ------------------------------------
module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  checkDatabaseHealth,
  closeDatabase,
  executeQuery
};