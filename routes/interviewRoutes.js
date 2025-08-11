const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

// Add interview experience (only once)
router.post('/add', authMiddleware, interviewController.addExperience);

// Get all experiences for same college
router.get('/college', authMiddleware, interviewController.getExperiencesByCollege);

module.exports = router;
