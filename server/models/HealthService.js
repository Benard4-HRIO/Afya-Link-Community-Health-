const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HealthService = sequelize.define(
  'HealthService',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    type: {
      type: DataTypes.ENUM(
        'clinic',
        'pharmacy',
        'hospital',
        'emergency',
        'mental_health',
        'specialist'
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    // 🗺️ Main location storage (JSON format)
    location: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: 'Stores { latitude: number, longitude: number }',
      validate: {
        isValidLocation(value) {
          if (!value || typeof value !== 'object') {
            throw new Error('Location must be an object');
          }
          if (typeof value.latitude !== 'number' || typeof value.longitude !== 'number') {
            throw new Error('Location must contain valid latitude and longitude numbers');
          }
          if (value.latitude < -90 || value.latitude > 90) {
            throw new Error('Latitude must be between -90 and 90');
          }
          if (value.longitude < -180 || value.longitude > 180) {
            throw new Error('Longitude must be between -180 and 180');
          }
        }
      }
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    services: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of services offered',
    },
    operatingHours: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Operating hours for each day of the week',
    },
    isEmergency: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is24Hours: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    
    // 🎯 Virtual fields for easy access to coordinates
    getterMethods: {
      latitude() {
        return this.location?.latitude || null;
      },
      longitude() {
        return this.location?.longitude || null;
      }
    }
  }
);

module.exports = HealthService;