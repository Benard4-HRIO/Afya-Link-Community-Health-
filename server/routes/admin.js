// routes/admin.js
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op, fn, col } = require('sequelize');
const { sequelize } = require('../models'); // ✅ Make sure this exists in models/index.js

// Models
const User = require('../models/User');
const HealthService = require('../models/HealthService');
const EducationContent = require('../models/EducationContent');
const ChatSession = require('../models/ChatSession');

// Middleware
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * ========================================
 *  ADMIN DASHBOARD
 * ========================================
 */
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const newUsersThisMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      }
    });

    // Health service statistics
    const totalServices = await HealthService.count();
    const verifiedServices = await HealthService.count({ where: { isVerified: true } });
    const emergencyServices = await HealthService.count({ where: { isEmergency: true } });

    // Content statistics
    const totalContent = await EducationContent.count();
    const publishedContent = await EducationContent.count({ where: { isPublished: true } });
    const contentByCategory = await EducationContent.findAll({
      attributes: [
        'category',
        [fn('COUNT', col('id')), 'count']
      ],
      where: { isPublished: true },
      group: ['category']
    });

    // Chat session statistics
    const totalSessions = await ChatSession.count();
    const activeSessions = await ChatSession.count({ where: { status: 'active' } });
    const waitingSessions = await ChatSession.count({ where: { status: 'waiting' } });

    // Recent activity
    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt']
    });

    const recentContent = await EducationContent.findAll({
      where: { isPublished: true },
      order: [['publishedAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'category', 'publishedAt']
    });

    return res.status(200).json({
      users: { total: totalUsers, active: activeUsers, newThisMonth: newUsersThisMonth },
      services: { total: totalServices, verified: verifiedServices, emergency: emergencyServices },
      content: { total: totalContent, published: publishedContent, byCategory: contentByCategory },
      chat: { total: totalSessions, active: activeSessions, waiting: waitingSessions },
      recent: { users: recentUsers, content: recentContent }
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * ========================================
 *  USERS MANAGEMENT
 * ========================================
 */
router.get('/users', [
  adminAuth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim().isLength({ max: 100 }),
  query('role').optional().isIn(['user', 'admin', 'counselor', 'volunteer']),
  query('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (role) whereClause.role = role;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const users = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      users: users.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(users.count / limit),
        totalItems: users.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Update User Role
 */
router.put('/users/:id/role', [
  adminAuth,
  body('role').isIn(['user', 'admin', 'counselor', 'volunteer']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ role });
    return res.status(200).json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Update Role Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Update User Status (Activate/Deactivate)
 */
router.put('/users/:id/status', [
  adminAuth,
  body('isActive').isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ isActive });
    return res.status(200).json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * ========================================
 *  HEALTH SERVICES MANAGEMENT
 * ========================================
 */
router.get('/services', [
  adminAuth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['clinic', 'pharmacy', 'hospital', 'emergency', 'mental_health', 'specialist']),
  query('isVerified').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { page = 1, limit = 20, type, isVerified } = req.query;
    const offset = (page - 1) * limit;

    // ✅ Use only one whereClause
    const whereClause = {};
    if (type) whereClause.type = type;
    if (isVerified !== undefined) whereClause.isVerified = isVerified === 'true';

    const services = await HealthService.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      services: services.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(services.count / limit),
        totalItems: services.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get Services Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;





