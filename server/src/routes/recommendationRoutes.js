const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', recommendationController.getRecommendations);
router.post('/refresh', recommendationController.refreshRecommendations);
router.get('/comparison', recommendationController.getComparison);
router.post('/:id/feedback', recommendationController.submitFeedback);
router.post('/:id/open', recommendationController.openRecommendation);
router.post('/:id/dismiss', recommendationController.dismissRecommendation);

module.exports = router;
