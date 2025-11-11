const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ------------------------------------
// ChatSession Model
// ------------------------------------
const ChatSession = sequelize.define(
  'ChatSession',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
      comment: 'Null for anonymous users',
    },
    counselorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Unique session identifier for anonymous users',
    },
    status: {
      type: DataTypes.ENUM('waiting', 'active', 'ended', 'cancelled'),
      defaultValue: 'waiting',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Main topic or concern discussed',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    userRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 },
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: 'ChatSessions', // ✅ Ensures consistent naming
  }
);

module.exports = ChatSession;
