const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/users', adminController.listUsers);
router.get('/content', adminController.listContent);
router.post('/content', adminController.createContent);
router.get('/analytics', adminController.getSystemAnalytics);

module.exports = router;
