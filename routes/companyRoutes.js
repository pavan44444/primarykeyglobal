const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middleware/authMiddleware');

// Get companies visited to logged-in user's college
router.get('/college', authMiddleware, companyController.getCompaniesByCollege);
router.post('/upload', authMiddleware, companyController.uploadCompanies);
module.exports = router;
