const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', quizController.getQuizzes);
router.get('/history', quizController.getHistory);
router.get('/:id', quizController.getQuizById);
router.post('/attempt', quizController.submitAttempt);

module.exports = router;
