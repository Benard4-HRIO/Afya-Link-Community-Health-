const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HealthRecord = sequelize.define('HealthRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('screening', 'vaccination', 'checkup', 'medication', 'test_result'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('diabetes', 'hypertension', 'cholesterol', 'blood_pressure', 'weight', 'general'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  value: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Measured value (e.g., blood pressure reading)'
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Unit of measurement'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  nextDueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Next scheduled appointment or screening'
  },
  doctor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  facility: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isReminderSet: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reminderDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = HealthRecord;





