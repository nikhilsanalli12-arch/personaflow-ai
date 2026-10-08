const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', personaController.getPersona);
router.post('/update', personaController.updatePersona);
router.post('/reset', personaController.resetPersona);
router.get('/timeline', personaController.getTimeline);
router.get('/changes', personaController.getChanges);
router.post('/toggle-behavioral', personaController.toggleBehavioral);

module.exports = router;
