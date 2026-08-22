const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Get logged-in user's college leaderboard (ALL students)
router.get('/my-college', 
    authMiddleware, 
    leaderboardController.getMyCollegeLeaderboard
);

// Get specific college leaderboard
router.get('/:college_id', 
    authMiddleware, 
    leaderboardController.getCollegeLeaderboard
);

// Get all colleges leaderboard
router.get('/all/colleges', 
    authMiddleware, 
    leaderboardController.getAllCollegesLeaderboard
);

// Get user's rank
router.get('/user/rank', 
    authMiddleware, 
    leaderboardController.getUserRank
);

// Get user's quiz performance
router.get('/user/performance', 
    authMiddleware, 
    leaderboardController.getUserQuizPerformance
);

// Get college statistics
router.get('/stats/college', 
    authMiddleware, 
    leaderboardController.getCollegeStats
);

module.exports = router;