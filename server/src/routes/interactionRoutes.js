const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/', interactionController.createInteraction);
router.get('/', interactionController.getInteractions);
router.delete('/', interactionController.deleteInteractions);

module.exports = router;
