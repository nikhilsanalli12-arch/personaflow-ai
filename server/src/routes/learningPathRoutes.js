const express = require('express');
const router = express.Router();
const learningPathController = require('../controllers/learningPathController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/path', learningPathController.getLearningPath);

module.exports = router;
