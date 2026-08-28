const express = require('express');
const router = express.Router();
const streakController = require('../controllers/streakController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, streakController.getMyStreak);
router.get('/primarykey', streakController.getPrimaryKeyHolder); // public, no auth needed for display
router.get('/history', authMiddleware, streakController.getStreakHistory);
module.exports = router;