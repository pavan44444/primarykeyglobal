const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { addSubcategory, getSubcategories } = require("../controllers/quizSubCategoryController");

const router = express.Router();

router.post("/add", authMiddleware, addSubcategory);
router.get("/", authMiddleware, getSubcategories);

module.exports = router;
