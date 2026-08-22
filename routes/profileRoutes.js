const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfilePicture } = require('../controllers/profileController');
const authenticateToken = require('../middleware/authMiddleware');

// Get user profile
router.get('/profile', authenticateToken, getProfile);

// Update user profile (email only)
router.put('/profile', authenticateToken, updateProfile);

// Upload profile picture
router.post('/profile/upload', authenticateToken, uploadProfilePicture);

module.exports = router;