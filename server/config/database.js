// server/config/database.js - OPTIMIZED FOR RAILWAY PASSWORD
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
// Database Configuration - ENHANCED FOR RAILWAY
// ------------------------------------

/**
 * Initialize Sequelize - ENHANCED WITH BETTER ERROR HANDLING
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
          connectTimeout: 60000, // 60 seconds timeout
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
        // Add connection timeout
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
    console.error('💡 Check your DATABASE_URL format in Render environment variables');
    throw error;
  }
};

// Initialize Sequelize connection
const sequelize = initializeSequelize();

// ------------------------------------
// Connection Test - ENHANCED WITH BETTER DIAGNOSTICS
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
      
      // Test table access
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
    
    // Comprehensive error diagnostics
    if (error.original) {
      console.error('🔧 Detailed Error Analysis:');
      console.error('   Code:', error.original.code);
      console.error('   Errno:', error.original.errno);
      console.error('   SQL State:', error.original.sqlState);
      if (error.original.sqlMessage) {
        console.error('   SQL Message:', error.original.sqlMessage);
      }
    }
    
    // Connection target information
    console.log('🎯 Connection Target:');
    if (process.env.DATABASE_URL) {
      const safeUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
      console.log('   URL:', safeUrl);
      
      // Parse and show individual components
      const urlParts = process.env.DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      if (urlParts) {
        console.log('   Username:', urlParts[1]);
        console.log('   Host:', urlParts[3]);
        console.log('   Port:', urlParts[4]);
        console.log('   Database:', urlParts[5]);
        console.log('   Password Length:', urlParts[2].length, 'characters');
      }
    }

    // Retry logic with progressive delay
    if (retryCount < MAX_RETRIES - 1) {
      const delay = (retryCount + 1) * 2000; // 2s, 4s, 6s
      console.log(`⏳ Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return testConnection(retryCount + 1);
    }

    console.error('\n💥 ALL CONNECTION ATTEMPTS FAILED');
    console.log('🚨 TROUBLESHOOTING CHECKLIST:');
    console.log('   1. ✅ DATABASE_URL is set in Render environment variables');
    console.log('   2. 🔄 Password is correct (no URL encoding needed for your password)');
    console.log('   3. 🌐 Railway database has public networking enabled');
    console.log('   4. 🔒 SSL is properly configured');
    console.log('   5. 📡 Network connectivity between Render and Railway');
    console.log('   6. ⏰ Database server is running and accessible');
    
    return false;
  }
};

// ------------------------------------
// Safe Database Synchronization - ONLY CHANGE: Allow alter in production
// ------------------------------------

/**
 * Safely synchronize database models
 */
const syncDatabase = async (options = {}) => {
  try {
    const syncOptions = {
      force: false,
      alter: true, // ✅ CHANGED: Always allow alter for table creation
      ...options
    };

    if (syncOptions.force && NODE_ENV === 'production') {
      throw new Error('Force sync is not allowed in production');
    }

    console.log(`🔄 Database synchronization (${NODE_ENV} mode)...`);
    
    if (syncOptions.force) {
      console.warn('⚠️  FORCE SYNC: This will DROP ALL TABLES and data!');
    } else if (syncOptions.alter) {
      console.log('🔧 ALTER SYNC: Safe table modifications');
    } else {
      console.log('🔒 SAFE SYNC: Create missing tables only');
    }

    await sequelize.sync(syncOptions);
    console.log('✅ Database synchronized successfully');
    
    // Show sync results
    const modelNames = Object.keys(sequelize.models);
    console.log(`📋 Registered models: ${modelNames.join(', ')}`);
    
    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error.message);
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