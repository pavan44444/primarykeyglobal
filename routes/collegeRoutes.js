const express = require("express");
const router = express.Router();
const collegeController = require("../controllers/collegeController");

// GET /api/colleges/names
router.get("/names", collegeController.getCollegeNames);

module.exports = router;
