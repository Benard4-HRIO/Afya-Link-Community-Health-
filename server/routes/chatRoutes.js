// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { handleChatMessage } = require('../controllers/chatController');

// Route for AI chatbot messages
router.post('/send', handleChatMessage);

module.exports = router;
