const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', contentController.getAllContent);
router.get('/:id', contentController.getContentById);

module.exports = router;
