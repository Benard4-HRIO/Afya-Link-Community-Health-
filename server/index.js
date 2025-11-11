// server/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path'); // ✅ ADD THIS
require('dotenv').config();
const { testConnection } = require('./config/database');

const app = express();

// ✅ Fix: Trust the proxy (important for express-rate-limit)
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// ------------------------------------
// Security & Middleware Configuration
// ------------------------------------
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ ADD THIS: Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// ------------------------------------
// Routes
// ------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/health-services', require('./routes/healthServices'));
app.use('/api/preventive-care', require('./routes/preventiveCare'));
app.use('/api/mental-health', require('./routes/mentalHealth'));
app.use('/api/education', require('./routes/education'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/admin', require('./routes/admin'));

// ✅ New Chat Route (for mental health chatbot)
app.use('/api/chat', require('./routes/chatRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ✅ ADD THIS: Catch-all handler for React Router
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// ------------------------------------
// Error Handling
// ------------------------------------
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// ------------------------------------
// Start Server
// ------------------------------------
const startServer = async () => {
  try {
    await testConnection(); // ✅ Test + sync DB before starting
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;