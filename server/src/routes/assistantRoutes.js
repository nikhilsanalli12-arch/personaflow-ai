const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { assistantLimiter } = require('../middleware/rateLimiter');

router.use(authenticateToken);

router.post('/chat', assistantLimiter, assistantController.chat);

module.exports = router;
