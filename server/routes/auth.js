const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { forgotPasswordController } = require('../controllers/authController');

const router = express.Router();

// Helper: Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// =========================================
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// =========================================
router.post(
  '/register',
  [
    body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('phone').isLength({ min: 10, max: 15 }).withMessage('Phone number must be 10-15 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('language').optional().isIn(['en', 'sw']).withMessage('Invalid language'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { firstName, lastName, email, phone, password, dateOfBirth, gender, language } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });

      const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        dateOfBirth,
        gender,
        language: language || 'en',
      });

      const token = generateToken(user.id);
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// =========================================
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// =========================================
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      if (!user.isActive) return res.status(401).json({ message: 'Account is deactivated' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      await user.update({ lastLogin: new Date() });

      const token = generateToken(user.id);
      res.json({ message: 'Login successful', token, user: user.toJSON() });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// =========================================
// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
// =========================================
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =========================================
// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
// =========================================
router.put(
  '/profile',
  [
    auth,
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    body('phone').optional().isLength({ min: 10, max: 15 }),
    body('dateOfBirth').optional().isISO8601(),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('language').optional().isIn(['en', 'sw']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const allowedUpdates = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'language', 'location'];
      const updates = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      });

      await req.user.update(updates);
      res.json({ message: 'Profile updated successfully', user: req.user.toJSON() });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Server error during profile update' });
    }
  }
);

// =========================================
// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
// =========================================
router.post(
  '/change-password',
  [
    auth,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { currentPassword, newPassword } = req.body;

      const isMatch = await req.user.comparePassword(currentPassword);
      if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

      await req.user.update({ password: newPassword });
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ message: 'Server error during password change' });
    }
  }
);

// =========================================
// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
// =========================================
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  forgotPasswordController
);

// =========================================
// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
// =========================================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Verify JWT token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Find user
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update password
    await user.update({ password: newPassword });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
});

module.exports = router;
