const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // ensure JWT is verified

// GET all users of the logged-in user's college
router.get('/users/college', authMiddleware, userController.getUsersByCollegeWithQuizStats);
//router.get('/profile', authMiddleware, userController.getUserProfile);

module.exports = router;
