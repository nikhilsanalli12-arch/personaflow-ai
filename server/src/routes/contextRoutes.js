const express = require('express');
const router = express.Router();
const contextController = require('../controllers/contextController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', contextController.getContext);
router.post('/', contextController.switchContext);

module.exports = router;
