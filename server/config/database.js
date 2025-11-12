// server/config/database.js - DEBUG VERSION FOR RAILWAY
const { Sequelize } = require('sequelize');
require('dotenv').config();

// ✅ DEBUG: Check environment variables immediately
console.log('🔍 DATABASE DEBUG - Environment Check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_NAME:', process.env.DB_NAME);

if (process.env.DATABASE_URL) {
  const safeUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
  console.log('📍 DATABASE_URL (safe):', safeUrl);
}

const NODE_ENV = process.env.NODE_ENV || 'development';

// ------------------------------------
// Database Configuration - ULTRA SIMPLIFIED
// ------------------------------------

/**
 * Initialize Sequelize - DIRECT APPROACH
 */
const initializeSequelize = () => {
  try {
    // ALWAYS use DATABASE_URL if available (Railway)
    if (process.env.DATABASE_URL) {
      console.log('🚀 USING RAILWAY MYSQL DATABASE');
      
      return new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        logging: NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        define: {
          freezeTableName: true,
          timestamps: true,
          underscored: false,
        },
        retry: {
          max: 2,
        }
      });
    }

    // Fallback for local development
    console.log('⚠️  USING LOCAL MYSQL FALLBACK');
    return new Sequelize(
      process.env.DB_NAME || 'afyalink_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: NODE_ENV === 'development' ? console.log : false,
      }
    );
  } catch (error) {
    console.error('❌ Failed to initialize Sequelize:', error.message);
    throw error;
  }
};

// Initialize Sequelize connection
const sequelize = initializeSequelize();

// ------------------------------------
// Connection Test - IMPROVED DEBUGGING
// ------------------------------------

/**
 * Test database connection with detailed error reporting
 */
const testConnection = async (retryCount = 0) => {
  const MAX_RETRIES = 2;
  
  try {
    console.log(`🔄 Database connection attempt ${retryCount + 1}/${MAX_RETRIES}...`);
    
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Test basic query to verify everything works
    try {
      const [dbInfo] = await sequelize.query('SELECT DATABASE() as db, USER() as user');
      console.log(`📍 Connected to database: ${dbInfo[0].db}`);
      console.log(`👤 Connected as user: ${dbInfo[0].user}`);
    } catch (queryError) {
      console.log('⚠️  Connected but query test failed:', queryError.message);
    }

    return true;

  } catch (error) {
    console.error(`❌ Database connection failed (attempt ${retryCount + 1}):`, error.message);
    
    // Detailed error information
    if (error.original) {
      console.error('🔧 Original error:', error.original.message);
    }
    
    // Show what we're trying to connect to
    if (process.env.DATABASE_URL) {
      const safeUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
      console.log(`🔗 Attempted connection to: ${safeUrl}`);
    } else {
      console.log(`🔗 Attempted local connection to: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    }

    // Retry logic
    if (retryCount < MAX_RETRIES - 1) {
      console.log('⏳ Retrying in 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return testConnection(retryCount + 1);
    }

    console.error('💥 All connection attempts failed');
    console.log('💡 Check:');
    console.log('  1. DATABASE_URL environment variable is set in Render');
    console.log('  2. Railway MySQL database is running');
    console.log('  3. Database credentials are correct');
    
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
      force: false,
      alter: NODE_ENV === 'development',
      ...options
    };

    if (syncOptions.force && NODE_ENV === 'production') {
      throw new Error('Force sync is not allowed in production');
    }

    console.log(`🔄 Database sync (${NODE_ENV} mode)...`);
    await sequelize.sync(syncOptions);
    console.log('✅ Database synchronized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    return false;
  }
};

// ------------------------------------
// Health Check Function
// ------------------------------------

/**
 * Comprehensive database health check
 */
const checkDatabaseHealth = async () => {
  try {
    await sequelize.authenticate();
    
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
    console.log('✅ Database connection closed');
    return true;
  } catch (error) {
    console.error('❌ Error closing database:', error.message);
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
    console.error('❌ Query failed:', error.message);
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