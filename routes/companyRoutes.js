const express = require('express');
const { 
  addCompany, 
  deleteCompany, 
  getAllCompanies, 
  getCompanyById
} = require('../controllers/companyController');

// Import middleware
const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

// --- ADMIN ROUTES (Protected) ---
// Add a new company (Admin only)
router.post('/admin/add', checkAuth, checkAdmin, addCompany);

// Delete a company (Admin only)
router.delete('/admin/:id', checkAuth, checkAdmin, deleteCompany);

// Get all companies (Admin only)
router.get('/admin/all', checkAuth, checkAdmin, getAllCompanies);

// Get company by ID (Admin only)
router.get('/admin/:id', checkAuth, checkAdmin, getCompanyById);

// --- PUBLIC ROUTES (Optional) ---
// Get all companies (Public access)
router.get('/all', getAllCompanies);

// Get company by ID (Public access)
router.get('/:id', getCompanyById);

module.exports = router;