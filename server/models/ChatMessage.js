const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const ChatSession = require('./ChatSession'); // ✅ Added for association

// ------------------------------------
// ChatMessage Model
// ------------------------------------
const ChatMessage = sequelize.define(
  'ChatMessage',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ChatSessions',
        key: 'id',
      },
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    senderType: {
      type: DataTypes.ENUM('user', 'counselor', 'system'),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    messageType: {
      type: DataTypes.ENUM('text', 'image', 'file', 'system'),
      defaultValue: 'text',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: 'ChatMessages', // ✅ Ensures table name consistency
  }
);

// ------------------------------------
// ✅ Associations (non-breaking, sync-safe)
// ------------------------------------
ChatMessage.belongsTo(ChatSession, {
  foreignKey: 'sessionId',
  targetKey: 'id',
  as: 'session',
  onDelete: 'CASCADE',
});

ChatSession.hasMany(ChatMessage, {
  foreignKey: 'sessionId',
  sourceKey: 'id',
  as: 'messages',
  onDelete: 'CASCADE',
});

module.exports = ChatMessage;
