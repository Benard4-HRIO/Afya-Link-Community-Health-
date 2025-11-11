const express = require('express');
const { body, query, validationResult } = require('express-validator');
const EducationContent = require('../models/EducationContent');
const { auth, adminAuth } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// ======================= DEBUG: Check database content =======================
router.get('/debug-content', async (req, res) => {
  try {
    const content = await EducationContent.findAll({
      limit: 20,
      attributes: ['id', 'title', 'type', 'category', 'language', 'isPublished']
    });
    
    console.log('📊 Database content count:', content.length);
    
    // Log each content item to see what's in the database
    content.forEach(item => {
      console.log(`📝 ${item.id}: ${item.title} (${item.type}) - Published: ${item.isPublished}`);
    });
    
    res.json({ 
      count: content.length,
      content: content.map(c => ({
        id: c.id,
        title: c.title,
        type: c.type,
        category: c.category,
        language: c.language,
        isPublished: c.isPublished
      }))
    });
  } catch (error) {
    console.error('Debug content error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ======================= GET /api/education/content =======================
// Fetch all education content with filters (category, type, search, etc.)
router.get(
  '/content',
  [
    query('category').optional().isIn(['hygiene', 'nutrition', 'sexual_health', 'mental_wellness', 'preventive_care', 'emergency']),
    query('type').optional().isIn(['article', 'video', 'quiz', 'infographic', 'guide']),
    query('language').optional().isIn(['en', 'sw']),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
    query('targetAge').optional().isIn(['children', 'teens', 'adults', 'elderly', 'all']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('search').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const {
        category,
        type,
        language = 'en',
        difficulty,
        targetAge,
        page = 1,
        limit = 20,
        search
      } = req.query;

      let whereClause = { isPublished: true, language };

      if (category) whereClause.category = category;
      if (type) whereClause.type = type;
      if (difficulty) whereClause.difficulty = difficulty;
      if (targetAge) whereClause.targetAge = targetAge;

      // ----------------------------
      // Dynamic search parsing
      // ----------------------------
      if (search) {
        const terms = search.toLowerCase().split(' ');

        const dynamicFilters = {};

        const validCategories = ['hygiene','nutrition','sexual_health','mental_wellness','preventive_care','emergency'];
        const validTypes = ['article','video','quiz','infographic','guide'];

        terms.forEach(term => {
          if (validCategories.includes(term)) dynamicFilters.category = term;
          if (validTypes.includes(term)) dynamicFilters.type = term;
        });

        whereClause = { ...whereClause, ...dynamicFilters };

        const searchPattern = `%${search}%`;
        whereClause[Op.or] = [
          { title: { [Op.like]: searchPattern } },
          { content: { [Op.like]: searchPattern } },
          { tags: { [Op.like]: searchPattern } }
        ];
      }

      const offset = (page - 1) * limit;

      const content = await EducationContent.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['publishedAt', 'DESC']]
      });

      console.log(`📁 Content API: Found ${content.count} items with filters:`, { language, category, type });
      
      res.json({
        content: content.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(content.count / limit),
          totalItems: content.count,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get education content error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ======================= GET /api/education/content/:id =======================
router.get('/content/:id', async (req, res) => {
  try {
    console.log(`🔍 Fetching content by ID: ${req.params.id}`);
    
    const content = await EducationContent.findByPk(req.params.id);
    
    if (!content) {
      console.log(`❌ Content not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Content not found' });
    }
    
    if (!content.isPublished) {
      console.log(`🚫 Content found but not published: ${req.params.id}`);
      return res.status(404).json({ message: 'Content not found' });
    }

    console.log(`✅ Content found: ${content.title} (ID: ${content.id})`);
    await content.increment('viewCount');
    
    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ======================= GET /api/education/categories =======================
router.get('/categories', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    
    console.log(`🏷️ Fetching categories for language: ${language}`);

    const categories = [
      {
        id: 'hygiene',
        name: language === 'sw' ? 'Usafi' : 'Hygiene',
        description: language === 'sw' ? 'Mafunzo ya usafi wa mwili na mazingira' : 'Personal and environmental hygiene education',
        contentCount: await EducationContent.count({ where: { category: 'hygiene', language, isPublished: true } })
      },
      {
        id: 'nutrition',
        name: language === 'sw' ? 'Lishe' : 'Nutrition',
        description: language === 'sw' ? 'Mafunzo ya lishe bora na chakula' : 'Healthy eating and nutrition education',
        contentCount: await EducationContent.count({ where: { category: 'nutrition', language, isPublished: true } })
      },
      {
        id: 'sexual_health',
        name: language === 'sw' ? 'Afya ya Uzazi' : 'Sexual Health',
        description: language === 'sw' ? 'Mafunzo ya afya ya uzazi na maumbile' : 'Reproductive and sexual health education',
        contentCount: await EducationContent.count({ where: { category: 'sexual_health', language, isPublished: true } })
      },
      {
        id: 'mental_wellness',
        name: language === 'sw' ? 'Afya ya Akili' : 'Mental Wellness',
        description: language === 'sw' ? 'Mafunzo ya afya ya akili na ustawi' : 'Mental health and wellness education',
        contentCount: await EducationContent.count({ where: { category: 'mental_wellness', language, isPublished: true } })
      },
      {
        id: 'preventive_care',
        name: language === 'sw' ? 'Ulinzi wa Kwanza' : 'Preventive Care',
        description: language === 'sw' ? 'Mafunzo ya ulinzi wa kwanza na kuzuia magonjwa' : 'Preventive healthcare and disease prevention',
        contentCount: await EducationContent.count({ where: { category: 'preventive_care', language, isPublished: true } })
      },
      {
        id: 'emergency',
        name: language === 'sw' ? 'Dharura' : 'Emergency',
        description: language === 'sw' ? 'Mafunzo ya huduma za dharura na usaidizi wa kwanza' : 'Emergency services and first aid education',
        contentCount: await EducationContent.count({ where: { category: 'emergency', language, isPublished: true } })
      }
    ];

    console.log(`✅ Categories loaded:`, categories.map(c => `${c.name} (${c.contentCount})`));
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ... KEEP ALL YOUR EXISTING OTHER ROUTES (POST, PUT, DELETE, QUIZZES, etc.) ...

module.exports = router;