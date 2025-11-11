// server/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// ------------------------------------
// Initialize Sequelize connection
// ------------------------------------
const sequelize = new Sequelize(
  process.env.DB_NAME || 'afyalink_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Makina@22',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      charset: 'utf8mb4',
    },
    define: {
      freezeTableName: true, // Prevent Sequelize from pluralizing table names
    },
  }
);

// ------------------------------------
// Test connection + synchronize models
// ------------------------------------
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');

    /**
     * ⚙️ Synchronization Strategy:
     * - In development: use { alter: true } to auto-update schemas safely.
     * - If you encounter duplicate key or constraint issues, temporarily
     *   switch to { force: true } to drop & recreate tables cleanly.
     * - In production: use plain sequelize.sync() for safety.
     */
    const syncOption =
      process.env.NODE_ENV === 'development'
        ? { alter: true }
        : {}; // Production: no automatic changes

    await sequelize.sync(syncOption);
    console.log(
      `✅ Models synchronized successfully ${
        syncOption.alter ? '(alter:true)' : '(standard sync)'
      }`
    );
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };
