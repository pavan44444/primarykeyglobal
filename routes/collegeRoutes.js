const express = require('express');
const router = express.Router();
const collegeController = require('../controllers/collegeController');

router.post('/colleges', collegeController.createCollege);
router.get('/colleges', collegeController.getAllColleges);

module.exports = router;
