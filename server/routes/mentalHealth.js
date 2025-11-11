const express = require('express');
const { body, query, validationResult } = require('express-validator');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { auth, counselorAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/mental-health/start-session
 * @desc    Start a new chat session
 * @access  Public (for anonymous users)
 */
router.post(
  '/start-session',
  [
    body('isAnonymous').optional().isBoolean(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('topic').optional().trim().isLength({ max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { isAnonymous = true, priority = 'medium', topic } = req.body;
      const userId = req.user?.id || null;
      const sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const session = await ChatSession.create({
        userId,
        sessionId,
        priority,
        topic,
        isAnonymous,
        status: 'waiting',
      });

      res
        .status(201)
        .json({ sessionId: session.sessionId, session: session.toJSON() });
    } catch (error) {
      console.error('Start session error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   POST /api/mental-health/sessions/:sessionId/messages
 * @desc    Send a message in a chat session
 * @access  Public
 */
router.post(
  '/sessions/:sessionId/messages',
  [
    body('message')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message must be 1-1000 characters'),
    body('senderType')
      .isIn(['user', 'counselor'])
      .withMessage('Invalid sender type'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { sessionId } = req.params;
      const { message, senderType } = req.body;

      // ✅ Ensure the chat session exists
      const session = await ChatSession.findOne({ where: { sessionId } });
      if (!session) {
        return res.status(404).json({ message: 'Chat session not found' });
      }

      // ✅ Create message (linking via session.id)
      const chatMessage = await ChatMessage.create({
        sessionId: session.id,
        senderId: req.user?.id || null,
        senderType,
        message,
      });

      // ✅ Update session status if it's the first user message
      if (senderType === 'user' && session.status === 'waiting') {
        await session.update({ status: 'active' });
      }

      res.status(201).json(chatMessage);
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/mental-health/sessions/:sessionId/messages
 * @desc    Get messages from a chat session
 * @access  Public
 */
router.get('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const session = await ChatSession.findOne({ where: { sessionId } });
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    const offset = (page - 1) * limit;
    const messages = await ChatMessage.findAndCountAll({
      where: { sessionId: session.id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'ASC']],
    });

    res.json({
      messages: messages.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(messages.count / limit),
        totalItems: messages.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/mental-health/sessions/waiting
 * @desc    Get waiting chat sessions (for counselors)
 * @access  Private/Counselor
 */
router.get('/sessions/waiting', counselorAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const sessions = await ChatSession.findAndCountAll({
      where: { status: 'waiting' },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'ASC'],
      ],
    });

    res.json({
      sessions: sessions.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(sessions.count / limit),
        totalItems: sessions.count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get waiting sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/mental-health/sessions/:sessionId/assign
 * @desc    Assign counselor to session
 * @access  Private/Counselor
 */
router.post('/sessions/:sessionId/assign', counselorAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const counselorId = req.user.id;

    const session = await ChatSession.findOne({ where: { sessionId } });
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    if (session.counselorId) {
      return res
        .status(400)
        .json({ message: 'Session already assigned to a counselor' });
    }

    await session.update({ counselorId });
    res.json({ message: 'Session assigned successfully' });
  } catch (error) {
    console.error('Assign session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/mental-health/sessions/:sessionId/end
 * @desc    End chat session
 * @access  Private/Counselor
 */
router.post(
  '/sessions/:sessionId/end',
  [
    counselorAuth,
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('feedback').optional().trim().isLength({ max: 500 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { sessionId } = req.params;
      const { rating, feedback } = req.body;

      const session = await ChatSession.findOne({ where: { sessionId } });
      if (!session) {
        return res.status(404).json({ message: 'Chat session not found' });
      }

      await session.update({
        status: 'ended',
        endedAt: new Date(),
        userRating: rating,
        feedback,
      });

      res.json({ message: 'Session ended successfully' });
    } catch (error) {
      console.error('End session error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/mental-health/assessments
 * @desc    Get mental health self-assessment tools
 * @access  Public
 */
router.get('/assessments', async (req, res) => {
  try {
    const assessments = [
      {
        id: 'depression',
        title: 'Depression Screening',
        description: 'A brief assessment to help identify symptoms of depression',
        questions: [
          {
            id: 1,
            question:
              'How often have you felt down, depressed, or hopeless in the past 2 weeks?',
            options: [
              { value: 0, text: 'Not at all' },
              { value: 1, text: 'Several days' },
              { value: 2, text: 'More than half the days' },
              { value: 3, text: 'Nearly every day' },
            ],
          },
          {
            id: 2,
            question: 'How often have you had little interest or pleasure in doing things?',
            options: [
              { value: 0, text: 'Not at all' },
              { value: 1, text: 'Several days' },
              { value: 2, text: 'More than half the days' },
              { value: 3, text: 'Nearly every day' },
            ],
          },
        ],
      },
      {
        id: 'anxiety',
        title: 'Anxiety Screening',
        description: 'A brief assessment to help identify symptoms of anxiety',
        questions: [
          {
            id: 1,
            question: 'How often have you felt nervous, anxious, or on edge?',
            options: [
              { value: 0, text: 'Not at all' },
              { value: 1, text: 'Several days' },
              { value: 2, text: 'More than half the days' },
              { value: 3, text: 'Nearly every day' },
            ],
          },
        ],
      },
    ];

    res.json(assessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/mental-health/assessments/:id/submit
 * @desc    Submit mental health assessment
 * @access  Public
 */
router.post(
  '/assessments/:id/submit',
  [
    body('answers').isArray().withMessage('Answers must be an array'),
    body('answers.*.questionId').isInt().withMessage('Invalid question ID'),
    body('answers.*.value')
      .isInt({ min: 0, max: 3 })
      .withMessage('Invalid answer value'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { answers } = req.body;

      // Calculate total score
      const totalScore = answers.reduce((sum, a) => sum + a.value, 0);

      // Default result
      let result = {
        score: totalScore,
        level: 'low',
        recommendations: [],
      };

      if (id === 'depression') {
        if (totalScore >= 10) {
          result.level = 'severe';
          result.recommendations = [
            'Consider seeking professional help immediately',
            'Contact a mental health professional',
            'Reach out to trusted friends or family',
          ];
        } else if (totalScore >= 5) {
          result.level = 'moderate';
          result.recommendations = [
            'Consider speaking with a healthcare provider',
            'Practice stress management techniques',
            'Maintain regular sleep and exercise',
          ];
        } else {
          result.level = 'low';
          result.recommendations = [
            'Continue current self-care practices',
            'Maintain healthy lifestyle habits',
          ];
        }
      }

      res.json(result);
    } catch (error) {
      console.error('Submit assessment error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/mental-health/resources
 * @desc    Get mental health resources and services
 * @access  Public
 */
router.get('/resources', async (req, res) => {
  try {
    const resources = [
      {
        id: 1,
        name: 'Kitengela Mental Health Center',
        type: 'mental_health',
        phone: '+254700000000',
        address: 'Kitengela Town Center',
        services: ['Counseling', 'Group Therapy', 'Crisis Support'],
        is24Hours: false,
      },
      {
        id: 2,
        name: 'National Suicide Prevention Hotline',
        type: 'crisis',
        phone: '+254700000001',
        address: 'N/A',
        services: ['Crisis Intervention', 'Suicide Prevention'],
        is24Hours: true,
      },
    ];

    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
