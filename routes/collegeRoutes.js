const express = require('express');
const { 
  addCollege, 
  deleteCollege, 
  getAllColleges, 
  getUserCollege 
} = require('../controllers/collegeController');

// Import middleware
const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

// --- ADMIN ROUTES (Protected) ---
// Add a new college (Admin only)
router.post('/admin/add', checkAuth, checkAdmin, addCollege);

// Delete a college (Admin only)
router.delete('/admin/:id', checkAuth, checkAdmin, deleteCollege);

// Get all colleges (Admin only)
router.get('/admin/all', checkAuth, checkAdmin, getAllColleges);

// --- USER ROUTES (Protected) ---
// Get user's college
router.get('/my-college', checkAuth, getUserCollege);

// --- PUBLIC ROUTES (Optional) ---
// You might want to allow users to see all colleges when registering
// router.get('/all', getAllColleges);

module.exports = router;