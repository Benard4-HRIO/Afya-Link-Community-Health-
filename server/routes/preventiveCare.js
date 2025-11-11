const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op, fn, col } = require('sequelize'); // ✅ Added Sequelize imports
const { auth } = require('../middleware/auth');
const HealthRecord = require('../models/HealthRecord');

const router = express.Router();

/* ============================
   GET /api/preventive-care/records
   Fetch user health records
   ============================ */
router.get(
  '/records',
  [
    auth,
    query('type').optional().isIn(['screening', 'vaccination', 'checkup', 'medication', 'test_result']),
    query('category').optional().isIn(['diabetes', 'hypertension', 'cholesterol', 'blood_pressure', 'weight', 'general']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { type, category, page = 1, limit = 20 } = req.query;
      const whereClause = { userId: req.user.id };

      if (type) whereClause.type = type;
      if (category) whereClause.category = category;

      const offset = (page - 1) * limit;

      const records = await HealthRecord.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['date', 'DESC']]
      });

      res.json({
        records: records.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(records.count / limit),
          totalItems: records.count,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get health records error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/* ============================
   POST /api/preventive-care/records
   Create new health record
   ============================ */
router.post(
  '/records',
  [
    auth,
    body('type').isIn(['screening', 'vaccination', 'checkup', 'medication', 'test_result']).withMessage('Invalid record type'),
    body('category').isIn(['diabetes', 'hypertension', 'cholesterol', 'blood_pressure', 'weight', 'general']).withMessage('Invalid category'),
    body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title must be 2-100 characters'),
    body('date').isISO8601().withMessage('Valid date required'),
    body('value').optional().trim().isLength({ max: 50 }),
    body('unit').optional().trim().isLength({ max: 20 }),
    body('nextDueDate').optional().isISO8601(),
    body('doctor').optional().trim().isLength({ max: 100 }),
    body('facility').optional().trim().isLength({ max: 100 }),
    body('notes').optional().trim().isLength({ max: 1000 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const recordData = { ...req.body, userId: req.user.id };
      const record = await HealthRecord.create(recordData);

      res.status(201).json(record);
    } catch (error) {
      console.error('Create health record error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/* ============================
   PUT /api/preventive-care/records/:id
   Update existing record
   ============================ */
router.put(
  '/records/:id',
  [
    auth,
    body('title').optional().trim().isLength({ min: 2, max: 100 }),
    body('date').optional().isISO8601(),
    body('value').optional().trim().isLength({ max: 50 }),
    body('unit').optional().trim().isLength({ max: 20 }),
    body('nextDueDate').optional().isISO8601(),
    body('doctor').optional().trim().isLength({ max: 100 }),
    body('facility').optional().trim().isLength({ max: 100 }),
    body('notes').optional().trim().isLength({ max: 1000 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const record = await HealthRecord.findOne({
        where: { id: req.params.id, userId: req.user.id }
      });

      if (!record) return res.status(404).json({ message: 'Health record not found' });

      await record.update(req.body);
      res.json(record);
    } catch (error) {
      console.error('Update health record error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/* ============================
   DELETE /api/preventive-care/records/:id
   Delete health record
   ============================ */
router.delete('/records/:id', auth, async (req, res) => {
  try {
    const record = await HealthRecord.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!record) return res.status(404).json({ message: 'Health record not found' });

    await record.destroy();
    res.json({ message: 'Health record deleted successfully' });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   GET /api/preventive-care/dashboard
   User dashboard data summary
   ============================ */
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const recentRecords = await HealthRecord.findAll({
      where: { userId },
      order: [['date', 'DESC']],
      limit: 5
    });

    const upcomingReminders = await HealthRecord.findAll({
      where: {
        userId,
        nextDueDate: {
          [Op.gte]: new Date(),
          [Op.lte]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
        }
      },
      order: [['nextDueDate', 'ASC']]
    });

    const healthStats = await HealthRecord.findAll({
      where: { userId },
      attributes: [
        'category',
        [fn('COUNT', col('id')), 'count'],
        [fn('MAX', col('date')), 'lastRecord']
      ],
      group: ['category']
    });

    const vaccinations = await HealthRecord.findAll({
      where: { userId, type: 'vaccination' },
      order: [['date', 'DESC']]
    });

    res.json({
      recentRecords,
      upcomingReminders,
      healthStats,
      vaccinations
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ============================
   POST /api/preventive-care/reminders/:id
   Set reminder for record
   ============================ */
router.post(
  '/reminders/:id',
  [auth, body('reminderDate').isISO8601().withMessage('Valid reminder date required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const record = await HealthRecord.findOne({
        where: { id: req.params.id, userId: req.user.id }
      });

      if (!record) return res.status(404).json({ message: 'Health record not found' });

      await record.update({
        isReminderSet: true,
        reminderDate: req.body.reminderDate
      });

      res.json({ message: 'Reminder set successfully' });
    } catch (error) {
      console.error('Set reminder error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/* ============================
   GET /api/preventive-care/health-tips
   Health tips based on records
   ============================ */
router.get('/health-tips', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const userCategories = await HealthRecord.findAll({
      where: { userId },
      attributes: ['category'],
      group: ['category']
    });

    const tips = [];

    userCategories.forEach(({ category }) => {
      tips.push(...getHealthTips(category));
    });

    res.json({ tips });
  } catch (error) {
    console.error('Get health tips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper: Generate health tips by category
function getHealthTips(category) {
  const tipsMap = {
    diabetes: [
      'Monitor your blood sugar levels regularly',
      'Maintain a balanced diet with controlled carbohydrates',
      'Exercise regularly to help manage blood sugar',
      'Take medications as prescribed by your doctor'
    ],
    hypertension: [
      'Check your blood pressure regularly',
      'Reduce sodium intake in your diet',
      'Engage in regular physical activity',
      'Manage stress through relaxation techniques'
    ],
    cholesterol: [
      'Eat a heart-healthy diet low in saturated fats',
      'Exercise regularly to improve cholesterol levels',
      'Maintain a healthy weight',
      'Consider medication if lifestyle changes are not enough'
    ],
    general: [
      'Get regular health checkups',
      'Maintain a balanced diet',
      'Exercise for at least 30 minutes daily',
      'Get adequate sleep (7-9 hours)',
      'Stay hydrated by drinking plenty of water'
    ]
  };

  return tipsMap[category] || tipsMap.general;
}

module.exports = router;


