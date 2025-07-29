const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

router.post('/companies', companyController.createCompany);
router.get('/Companies', companyController.getAllCompanies);

module.exports = router;
