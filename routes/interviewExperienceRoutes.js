const express = require('express');
const router = express.Router();
const interviewExperienceController = require('../controllers/interviewExperienceController');
const checkAuth = require('../middleware/checkAuth');

// All experience routes require authentication
router.use(checkAuth);

// POST route to add a new interview experience
router.post('/', interviewExperienceController.addExperience);

// GET route to retrieve all interview experiences
router.get('/', interviewExperienceController.getAllExperiences);

// --- NEW ROUTE ---
// GET route to retrieve interview experiences from the user's own college
router.get('/my-college', interviewExperienceController.getExperiencesByMyCollege);

module.exports = router;

