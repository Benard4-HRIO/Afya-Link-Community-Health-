const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const EducationContent = require('../models/EducationContent');

// ✅ Get all published education content (with optional filters)
router.get('/content', async (req, res) => {
  try {
    const { type, category, language, search } = req.query;

    const whereClause = {
      isPublished: true,
      ...(type && { type }),
      ...(category && { category }),
      ...(language && { language }),
      ...(search && {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } },
          { tags: { [Op.like]: `%${search}%` } }
        ]
      })
    };

    const contents = await EducationContent.findAll({
      where: whereClause,
      order: [['publishedAt', 'DESC']],
      limit: 30
    });

    if (contents.length === 0) {
      return res.status(404).json({
        message: 'No educational content found for your filters.'
      });
    }

    res.json(contents);
  } catch (error) {
    console.error('Error fetching education content:', error);
    res.status(500).json({ error: 'Failed to load educational content.' });
  }
});

// ✅ Get a single content item by ID
router.get('/content/:id', async (req, res) => {
  try {
    const content = await EducationContent.findByPk(req.params.id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Increment view count
    await content.increment('viewCount');
    res.json(content);
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    res.status(500).json({ error: 'Failed to fetch content details.' });
  }
});

module.exports = router;
