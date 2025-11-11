const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EducationContent = sequelize.define('EducationContent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title cannot be empty' },
      len: [5, 200]
    }
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('article', 'video', 'quiz', 'infographic', 'guide'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'hygiene',
      'nutrition',
      'sexual_health',
      'mental_wellness',
      'preventive_care',
      'emergency'
    ),
    allowNull: false
  },
  language: {
    type: DataTypes.ENUM('en', 'sw'),
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  targetAge: {
    type: DataTypes.ENUM('children', 'teens', 'adults', 'elderly', 'all'),
    defaultValue: 'all'
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isUrl: { msg: 'Media URL must be valid' } }
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isUrl: { msg: 'Thumbnail URL must be valid' } }
  },
  readingTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated reading time in minutes'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of tags (stored as JSON)'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  viewCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  likeCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  }
}, {
  timestamps: true,
  tableName: 'education_contents',
  indexes: [
    { fields: ['category'] },
    { fields: ['language'] },
    { fields: ['isPublished'] },
    { fields: ['title'] }
  ]
});

module.exports = EducationContent;
