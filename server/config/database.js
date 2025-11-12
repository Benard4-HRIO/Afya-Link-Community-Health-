// server/config/database.js - PRODUCTION READY WITH AUTO-SYNC
const { Sequelize } = require('sequelize');
require('dotenv').config();

// ✅ ENHANCED DEBUG: Check all critical environment variables
console.log('🔍 DATABASE CONFIGURATION CHECK:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || '10000');

if (process.env.DATABASE_URL) {
  const safeUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
  console.log('📍 Database URL:', safeUrl);
  
  // Extract and show connection details
  const dbMatch = process.env.DATABASE_URL.match(/mysql:\/\/([^:]+):[^@]+@([^:]+):(\d+)\/(.+)/);
  if (dbMatch) {
    console.log('🔧 Connection Details:');
    console.log('   Username:', dbMatch[1]);
    console.log('   Host:', dbMatch[2]);
    console.log('   Port:', dbMatch[3]);
    console.log('   Database:', dbMatch[4]);
  }
}

const NODE_ENV = process.env.NODE_ENV || 'development';

// ------------------------------------
// Database Configuration - PRODUCTION OPTIMIZED
// ------------------------------------

/**
 * Initialize Sequelize - PRODUCTION READY
 */
const initializeSequelize = () => {
  try {
    // ALWAYS use DATABASE_URL if available (Railway)
    if (process.env.DATABASE_URL) {
      console.log('🚀 INITIALIZING RAILWAY MYSQL CONNECTION...');
      
      const sequelizeConfig = {
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
          },
          connectTimeout: 60000,
        },
        define: {
          freezeTableName: true,
          timestamps: true,
          underscored: false,
        },
        retry: {
          max: 3,
          timeout: 60000,
          match: [
            /ConnectionError/,
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /ECONNREFUSED/,
            /ETIMEDOUT/,
          ],
        },
        connectTimeout: 60000,
      };

      console.log('🔧 Sequelize configuration ready');
      return new Sequelize(process.env.DATABASE_URL, sequelizeConfig);
    }

    // Fallback for local development
    console.log('⚠️  USING LOCAL MYSQL FALLBACK - DATABASE_URL NOT FOUND');
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
    console.error('❌ CRITICAL: Failed to initialize Sequelize:', error.message);
    throw error;
  }
};

// Initialize Sequelize connection
const sequelize = initializeSequelize();

// ------------------------------------
// Connection Test - PRODUCTION READY
// ------------------------------------

/**
 * Test database connection with comprehensive diagnostics
 */
const testConnection = async (retryCount = 0) => {
  const MAX_RETRIES = 3;
  
  try {
    console.log(`\n🔄 DATABASE CONNECTION ATTEMPT ${retryCount + 1}/${MAX_RETRIES}`);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    await sequelize.authenticate();
    console.log('✅ DATABASE CONNECTION ESTABLISHED SUCCESSFULLY');

    // Comprehensive connection verification
    try {
      const [dbInfo] = await sequelize.query('SELECT DATABASE() as db, USER() as user, VERSION() as version');
      console.log('📊 Connection Details:');
      console.log('   Database:', dbInfo[0].db);
      console.log('   User:', dbInfo[0].user);
      console.log('   MySQL Version:', dbInfo[0].version);
      
      const [tables] = await sequelize.query(`
        SELECT COUNT(*) as tableCount 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `);
      console.log('   Tables in database:', tables[0].tableCount);
      
    } catch (queryError) {
      console.log('⚠️  Connection OK but query failed:', queryError.message);
    }

    return true;

  } catch (error) {
    console.error(`\n❌ DATABASE CONNECTION FAILED (Attempt ${retryCount + 1})`);
    console.error('🔴 Error:', error.message);
    
    if (error.original) {
      console.error('🔧 Detailed Error Analysis:');
      console.error('   Code:', error.original.code);
      console.error('   Errno:', error.original.errno);
      console.error('   SQL State:', error.original.sqlState);
      if (error.original.sqlMessage) {
        console.error('   SQL Message:', error.original.sqlMessage);
      }
    }
    
    // Retry logic with progressive delay
    if (retryCount < MAX_RETRIES - 1) {
      const delay = (retryCount + 1) * 2000;
      console.log(`⏳ Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return testConnection(retryCount + 1);
    }

    console.error('\n💥 ALL CONNECTION ATTEMPTS FAILED');
    return false;
  }
};

// ------------------------------------
// Safe Database Synchronization - PRODUCTION READY
// ------------------------------------

/**
 * Safely synchronize database models - ALLOWS ALTER IN PRODUCTION
 */
const syncDatabase = async (options = {}) => {
  try {
    // ✅ ALLOW ALTER IN PRODUCTION FOR INITIAL SETUP
    const syncOptions = {
      force: false,
      alter: true, // Always allow alter for table creation/modification
      ...options
    };

    console.log(`🔄 Database synchronization starting...`);
    console.log(`📋 Sync mode: ${syncOptions.force ? 'FORCE' : syncOptions.alter ? 'ALTER' : 'SAFE'}`);
    
    if (syncOptions.force) {
      console.warn('🚨 FORCE SYNC: This will DROP ALL TABLES and data!');
    }

    await sequelize.sync(syncOptions);
    console.log('✅ Database synchronized successfully');
    
    // Show sync results
    const modelNames = Object.keys(sequelize.models);
    console.log(`📋 Registered models: ${modelNames.join(', ')}`);
    
    // Verify tables were created
    const [tables] = await sequelize.query(`
      SELECT COUNT(*) as tableCount 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    console.log(`📊 Total tables in database: ${tables[0].tableCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error.message);
    
    // Don't throw error - allow server to continue running
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
  const healthCheck = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    database: 'unknown'
  };

  try {
    await sequelize.authenticate();
    healthCheck.status = 'healthy';
    healthCheck.database = 'connected';
    
    const [dbInfo] = await sequelize.query('SELECT DATABASE() as db, NOW() as serverTime');
    const [tableCount] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);

    healthCheck.databaseName = dbInfo[0].db;
    healthCheck.serverTime = dbInfo[0].serverTime;
    healthCheck.tableCount = tableCount[0].count;
    healthCheck.models = Object.keys(sequelize.models).length;

    return healthCheck;
  } catch (error) {
    healthCheck.status = 'unhealthy';
    healthCheck.error = error.message;
    healthCheck.database = 'disconnected';
    return healthCheck;
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