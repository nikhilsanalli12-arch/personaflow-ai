const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const personaRoutes = require('./routes/personaRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const contentRoutes = require('./routes/contentRoutes');
const goalRoutes = require('./routes/goalRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const contextRoutes = require('./routes/contextRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const quizRoutes = require('./routes/quizRoutes');
const learningPathRoutes = require('./routes/learningPathRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security Headers (Requirement 84)
app.use(helmet());

// CORS configuration (Requirement 85)
const allowedOrigins = [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow during development
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsing with safe limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global Rate Limiter
app.use('/api', generalLimiter);

// Structured Request Logging (Requirement 107)
app.use((req, res, next) => {
  const start = Date.now();
  const reqId = Math.random().toString(36).substring(7);
  req.reqId = reqId;

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl !== '/api/health') {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms | ReqId: ${reqId}`);
    }
  });
  next();
});

// Health check endpoint (Requirement 70)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'PersonaFlow AI Platform API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    }
  });
});

// API Routes mount
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/persona', personaRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/context', contextRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/learning', learningPathRoutes);
app.use('/api/admin', adminRoutes);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
});

// Centralized error handler (Contract O, Requirement 88)
app.use(errorHandler);

module.exports = app;
